// Consent and analytics test for DiwakarOS. Serves out/ (run `npm run build` first),
// swaps in a test GA4 ID, fakes the Google script, and checks that nothing
// reaches Google before the visitor accepts.
// Run from portfolio-os/: node scripts/verify-consent.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(process.cwd(), "out");
const SHOTS = path.resolve(process.cwd(), ".qa-screens");
const PORT = 4196;
const BASE = `http://127.0.0.1:${PORT}/`;
const TEST_ID = "G-TEST123456";
const KEY = "dios-consent-v1";
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

const browser = await chromium.launch({ headless: true });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function desktop({ configured = true, state = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  const googleRequests = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => /googletagmanager|google-analytics|doubleclick/.test(r.url()) && googleRequests.push(r.url()));
  await page.route("**/_next/static/**/*.js", async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    await route.fulfill({ response: res, body: body.split("G-VQ46XM74M1").join(configured ? TEST_ID : "G-REPLACE_ME") });
  });
  await page.route("https://www.googletagmanager.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: "window.__gtagLoaded = (window.__gtagLoaded || 0) + 1;" }));
  await page.route("https://www.diwakaryadav.com.np/**", (r) => r.fulfill({ contentType: "text/html", body: "<h1>privacy stub</h1>" }));
  await page.addInitScript(([key, saved]) => {
    if (window.top !== window) return;
    sessionStorage.clear();
    localStorage.removeItem("dios-experience-coach-seen");
    if (saved && !sessionStorage.getItem("seeded")) { localStorage.setItem(key, JSON.stringify(saved)); sessionStorage.setItem("seeded", "1"); }
  }, [KEY, state]);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Enter Portfolio" }).click();
  await page.locator('nav[aria-label="Dock"]').waitFor({ state: "visible", timeout: 10000 });
  const about = page.getByRole("dialog", { name: "About Me" }).last();
  await about.waitFor({ state: "visible", timeout: 5000 });
  await about.getByRole("button", { name: "Close window" }).click();
  await about.waitFor({ state: "hidden", timeout: 5000 });
  return { ctx, page, errors, googleRequests };
}

const banner = (page) => page.getByRole("dialog", { name: "Analytics cookies" });
const events = (page) => page.evaluate(() => Array.from(window.dataLayer || [], (a) => Array.from(a)));
const names = async (page) => (await events(page)).filter((e) => e[0] === "event").map((e) => `${e[1]}:${e[2].app ?? e[2].link_domain ?? e[2].source ?? ""}`);
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
const openMenu = async (page) => { await page.mouse.click(1000, 720, { button: "right" }); };
const dockOpen = (page, name) => page.locator('nav[aria-label="Dock"]').getByRole("button", { name: new RegExp(`(?:Open|Focus) ${name}$`) }).first().click();

// A: not configured. Banner stays away, menu has Privacy Note only.
{
  const { ctx, page, googleRequests } = await desktop({ configured: false });
  await page.waitForTimeout(2500);
  check("unconfigured: no banner", (await banner(page).count()) === 0);
  check("unconfigured: no Google request", googleRequests.length === 0);
  await openMenu(page);
  check("unconfigured: menu has Privacy Note", await page.getByText("Privacy Note", { exact: true }).isVisible());
  check("unconfigured: menu has no Cookie Settings", (await page.getByText("Cookie Settings", { exact: true }).count()) === 0);
  await ctx.close();
}

// C starts early: nobody answers the banner, so the subscribe nudge must wait.
const C = await desktop();
const nudge = (page) => page.locator('aside[aria-label="Newsletter"]');

