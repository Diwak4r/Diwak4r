// Zero-dependency performance + quality auditor.
// Drives the cached Chromium via the Chrome DevTools Protocol (CDP) — the same
// tracing engine Lighthouse uses — to compute real Core Web Vitals and load
// metrics, plus static SEO / accessibility / best-practices checks.
//
// Usage: node scripts/perf-audit.mjs <url> <label> [runs]
//   writes a report to the system temp dir (always reliable) and attempts a
//   best-effort detached copy into reports/perf-<label>.md (+ .json).
//
// Requires Node 22+ (global WebSocket) and a Chromium executable.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const url = process.argv[2];
const label = process.argv[3] || "site";
const RUNS = Math.max(1, parseInt(process.argv[4] || "3", 10) || 3);
if (!url) {
  console.error("usage: node scripts/perf-audit.mjs <url> <label> [runs]");
  process.exit(2);
}

const CHROME =
  "C:/Users/acer/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Windows Defender real-time scanning intermittently locks files in reports/
// during overwrite (EPERM), and a sync fs call on a locked file can BLOCK
// (never throw). So: write to the temp dir (always reliable), then kick off a
// DETACHED copy into reports/ so a blocked syscall can't stall the audit.
async function safeWrite(reportsPath, tmpPath) {
  try {
    const cp = spawn(
      "cmd",
      ["/c", `copy /Y "${tmpPath}" "${reportsPath}" >nul`],
      { detached: true, stdio: "ignore" }
    );
    cp.unref();
  } catch {}
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this._queue = [];
    this._open = false;
    this._openPromise = new Promise((resolve) => {
      this._resolveOpen = resolve;
    });
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)(msg);
        this.pending.delete(msg.id);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
    ws.onopen = () => {
      this._open = true;
      for (const q of this._queue) this.ws.send(q);
      this._queue = [];
      this._resolveOpen();
    };
    ws.onerror = () => {};
  }
  opened() {
    return this._openPromise;
  }
  send(method, params = {}, sessionId = null) {
    return new Promise((resolve) => {
      const id = ++this.id;
      this.pending.set(id, resolve);
      const payload = JSON.stringify(
        sessionId ? { id, method, params, sessionId } : { id, method, params }
      );
      if (this._open) this.ws.send(payload);
      else this._queue.push(payload);
    });
  }
  async eventOnce(method, timeoutMs = 60000) {
    const start = Date.now();
    return new Promise((resolve) => {
      const check = () => {
        const ev = this.events.find((e) => e.method === method);
        if (ev) return resolve(ev);
        if (Date.now() - start > timeoutMs) return resolve(null);
        setTimeout(check, 100);
      };
      check();
    });
  }
}

function collectTracingMetrics(traceEvents, docUrl) {
  let navigationStart = null;
  let fcp = null;
  let lcp = null;
  let cls = 0;
  const longTasks = [];
  let mainReqSent = null;
  let mainResStart = null;

  const matchesDoc = (u) =>
    typeof u === "string" && (u === docUrl || u.startsWith(docUrl) || docUrl.startsWith(u));

  // requestId -> send timestamp (ResourceReceiveResponse has no URL, only id)
  const sendTsById = {};

  for (const e of traceEvents) {
    const n = e.name;
    const a = e.args || {};
    const d = a.data || {};
    if (n === "navigationStart") {
      if (navigationStart === null) navigationStart = e.ts;
    }
    if (n === "firstContentfulPaint" && fcp === null) fcp = e.ts;
    if (n === "largestContentfulPaint::Candidate") {
      if (d.size > 0) lcp = { ts: e.ts, size: d.size };
    }
    if (n === "LayoutShift") {
      if (d && !d.had_recent_input) cls += d.score || 0;
    }
    if ((n === "RunTask" || n === "EvaluateScript" || n === "FunctionCall") && e.ph === "X" && e.dur > 50000) {
      longTasks.push({ ts: e.ts, dur: e.dur });
    }
    if (n === "ResourceSendRequest") {
      if (d.requestId) sendTsById[d.requestId] = e.ts;
      if (d.url && d.url === docUrl && mainReqSent === null) mainReqSent = e.ts;
    }
    if (n === "ResourceReceiveResponse" && d.requestId && mainResStart === null) {
      if (sendTsById[d.requestId] !== undefined && sendTsById[d.requestId] === mainReqSent) {
        mainResStart = e.ts;
      }
    }
  }

  // Fallback anchor: when tracing starts before the real navigation (about:blank
  // initial load), the navigationStart trace event is absent. Use the main
  // document's first request as the navigation baseline.
  if (navigationStart === null && mainReqSent !== null) {
    navigationStart = mainReqSent;
  }

  const micro = (ts) => (ts != null && navigationStart != null ? (ts - navigationStart) / 1000 : null);

  const fcpTs = fcp;
  const endTs = lcp ? lcp.ts : navigationStart;
  let tbt = 0;
  for (const t of longTasks) {
    if (fcpTs != null && t.ts < fcpTs) continue;
    if (endTs != null && t.ts > endTs) continue;
    tbt += Math.max(0, t.dur / 1000 - 50);
  }

  const ttfb =
    mainReqSent != null && mainResStart != null
      ? (mainResStart - mainReqSent) / 1000
      : null;

  return {
    fcp: micro(fcpTs),
    lcp: lcp ? micro(lcp.ts) : null,
    cls: Math.round(cls * 1000) / 1000,
    tbt: Math.round(tbt),
    ttfb: ttfb != null ? Math.round(ttfb) : null,
  };
}

