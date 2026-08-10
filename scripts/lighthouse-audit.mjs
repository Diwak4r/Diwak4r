// Reusable Lighthouse audit runner.
// Usage: node scripts/lighthouse-audit.mjs <url> <label>
//   <url>   : target URL (e.g. http://127.0.0.1:8080/)
//   <label> : output label, writes reports/lighthouse-<label>.report.{json,html}
//             and reports/lighthouse-<label>.md (human summary)
//
// Relies on a locally-installed lighthouse (node_modules/.bin/lighthouse) and a
// cached Chromium supplied via CHROME_PATH (no browser download).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const url = process.argv[2];
const label = process.argv[3] || "site";
if (!url) {
  console.error("usage: node scripts/lighthouse-audit.mjs <url> <label>");
  process.exit(2);
}

const ROOT = process.cwd();
const CHROME =
  "C:/Users/acer/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";

// Resolve the Lighthouse CLI entry point across known layouts.
function resolveLighthouse() {
  if (process.env.LIGHTHOUSE_CLI && fs.existsSync(process.env.LIGHTHOUSE_CLI)) {
    return process.env.LIGHTHOUSE_CLI;
  }
  const candidates = [
    path.join(ROOT, "node_modules", ".bin", "lighthouse"),
    path.join(ROOT, "node_modules", "lighthouse", "lighthouse-cli", "index.js"),
    path.join(ROOT, "node_modules", "lighthouse", "cli.js"),
    path.join(ROOT, "node_modules", "lighthouse", "bin", "lighthouse.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}
const LH = resolveLighthouse();
if (!LH) {
  console.error("lighthouse not found in node_modules; install it first.");
  process.exit(3);
}
const useNode = LH.endsWith(".js");
const cmd = useNode ? process.execPath : LH;
const baseArgs = useNode ? [LH] : [];
const outBase = path.join(ROOT, "reports", `lighthouse-${label}`);

const args = [
  url,
  "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
  "--output=json",
  "--output=html",
  `--output-path=${outBase}`,
  "--locale=en",
  "--quiet",
  "--max-wait-for-load=60000",
  "--throttling-method=provided",
  "--view=false",
];

console.log(`[lighthouse] auditing ${url} -> ${outBase}.report.{json,html}`);
execFileSync(cmd, [...baseArgs, ...args], {
  stdio: "inherit",
  env: { ...process.env, CHROME_PATH: CHROME },
});

const jsonPath = `${outBase}.report.json`;
const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const cats = report.categories;
const audits = report.audits;

const score = (k) => (cats[k] ? Math.round(cats[k].score * 100) : null);
const num = (k) => (audits[k] && typeof audits[k].numericValue === "number"
  ? audits[k].numericValue
  : null);

const fmtMs = (v) => (v == null ? "n/a" : `${Math.round(v)} ms`);
const fmtS = (v) => (v == null ? "n/a" : `${(v / 1000).toFixed(2)} s`);

const metrics = [
  ["First Contentful Paint", "first-contentful-paint", fmtMs],
  ["Largest Contentful Paint", "largest-contentful-paint", fmtMs],
  ["Total Blocking Time", "total-blocking-time", fmtMs],
  ["Cumulative Layout Shift", "cumulative-layout-shift", (v) => (v == null ? "n/a" : v.toFixed(3))],
  ["Speed Index", "speed-index", fmtMs],
  ["Time to Interactive", "interactive", fmtMs],
  ["Server Response Time (TTFB)", "server-response-time", fmtMs],
  ["Total Weight", "total-byte-weight", (v) => (v == null ? "n/a" : `${(v / 1024).toFixed(0)} KB`)],
];

const lines = [];
lines.push(`# Lighthouse Audit — ${label}`);
lines.push("");
lines.push(`**URL:** ${url}`);
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push("");
lines.push("## Category Scores");
lines.push("");
lines.push("| Category | Score |");
lines.push("| --- | --- |");
lines.push(`| Performance | ${score("performance")} |`);
lines.push(`| Accessibility | ${score("accessibility")} |`);
lines.push(`| Best Practices | ${score("best-practices")} |`);
lines.push(`| SEO | ${score("seo")} |`);
lines.push("");
lines.push("## Core Web Vitals & Load Metrics");
lines.push("");
lines.push("| Metric | Value |");
lines.push("| --- | --- |");
for (const [name, key, fmt] of metrics) {
  lines.push(`| ${name} | ${fmt(num(key))} |`);
}
lines.push("");

// Top opportunities (diagnostics with numeric savings)
const opp = [];
for (const k of Object.keys(audits)) {
  const a = audits[k];
  if (a.details && a.details.type === "opportunity" && typeof a.numericValue === "number" && a.numericValue > 0) {
    opp.push({ title: a.title, wasted: a.numericValue, id: k });
  }
}
opp.sort((x, y) => y.wasted - x.wasted);
if (opp.length) {
  lines.push("## Top Opportunities (est. savings)");
  lines.push("");
  lines.push("| Opportunity | Est. Saving |");
  lines.push("| --- | --- |");
  for (const o of opp.slice(0, 12)) {
    lines.push(`| ${o.title} | ${fmtMs(o.wasted)} |`);
  }
  lines.push("");
}

fs.writeFileSync(`${outBase}.md`, lines.join("\n"));
console.log(`[lighthouse] summary written -> ${outBase}.md`);
console.log(
  `SCORES perf=${score("performance")} a11y=${score("accessibility")} bp=${score("best-practices")} seo=${score("seo")}`
);
