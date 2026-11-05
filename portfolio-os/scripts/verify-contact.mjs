// Contact and Notes app test for DiwakarOS. Serves out/ (run `npm run build` first),
// stubs Turnstile and the Worker, and drives the real desktop.
// Run from portfolio-os/: node scripts/verify-contact.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(process.cwd(), "out");
const PORT = 4196;
const BASE = `http://127.0.0.1:${PORT}/`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) { res.writeHead(404); res.end("nf"); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const stub = (behavior) => `window.turnstile = {
  render(el, opts) {
    el.innerHTML = '<div style="height:40px;color:#ccc">Human check (test stub)</div>';
    window.__renders = (window.__renders || 0) + 1;
    if ("${behavior}" === "pass") setTimeout(() => opts.callback("stub-token"), 300);
    if ("${behavior}" === "fail") setTimeout(() => opts["error-callback"](), 100);
    return "w" + window.__renders;
  },
  reset() {},
  remove() { window.__removed = (window.__removed || 0) + 1; },
};`;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

const browser = await chromium.launch({ headless: true });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function desktop({ turnstile = "pass", status = 200 } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const posts = [];
  const blocked = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: stub(turnstile) }));
  await page.route("https://cloudflareinsights.com/**", (r) => r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" } }));
  await page.route("https://formsubmit.co/**", (r) => { blocked.push(r.request().url()); return r.abort(); });
  await page.route("https://subscribe.diwakaryadav.com.np/contact", (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    posts.push(JSON.parse(r.request().postData()));
    return r.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: "{}" });
  });
  await page.addInitScript(() => {
    if (window.top !== window) return;
    sessionStorage.clear();
    localStorage.removeItem("dios-experience-coach-seen");
    localStorage.setItem("dios-consent-v1", JSON.stringify({ analytics: false, at: Date.now() }));
    localStorage.setItem("dios-subscribe-v1", JSON.stringify({ state: "subscribed", at: Date.now() }));
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter Portfolio" }).click();
  await page.locator('nav[aria-label="Dock"]').waitFor({ state: "visible", timeout: 10000 });
  const about = page.getByRole("dialog", { name: "About Me" }).last();
  await about.waitFor({ state: "visible", timeout: 5000 });
  await about.getByRole("button", { name: "Close window" }).click();
  await about.waitFor({ state: "hidden", timeout: 5000 });
  return { ctx, page, errors, posts, blocked };
}

async function openApp(page, name, title) {
  await page.locator('nav[aria-label="Dock"]').getByRole("button", { name: /(?:Open|Focus) Launchpad$/ }).first().click();
  await page.getByRole("dialog", { name: "Launchpad" }).last().getByRole("button", { name, exact: true }).click();
  const win = page.getByRole("dialog", { name: title }).last();
  await win.waitFor({ state: "visible", timeout: 5000 });
  return win;
}

async function fillContact(win) {
  await win.getByLabel("Name").fill("Rita");
  await win.getByLabel("From").fill("rita@example.com");
  await win.getByLabel("Purpose").selectOption("Freelance Work");
  await win.getByLabel("Subject").fill("A small project");
  await win.getByLabel("Message").fill("Hello Diwakar,\nCan we talk?");
}

// Contact app: good send, then the thank-you view.
{
  const { ctx, page, errors, posts, blocked } = await desktop();
  const win = await openApp(page, "Contact", "New Message");
  check("Contact form has no formsubmit.co action", (await win.locator("form").getAttribute("action")) === null);
  await fillContact(win);
  await win.getByRole("button", { name: "Send Message" }).click();
  await win.getByText("Thank you, Rita.").waitFor({ timeout: 6000 });
  check("one post to the Worker", posts.length === 1, String(posts.length));
  const p = posts[0] || {};
  check("body has source, fields and token", p.source === "os-contact" && p.name === "Rita" && p.email === "rita@example.com" && p.purpose === "Freelance Work" && p.subject === "A small project" && p.message === "Hello Diwakar,\nCan we talk?" && p.turnstile === "stub-token", JSON.stringify(p));
  check("honeypot is sent empty", p.website === "", JSON.stringify(p.website));
  check("nothing went to formsubmit.co", blocked.length === 0);
  check("the widget is removed after the check", (await page.evaluate(() => window.__removed)) >= 1);
  check("no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// Contact app: empty form is blocked by the browser, Worker error keeps the text and offers email.
{
  const { ctx, page, posts } = await desktop({ status: 500 });
  const win = await openApp(page, "Contact", "New Message");
  await win.getByRole("button", { name: "Send Message" }).click();
  await page.waitForTimeout(400);
  check("empty form sends nothing", posts.length === 0);
  await fillContact(win);
  await win.getByRole("button", { name: "Send Message" }).click();
  await win.getByText(/did not go through/).waitFor({ timeout: 6000 });
  check("error offers the email address", (await win.locator('a[href^="mailto:"]').getAttribute("href")) === "mailto:Diwak4r.comp@gmail.com");
  check("typed message is kept", (await win.getByLabel("Message").inputValue()).includes("Can we talk"));
  check("button works again", await win.getByRole("button", { name: "Send Message" }).isEnabled());
  await ctx.close();
}

// Contact app: rate limit wording, and a failed human check sends nothing.
{
  const { ctx, page } = await desktop({ status: 429 });
  const win = await openApp(page, "Contact", "New Message");
  await fillContact(win);
  await win.getByRole("button", { name: "Send Message" }).click();
  await win.getByText(/Try again in an hour/).waitFor({ timeout: 6000 });
  check("429 says to try in an hour", true);
  await ctx.close();
}
{
  const { ctx, page, posts } = await desktop({ turnstile: "fail" });
  const win = await openApp(page, "Contact", "New Message");
  await fillContact(win);
  await win.getByRole("button", { name: "Send Message" }).click();
  await win.getByText(/did not go through/).waitFor({ timeout: 6000 });
  check("failed human check sends nothing", posts.length === 0);
  await ctx.close();
}

// Notes app: send a note with no name or email.
{
  const { ctx, page, errors, posts, blocked } = await desktop();
  const win = await openApp(page, "Notes", "Notes");
  const send = win.getByRole("button", { name: "Send to Diwakar" });
  check("Send is disabled while the note is empty", await send.isDisabled());
  await win.getByLabel("Notes").fill("Nice site.\nSecond line.");
  await send.click();
  await win.getByText("Sent to Diwakar").waitFor({ timeout: 6000 });
  check("one post to the Worker", posts.length === 1, String(posts.length));
  const p = posts[0] || {};
  check("note body has source and text only", p.source === "os-note" && p.message === "Nice site.\nSecond line." && p.turnstile === "stub-token" && !p.name && !p.email, JSON.stringify(p));
  check("nothing went to formsubmit.co", blocked.length === 0);
  await win.getByLabel("Notes").fill("Nice site. More.");
  check("editing the note clears the sent message", (await win.getByText("Notes stay private unless you send one.").count()) === 1);
  check("no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// Notes app: a Worker error, and a note over the limit.
{
  const { ctx, page, posts } = await desktop({ status: 500 });
  const win = await openApp(page, "Notes", "Notes");
  await win.getByLabel("Notes").fill("Hello");
  await win.getByRole("button", { name: "Send to Diwakar" }).click();
  await win.getByText(/Couldn't send/).waitFor({ timeout: 6000 });
  check("Notes shows an error on a 500", true);
  await win.getByLabel("Notes").fill("x".repeat(5001));
  const before = posts.length;
  await win.getByRole("button", { name: "Send to Diwakar" }).click();
  await win.getByText(/Too long to send/).waitFor({ timeout: 3000 });
  check("a note over 5000 characters is not sent", posts.length === before);
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