// Run one full audit against a fresh Chromium instance.
async function auditOnce(docUrl) {
  const userData = fs.mkdtempSync(path.join(os.tmpdir(), "lh-chrome-"));
  const chromeProc = spawn(
    CHROME,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      `--user-data-dir=${userData}`,
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  let devtoolsUrl = null;
  const onOut = (c) => {
    const m = c.toString().match(/ws:\/\/[0-9a-zA-Z.:]+\/devtools\/browser\/[0-9a-f-]+/);
    if (m) devtoolsUrl = m[0];
  };
  chromeProc.stdout.on("data", onOut);
  chromeProc.stderr.on("data", onOut);

  const cleanup = () => {
    try { chromeProc.kill("SIGKILL"); } catch {}
  };

  try {
    for (let i = 0; i < 60 && !devtoolsUrl; i++) await sleep(200);
    if (!devtoolsUrl) throw new Error("Chrome DevTools WebSocket URL never appeared");

    const ws = new WebSocket(devtoolsUrl);
    const cdp = new CDP(ws);
    await cdp.opened();

    const gt = await cdp.send("Target.getTargets");
    const targetInfos = gt.result ? gt.result.targetInfos : [];
    let pageTarget = targetInfos.find((t) => t.type === "page");
    if (!pageTarget) {
      const ct = await cdp.send("Target.createTarget", { url: "about:blank" });
      pageTarget = { targetId: ct.result.targetId };
    }
    const at = await cdp.send("Target.attachToTarget", {
      targetId: pageTarget.targetId,
      flatten: true,
    });
    const sessionId = at.result.sessionId;
    const ses = (method, params = {}) => cdp.send(method, params, sessionId);

    await ses("Page.enable");
    await ses("Performance.enable");
    await ses("Runtime.enable");

    // Deterministic desktop viewport (Chrome's default headless viewport
    // varies between runs, which skews tap-target / layout metrics).
    await ses("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await ses("Tracing.start", {
      categories:
        "devtools.timeline,devtools.timeline.frame,blink,loading,netlog,v8,renderer,scheduler,toplevel",
      options: "recordAsMuchAsPossible",
      transferMode: "ReportEvents",
    });

    await ses("Page.navigate", { url: docUrl });
    await cdp.eventOnce("Page.loadEventFired", 30000);
    await sleep(2500);
    // Wait for web fonts to settle so layout (and therefore tap-target
    // measurements) are stable rather than mid-font-swap.
    await ses("Runtime.evaluate", {
      expression: "((document.fonts && document.fonts.ready) || Promise.resolve())",
      awaitPromise: true,
      returnByValue: true,
    }).catch(() => {});

    const evalResp = await ses("Runtime.evaluate", {
      expression: `(function(){
        var d=document;
        var imgs=[].slice.call(d.images);
        var vw=d.querySelector('meta[name=viewport]');
        var desc=d.querySelector('meta[name=description]');
        var canonical=d.querySelector('link[rel=canonical]');
        var title=d.querySelector('title');
        var h1s=d.querySelectorAll('h1').length;
        var lang=d.documentElement.lang;
        var insecure=location.protocol!=='https:';
        var tapTargets=d.querySelectorAll('a,button,input,select,textarea');
        var smallTapEls=[].slice.call(tapTargets).filter(function(el){
          var r=el.getBoundingClientRect(); return (r.width>0&&r.width<48)||(r.height>0&&r.height<48);
        });
        return {
          title: title?title.textContent.trim():'',
          h1: h1s, hasViewport: !!vw, viewportContent: vw?vw.getAttribute('content'):'',
          hasDescription: !!desc, description: desc?desc.getAttribute('content'):'',
          hasCanonical: !!canonical, lang: lang, insecure: insecure,
          imgCount: imgs.length, imgMissingAlt: imgs.filter(function(i){return !i.alt;}).length,
          missingAltSrcs: imgs.filter(function(i){return !i.alt;}).map(function(i){return i.currentSrc||i.src;}),
          tapCount: tapTargets.length, smallTap: smallTapEls.length,
          smallTapEls: smallTapEls.map(function(el){
            return { tag: el.tagName.toLowerCase(),
              text: (el.textContent||'').trim().slice(0,40),
              href: el.getAttribute?el.getAttribute('href'):'' };
          }),
          docSize: document.documentElement.outerHTML.length,
          navTTFB: (function(){ var n=performance.getEntriesByType('navigation')[0]; return n?Math.round(n.responseStart-n.requestStart):null; })()
        };
      })()`,
      returnByValue: true,
    });

    const domRaw =
      evalResp.result && evalResp.result.result ? evalResp.result.result.value : null;
    const dom = domRaw || {
      title: "", h1: 0, hasViewport: false, viewportContent: "", hasDescription: false,
      description: "", hasCanonical: false, lang: "", insecure: false, imgCount: 0,
      imgMissingAlt: 0, tapCount: 0, smallTap: 0, docSize: 0,
    };

    await ses("Tracing.end", {});
    await cdp.eventOnce("Tracing.tracingComplete", 15000);
    await sleep(500);
    const traceEvents = cdp.events
      .filter((e) => e.method === "Tracing.dataCollected")
      .flatMap((e) => e.params.value || []);

    const m = collectTracingMetrics(traceEvents, docUrl);
    return { m, dom };
  } finally {
    cleanup();
  }
}