// B: accept, then events.
{
  const { ctx, page, googleRequests, errors } = await desktop();
  await banner(page).waitFor({ timeout: 5000 });
  check("banner opens after about a second", true);
  check("no Google request while the question is open", googleRequests.length === 0);
  check("no _ga cookie before a choice", !(await page.evaluate(() => document.cookie)).includes("_ga"));
  const same = await page.evaluate(() => {
    const [a, b] = [...document.querySelectorAll('[role="dialog"][aria-labelledby="consent-title"] button')].filter((n) => /Accept|No thanks/.test(n.textContent)).map((n) => n.className);
    return a === b;
  });
  check("Accept and No thanks share one style", same);
  await page.screenshot({ path: path.join(SHOTS, "os-consent-banner.png") });

  await banner(page).getByRole("button", { name: "Read the privacy note" }).click();
  check("privacy note opens as a window", await page.getByRole("dialog", { name: "Privacy" }).last().isVisible({ timeout: 5000 }).catch(() => false));
  check("still no Google request after reading the note", googleRequests.length === 0);

  await banner(page).getByRole("button", { name: "Accept analytics" }).click();
  await page.waitForFunction(() => window.__gtagLoaded === 1);
  check("accepted: gtag requested with the measurement ID", googleRequests.some((u) => u.includes(`id=${TEST_ID}`)), googleRequests.join(","));
  const layer = await events(page);
  const def = layer.find((e) => e[0] === "consent" && e[1] === "default");
  check("ad storage, ad user data and ad personalization denied", def?.[2].ad_storage === "denied" && def[2].ad_user_data === "denied" && def[2].ad_personalization === "denied", JSON.stringify(def));
  const config = layer.find((e) => e[0] === "config");
  check("config has Google signals off", config?.[1] === TEST_ID && config[2].allow_google_signals === false, JSON.stringify(config));
  check("choice saved as accepted", (await stored(page)).analytics === true);

  await dockOpen(page, "Terminal");
  await page.getByRole("dialog", { name: "diwakar@portfolio" }).last().waitFor();
  const seen = await names(page);
  check("opening Terminal is recorded as app_open", seen.includes("app_open:terminal"), seen.join(","));
  check("the privacy window opened before the choice was not recorded", !seen.some((n) => n.startsWith("link_click")), seen.join(","));
  await dockOpen(page, "Browser");
  await page.getByRole("dialog", { name: "Browser" }).last().waitFor();
  check("a window opened after accepting is recorded", (await names(page)).includes("app_open:browser"));

  // Withdraw through the desktop menu.
  await page.evaluate(() => { document.cookie = "_ga=GA1.1.1.1; path=/"; document.cookie = "_ga_TEST123456=GS1; path=/"; });
  const before = (await events(page)).length;
  await openMenu(page);
  await page.getByText("Cookie Settings", { exact: true }).click();
  await banner(page).waitFor({ timeout: 3000 });
  check("Cookie Settings reopens the banner", true);
  await banner(page).getByRole("button", { name: "No thanks" }).click();
  check("withdrawn: _ga cookies deleted", !(await page.evaluate(() => document.cookie)).includes("_ga"));
  check("withdrawn: choice saved as declined", (await stored(page)).analytics === false);
  check("withdrawn: Google disable flag set", await page.evaluate((id) => window["ga-disable-" + id] === true, TEST_ID));
  await dockOpen(page, "Settings");
  await page.getByRole("dialog", { name: "System Settings" }).last().waitFor();
  check("withdrawn: later app opens are not recorded", (await events(page)).length === before);
  check("no console errors (accept path)", errors.filter((e) => !e.includes("open-meteo")).length === 0, errors.join(" | "));
  await ctx.close();
}

// D: decline from the start.
{
  const { ctx, page, googleRequests } = await desktop();
  await banner(page).waitFor({ timeout: 5000 });
  await banner(page).getByRole("button", { name: "No thanks" }).click();
  check("declined: choice saved", (await stored(page)).analytics === false);
  await dockOpen(page, "Terminal");
  await page.getByRole("dialog", { name: "diwakar@portfolio" }).last().waitFor();
  check("declined: no Google request", googleRequests.length === 0);
  check("declined: no events", (await names(page)).length === 0);
  await ctx.close();
}

// E: returning visitor who accepted.
{
  const { ctx, page, googleRequests } = await desktop({ state: { analytics: true, at: Date.now() } });
  await page.waitForFunction(() => window.__gtagLoaded === 1);
  await page.waitForTimeout(2000);
  check("returning accepter: no banner", (await banner(page).count()) === 0);
  check("returning accepter: Google loaded once", googleRequests.length === 1);
  await ctx.close();
}

// C result: the nudge waited for an answer.
await C.page.waitForTimeout(40000);
check("subscribe nudge waits while the consent question is open", (await nudge(C.page).count()) === 0);
await banner(C.page).getByRole("button", { name: "No thanks" }).click();
await nudge(C.page).waitFor({ timeout: 3000 });
check("subscribe nudge appears once the choice is made", true);
await C.page.screenshot({ path: path.join(SHOTS, "os-consent-then-nudge.png") });
check("no console errors (waiting desktop)", C.errors.filter((e) => !e.includes("open-meteo")).length === 0, C.errors.join(" | "));
await C.ctx.close();

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
