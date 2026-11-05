// Contact form test for the classic site. Serves the repo root, stubs the Turnstile
// script and the Worker endpoint, and drives the real /contact/ page.
// Run from the repo root: node scripts/verify-contact-ui.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const PORT = 4191;
const BASE = `http://127.0.0.1:${PORT}`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, p === "/" ? "index.html" : path.join(p, "index.html"));
  if (!fs.existsSync(file)) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

// "pass" gives a token after 300 ms. "fail" reports a failed check. "never" gives nothing.
const stub = (behavior) => `window.turnstile = {
  render(el, opts) {
    el.innerHTML = '<div id="ts-stub" data-behavior="${behavior}">Human check (test stub)</div>';
    window.__tsRenders = (window.__tsRenders || 0) + 1;
    if ("${behavior}" === "pass") setTimeout(() => opts.callback("stub-token"), 300);
    if ("${behavior}" === "fail") setTimeout(() => opts["error-callback"](), 100);
    return "w" + window.__tsRenders;
  },
  remove() { window.__tsRemoved = (window.__tsRemoved || 0) + 1; },
};`;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || "chrome" });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function open({ turnstile = "pass", worker = { status: 200 } } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const posts = [];
  const blocked = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: stub(turnstile) }));
  await page.route("https://formsubmit.co/**", (r) => { blocked.push(r.request().url()); return r.abort(); });
  await page.route("https://subscribe.diwakaryadav.com.np/contact", (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    posts.push(JSON.parse(r.request().postData()));
    if (worker.abort) return r.abort();
    return r.fulfill({ status: worker.status, headers: { ...CORS, "content-type": "application/json" }, body: "{}" });
  });
  await page.addInitScript(() => localStorage.setItem("consent.v1", JSON.stringify({ analytics: false, at: Date.now() })));
  await page.goto(`${BASE}/contact/`, { waitUntil: "load" });
  return { ctx, page, errors, posts, blocked };
}

async function fill(page, extra = {}) {
  await page.fill("#name", extra.name ?? "Rita");
  await page.fill("#email", extra.email ?? "rita@example.com");
  await page.selectOption("#purpose", "Freelance Work");
  await page.fill("#subject", "A small project");
  await page.fill("#message", extra.message ?? "Hello Diwakar,\nCan we talk about a project?");
}

// 1. The form no longer points at formsubmit.co.
{
  const { ctx, page } = await open();
  const action = await page.getAttribute("#contact-form", "action");
  const html = await page.content();
  check("form has no action, so it cannot leave the page by itself", action === null, String(action));
  check("page has no formsubmit.co address", !html.includes("formsubmit.co"));
  await ctx.close();
}

// 2. Native validation blocks an empty submit and sends nothing.
{
  const { ctx, page, posts } = await open();
  await page.click('#contact-form button[type="submit"]');
  await page.waitForTimeout(400);
  check("empty form sends nothing", posts.length === 0);
  check("empty form shows no status", (await page.textContent("#contact-status")) === "");
  await ctx.close();
}

// 3. A good submit posts the right body, then moves to the thank-you page.
{
  const { ctx, page, errors, posts, blocked } = await open();
  await fill(page);
  await Promise.all([page.waitForURL(`${BASE}/thank-you/`, { timeout: 8000 }), page.click('#contact-form button[type="submit"]')]);
  check("one post to the Worker", posts.length === 1, String(posts.length));
  const p = posts[0] || {};
  check("body has source, fields and token", p.source === "site-contact" && p.name === "Rita" && p.email === "rita@example.com" && p.purpose === "Freelance Work" && p.subject === "A small project" && p.message === "Hello Diwakar,\nCan we talk about a project?" && p.turnstile === "stub-token", JSON.stringify(p));
  check("honeypot is sent empty", p.website === "", JSON.stringify(p.website));
  check("nothing went to formsubmit.co", blocked.length === 0, blocked.join(","));
  check("no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 4. While it works the button is locked and the label changes; a double click posts once.
{
  const { ctx, page, posts } = await open();
  await fill(page);
  const btn = page.locator('#contact-form button[type="submit"]');
  await btn.click();
  await page.waitForTimeout(100);
  check("button is disabled and says Sending", (await btn.isDisabled()) && (await btn.textContent()) === "Sending");
  check("status tells about the human check", /human/i.test(await page.textContent("#contact-status")));
  await page.waitForURL(`${BASE}/thank-you/`, { timeout: 8000 });
  check("only one post", posts.length === 1, String(posts.length));
  await ctx.close();
}

// 5. The Worker answers 500: the visitor sees an error and a mail link, the form keeps the text.
{
  const { ctx, page } = await open({ worker: { status: 500 } });
  await fill(page);
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('#contact-status[data-kind="error"]', { timeout: 5000 });
  const text = await page.textContent("#contact-status");
  check("error says it did not go through", /did not go through/.test(text), text);
  check("error offers the email address", (await page.getAttribute("#contact-status a", "href")) === "mailto:Diwak4r.comp@gmail.com");
  check("the typed message is still there", (await page.inputValue("#message")).includes("Can we talk"));
  check("button works again", await page.locator('#contact-form button[type="submit"]').isEnabled());
  check("page did not leave /contact/", page.url() === `${BASE}/contact/`);
  await ctx.close();
}

// 6. Rate limit gets its own wording.
{
  const { ctx, page } = await open({ worker: { status: 429 } });
  await fill(page);
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('#contact-status[data-kind="error"]', { timeout: 5000 });
  check("429 says to try in an hour", /hour/.test(await page.textContent("#contact-status")));
  await ctx.close();
}

// 7. The network call fails (Worker unreachable).
{
  const { ctx, page } = await open({ worker: { abort: true } });
  await fill(page);
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('#contact-status[data-kind="error"]', { timeout: 5000 });
  check("unreachable Worker shows the error and mail link", (await page.locator("#contact-status a").count()) === 1);
  await ctx.close();
}

// 8. The human check fails: no post, clear error.
{
  const { ctx, page, posts } = await open({ turnstile: "fail" });
  await fill(page);
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('#contact-status[data-kind="error"]', { timeout: 5000 });
  check("failed human check sends nothing", posts.length === 0);
  check("the widget is cleaned up", (await page.evaluate(() => window.__tsRemoved)) >= 1);
  await ctx.close();
}

// 9. A retry after an error runs a fresh check and succeeds.
{
  const { ctx, page, posts } = await open();
  let first = true;
  await page.unroute("https://subscribe.diwakaryadav.com.np/contact");
  await page.route("https://subscribe.diwakaryadav.com.np/contact", (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    posts.push(JSON.parse(r.request().postData()));
    const status = first ? 500 : 200;
    first = false;
    return r.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: "{}" });
  });
  await fill(page);
  await page.click('#contact-form button[type="submit"]');
  await page.waitForSelector('#contact-status[data-kind="error"]', { timeout: 5000 });
  await Promise.all([page.waitForURL(`${BASE}/thank-you/`, { timeout: 8000 }), page.click('#contact-form button[type="submit"]')]);
  check("retry posts again and reaches the thank-you page", posts.length === 2, String(posts.length));
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