// Average numeric metric fields across runs (ignoring nulls).
function averageMetrics(runs) {
  const keys = ["fcp", "lcp", "cls", "tbt", "ttfb"];
  const out = {};
  for (const k of keys) {
    const vals = runs.map((r) => r.m[k]).filter((v) => v != null);
    out[k] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 1000) / 1000 : null;
  }
  return out;
}

async function run() {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    try {
      const r = await auditOnce(url);
      runs.push(r);
      console.error(`[perf] run ${i + 1}/${RUNS}: FCP=${r.m.fcp} LCP=${r.m.lcp} CLS=${r.m.cls} TBT=${r.m.tbt} TTFB=${r.m.ttfb}`);
    } catch (e) {
      console.error(`[perf] run ${i + 1}/${RUNS} failed: ${e.message}`);
    }
  }
  if (runs.length === 0) {
    console.error("audit failed: no successful runs");
    process.exit(1);
  }

  const m = averageMetrics(runs);
  const dom = runs[runs.length - 1].dom;

  // Prefer Navigation Timing API for TTFB (reliable across redirects); fall
  // back to the trace-derived value if unavailable.
  const ttfbVals = runs.map((r) => r.dom.navTTFB).filter((v) => v != null);
  if (ttfbVals.length) {
    m.ttfb = Math.round(ttfbVals.reduce((a, b) => a + b, 0) / ttfbVals.length);
  }

  let speedIndex = null;
  if (m.fcp != null && m.lcp != null) {
    speedIndex = Math.round(m.fcp + (m.lcp - m.fcp) * 0.65);
  } else if (m.lcp != null) {
    speedIndex = m.lcp;
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const perfScore = Math.round(
    clamp(
      100 -
        (m.fcp > 1800 ? 25 : 0) -
        (m.lcp > 2500 ? 30 : m.lcp > 1800 ? 12 : 0) -
        (m.tbt > 300 ? 25 : m.tbt > 150 ? 12 : 0) -
        (m.cls > 0.25 ? 15 : m.cls > 0.1 ? 7 : 0) -
        (m.ttfb > 800 ? 10 : 0),
      0,
      100
    )
  );
  const a11yScore = Math.round(
    clamp(
      100 -
        (dom.h1 === 0 ? 15 : 0) -
        (dom.hasViewport ? 0 : 15) -
        (dom.imgMissingAlt > 0 ? clamp(dom.imgMissingAlt * 3, 0, 25) : 0) -
        (dom.lang ? 0 : 10) -
        (dom.smallTap > 0 ? clamp(dom.smallTap * 2, 0, 15) : 0),
      0,
      100
    )
  );
  const seoScore = Math.round(
    clamp(
      100 -
        (dom.title ? 0 : 15) -
        (dom.hasDescription ? 0 : 15) -
        (dom.h1 === 0 ? 15 : 0) -
        (dom.hasCanonical ? 0 : 8) -
        (dom.insecure ? 20 : 0),
      0,
      100
    )
  );
  const bpScore = Math.round(
    clamp(100 - (dom.insecure ? 25 : 0) - (m.ttfb > 1200 ? 15 : 0), 0, 100)
  );

  const report = {
    url,
    label,
    generated: new Date().toISOString(),
    runs: runs.length,
    categories: {
      performance: perfScore,
      accessibility: a11yScore,
      "best-practices": bpScore,
      seo: seoScore,
    },
    metrics: {
      fcp: m.fcp,
      lcp: m.lcp,
      cls: m.cls,
      tbt: m.tbt,
      ttfb: m.ttfb,
      speedIndex,
    },
    dom,
  };

  const f = (v) => (v == null ? "n/a" : `${v} ms`);
  const lines = [];
  lines.push(`# Performance & Quality Audit — ${label}`);
  lines.push("");
  lines.push(`**URL:** ${url}`);
  lines.push(`**Generated:** ${report.generated}`);
  lines.push(`**Runs averaged:** ${runs.length}`);
  lines.push(`**Engine:** Chromium DevTools Protocol tracing (same measurement path Lighthouse uses)`);
  lines.push("");
  lines.push("## Category Scores (0–100)");
  lines.push("");
  lines.push("| Category | Score |");
  lines.push("| --- | --- |");
  lines.push(`| Performance | ${perfScore} |`);
  lines.push(`| Accessibility | ${a11yScore} |`);
  lines.push(`| Best Practices | ${bpScore} |`);
  lines.push(`| SEO | ${seoScore} |`);
  lines.push("");
  lines.push("## Core Web Vitals & Load Metrics (averaged)");
  lines.push("");
  lines.push("| Metric | Value | Target |");
  lines.push("| --- | --- | --- |");
  lines.push(`| First Contentful Paint | ${f(m.fcp)} | < 1800 ms |`);
  lines.push(`| Largest Contentful Paint | ${f(m.lcp)} | < 2500 ms |`);
  lines.push(`| Cumulative Layout Shift | ${m.cls} | < 0.1 |`);
  lines.push(`| Total Blocking Time | ${f(m.tbt)} | < 200 ms |`);
  lines.push(`| Time to First Byte | ${f(m.ttfb)} | < 800 ms |`);
  lines.push(`| Speed Index (est.) | ${f(speedIndex)} | < 3400 ms |`);
  lines.push("");
  lines.push("## Static Quality Findings");
  lines.push("");
  lines.push(`- <h1> count: **${dom.h1}** ${dom.h1 === 1 ? "✓" : "✗ (should be exactly 1)"}`);
  lines.push(`- viewport meta: **${dom.hasViewport ? "present" : "MISSING"}**`);
  lines.push(`- description meta: **${dom.hasDescription ? "present" : "MISSING"}**`);
  lines.push(`- canonical link: **${dom.hasCanonical ? "present" : "MISSING"}**`);
  lines.push(`- lang attribute: **${dom.lang || "MISSING"}**`);
  lines.push(`- images: **${dom.imgCount}** total, **${dom.imgMissingAlt}** missing alt`);
  lines.push(`- tap targets < 48px: **${dom.smallTap}** of ${dom.tapCount}`);
  if (dom.smallTapEls && dom.smallTapEls.length) {
    lines.push("");
    lines.push("**Small tap targets (< 48px) — detail:**");
    for (const t of dom.smallTapEls) {
      lines.push(`- \`<${t.tag}>\`${t.href ? ` href="${t.href}"` : ""} — "${t.text}"`);
    }
  }
  if (dom.missingAltSrcs && dom.missingAltSrcs.length) {
    lines.push("");
    lines.push("**Images missing alt — detail:**");
    for (const s of dom.missingAltSrcs) {
      lines.push(`- ${s}`);
    }
  }
  lines.push(`- HTTPS: **${dom.insecure ? "NO (insecure)" : "yes"}**`);
  lines.push("");
  lines.push("> Note: Speed Index is estimated from FCP/LCP when frame-level trace ");
  lines.push("> screenshots are unavailable; treat as indicative, not exact.");

  const tmpJson = path.join(os.tmpdir(), `perf-${label}.json`);
  const tmpMd = path.join(os.tmpdir(), `perf-${label}.md`);
  fs.writeFileSync(tmpJson, JSON.stringify(report, null, 2));
  fs.writeFileSync(tmpMd, lines.join("\n"));

  safeWrite(path.join(ROOT, "reports", `perf-${label}.json`), tmpJson);
  safeWrite(path.join(ROOT, "reports", `perf-${label}.md`), tmpMd);

  console.log(`[perf] ${label}: P=${perfScore} A=${a11yScore} BP=${bpScore} SEO=${seoScore}`);
  console.log(`[perf] FCP=${m.fcp} LCP=${m.lcp} CLS=${m.cls} TBT=${m.tbt} TTFB=${m.ttfb}`);
  console.log(`[perf] report (tmp) -> ${tmpMd}`);
  process.exit(0);
}

run().catch((e) => {
  console.error("audit failed:", e);
  process.exit(1);
});
