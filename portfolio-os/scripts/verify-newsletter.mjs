// Newsletter app and nudge test for DiwakarOS. Serves out/ (run `npm run build` first),
// stubs Turnstile and the Worker, and drives the real desktop.
// Run from portfolio-os/: node scripts/verify-newsletter.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(process.cwd(), "out");
const SHOTS = path.resolve(process.cwd(), ".qa-screens");
const PORT = 4195;
const BASE = `http://127.0.0.1:${PORT}/`;
const KEY = "dios-subscribe-v1";
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
fs.mkdirSync(SHOTS, { recursive: true });

const TURNSTILE_STUB = `window.turnstile = {
  render(el, opts) {
    el.innerHTML = '<div style="height:65px;width:300px;border:1px solid #555;display:flex;align-items:center;padding:0 12px;font-size:13px;color:#ccc">Human check (test stub)</div>';
    window.__opts = opts;
    setTimeout(() => opts.callback("stub-token"), 600);
    return "w1";
  },
  reset() { window.__resets = (window.__resets || 0) + 1; setTimeout(() => window.__opts.callback("stub-token-2"), 600); },
  remove() {},
};`;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

const browser = await chromium.launch({ headless: true });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function desktop(initialState = null, status = 200) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const posts = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: TURNSTILE_STUB }));
  await page.route("https://subscribe.diwakaryadav.com.np/subscribe", (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    posts.push(JSON.parse(r.request().postData()));
    return r.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: "{}" });
  });
  await page.addInitScript(([key, state]) => {
    if (window.top !== window) return;
    sessionStorage.clear();
    localStorage.removeItem("dios-experience-coach-seen");
    if (state && !sessionStorage.getItem("seeded")) { localStorage.setItem(key, JSON.stringify(state)); sessionStorage.setItem("seeded", "1"); }
  }, [KEY, initialState]);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter Portfolio" }).click();
  await page.locator('nav[aria-label="Dock"]').waitFor({ state: "visible", timeout: 10000 });
  // The welcome About window opens 650 ms after the desktop appears and would cover the app under test.
  const about = page.getByRole("dialog", { name: "About Me" }).last();
  await about.waitFor({ state: "visible", timeout: 5000 });
  await about.getByRole("button", { name: "Close window" }).click();
  await about.waitFor({ state: "hidden", timeout: 5000 });
  return { ctx, page, errors, posts };
}

const DAY = 86400000;
const stateOf = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);

// Four desktops start together, so the 45 s nudge delay is waited only once.
const A = await desktop(); // fresh visitor
const B = await desktop({ state: "subscribed", at: Date.now() });
const C = await desktop({ state: "dismissed", at: Date.now() - 2 * DAY });
const D = await desktop({ state: "dismissed", at: Date.now() - 22 * DAY });

// App window: open from Launchpad, validate, send.
{
  const { page, errors, posts } = B;
  await page.locator('nav[aria-label="Dock"]').getByRole("button", { name: /(?:Open|Focus) Launchpad$/ }).first().click();
  await page.getByRole("dialog", { name: "Launchpad" }).last().getByRole("button", { name: "Newsletter", exact: true }).click();
  const win = page.getByRole("dialog", { name: "Newsletter" }).last();
  check("Newsletter opens from Launchpad", await win.isVisible({ timeout: 5000 }).catch(() => false));
  const send = win.getByRole("button", { name: "Subscribe" });
  check("Subscribe is disabled before the human check", await send.isDisabled());
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent === "Subscribe" && !b.disabled));
  check("Subscribe unlocks after the human check", await send.isEnabled());

  await send.click();
  check("empty name shows an error", (await win.getByRole("status").textContent()).includes("name"));
  await win.getByLabel("Name").fill("Asha");
  await win.getByLabel("Email").fill("nope");
  await send.click();
  check("bad email shows an error", (await win.getByRole("status").textContent()).includes("email"));
  check("no request for invalid input", posts.length === 0);

  await page.screenshot({ path: path.join(SHOTS, "os-newsletter-window.png") });
  await win.getByLabel("Email").fill("asha@example.com");
  await send.click();
  await win.getByText("Thank you, Asha.").waitFor();
  check("one request with name, email, source os, token, empty honeypot",
    posts.length === 1 && posts[0].name === "Asha" && posts[0].email === "asha@example.com" && posts[0].source === "os" && posts[0].turnstile === "stub-token" && posts[0].website === "",
    JSON.stringify(posts));
  check("state saved as subscribed", (await stateOf(page)).state === "subscribed");
  check("no console errors while subscribing", errors.length === 0, errors.join(" | "));
}

// Server error keeps the form and resets the check.
{
  const { ctx, page, posts } = await desktop(null, 429);
  await page.locator('nav[aria-label="Dock"]').getByRole("button", { name: /(?:Open|Focus) Launchpad$/ }).first().click();
  await page.getByRole("dialog", { name: "Launchpad" }).last().getByRole("button", { name: "Newsletter", exact: true }).click();
  const win = page.getByRole("dialog", { name: "Newsletter" }).last();
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent === "Subscribe" && !b.disabled));
  await win.getByLabel("Name").fill("Ravi");
  await win.getByLabel("Email").fill("ravi@example.com");
  await win.getByRole("button", { name: "Subscribe" }).click();
  await win.getByText(/Too many tries/).waitFor();
  check("429 shows the rate-limit message", true);
  check("check reset after the error", (await page.evaluate(() => window.__resets)) === 1);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent === "Subscribe" && !b.disabled));
  check("form can be sent again", posts.length === 1);
  await ctx.close();
}

// Nudge timing: one wait for all four desktops.
await A.page.waitForTimeout(47000);
const banner = (page) => page.locator('aside[aria-label="Newsletter"]');
check("fresh visitor sees the banner after 45 s", await banner(A.page).isVisible());
check("subscribed visitor sees no banner", (await banner(B.page).count()) === 0);
check("visitor who dismissed 2 days ago sees no banner", (await banner(C.page).count()) === 0);
check("visitor who dismissed 22 days ago sees the banner", await banner(D.page).isVisible());
await A.page.screenshot({ path: path.join(SHOTS, "os-newsletter-banner.png") });

await banner(A.page).getByRole("button", { name: "Subscribe" }).click();
check("banner Subscribe opens the Newsletter window", await A.page.getByRole("dialog", { name: "Newsletter" }).last().isVisible({ timeout: 5000 }).catch(() => false));
const gone = (page) => banner(page).waitFor({ state: "detached", timeout: 3000 }).then(() => true, () => false); // exit animation first
check("banner closes after Subscribe", await gone(A.page));
check("state saved as dismissed", (await stateOf(A.page)).state === "dismissed");

const before = (await stateOf(D.page)).at;
await banner(D.page).getByRole("button", { name: "Not now" }).click();
check("Not now closes the banner", await gone(D.page));
check("Not now refreshes the dismissed date", (await stateOf(D.page)).at > before);

for (const [name, s] of [["A", A], ["B", B], ["C", C], ["D", D]]) {
  const real = s.errors.filter((e) => !e.includes("open-meteo"));
  check(`no console errors on desktop ${name}`, real.length === 0, real.join(" | "));
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
