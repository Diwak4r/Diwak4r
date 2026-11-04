// Consent and analytics test for the classic site. Serves the repo root, swaps in a
// test GA4 ID, fakes the Google script, and checks that nothing reaches Google
// before the visitor accepts.
// Run from the repo root: node scripts/verify-consent-ui.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const SHOTS = path.join(ROOT, ".qa-screens");
const PORT = 4192;
const BASE = `http://127.0.0.1:${PORT}`;
const TEST_ID = "G-TEST123456";
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
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || "chrome" });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function newPage({ configured = true, viewport = { width: 1280, height: 800 }, clock = false } = {}) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  const googleRequests = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => /googletagmanager|google-analytics|doubleclick/.test(r.url()) && googleRequests.push(r.url()));
  await page.route("**/js/consent.js", async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    await route.fulfill({ response: res, body: body.replace("G-VQ46XM74M1", configured ? TEST_ID : "G-REPLACE_ME") });
  });
  await page.route("https://www.googletagmanager.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: "window.__gtagLoaded = (window.__gtagLoaded || 0) + 1;" }));
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: `window.turnstile={render(el,o){setTimeout(()=>o.callback("t"),50);return "w"},reset(){}}` }));
  await page.route("https://subscribe.diwakaryadav.com.np/subscribe", (r) => {
    const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: cors });
    return r.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" }, body: "{}" });
  });
  if (clock) await page.clock.install();
  return { ctx, page, errors, googleRequests };
}

const events = (page) => page.evaluate(() => Array.from(window.dataLayer || [], (a) => Array.from(a)));
const eventNames = async (page) => (await events(page)).filter((e) => e[0] === "event").map((e) => e[1]);
const consentPanel = (page) => page.locator(".cns-panel");
const subPanel = (page) => page.locator(".sub-panel");
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("consent.v1")));
const luminance = (rgb) => { const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

// 1. Not configured: no banner, no Google, privacy link only.
{
  const { ctx, page, googleRequests } = await newPage({ configured: false });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(1800);
  check("unconfigured: no consent panel", (await consentPanel(page).count()) === 0);
  check("unconfigured: privacy link in footer", (await page.locator(".footer a.cns-footer-link").count()) === 1);
  check("unconfigured: no Cookie settings button", (await page.locator(".footer button.cns-footer-link").count()) === 0);
  check("unconfigured: no Google request", googleRequests.length === 0);
  await ctx.close();
}

// 2. Decline path: nothing reaches Google, and the subscribe panel waits for the choice.
{
  const { ctx, page, googleRequests, errors } = await newPage({ clock: true });
  await page.goto(`${BASE}/blog/free-ai-stack/`, { waitUntil: "load" });
  check("no consent panel at load", (await consentPanel(page).count()) === 0);
  await page.clock.fastForward(1300);
  await consentPanel(page).waitFor();
  check("consent panel opens after about a second", true);
  check("no Google request before a choice", googleRequests.length === 0);
  const cookiesBefore = await page.evaluate(() => document.cookie);
  check("no _ga cookie before a choice", !cookiesBefore.includes("_ga"), cookiesBefore);
  await page.clock.fastForward(26000);
  check("subscribe panel waits while consent is pending", (await subPanel(page).count()) === 0);
  await page.screenshot({ path: path.join(SHOTS, "consent-desktop.png") });

  const same = await page.evaluate(() => {
    const [a, b] = [...document.querySelectorAll(".cns-btn")].map((n) => { const s = getComputedStyle(n); return [s.backgroundColor, s.color, s.borderTopColor, s.borderTopWidth, s.fontSize, s.fontWeight, s.padding, s.width].join("|"); });
    return a === b;
  });
  check("Accept and No thanks have identical styling", same);

  await page.getByRole("button", { name: "No thanks" }).click();
  check("choice saved as declined", (await stored(page)).analytics === false);
  check("consent panel closes", (await consentPanel(page).count()) === 0);
  await subPanel(page).waitFor({ timeout: 3000 });
  check("subscribe panel opens once the choice is made", true);
  check("declined: no Google request", googleRequests.length === 0);
  check("declined: no analytics events", (await eventNames(page)).length === 0);
  check("no console errors (decline)", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 3. Accept path: Google loads, ad signals stay off, events flow.
{
  const { ctx, page, googleRequests, errors } = await newPage();
  await page.goto(`${BASE}/blog/free-ai-stack/`, { waitUntil: "load" });
  await consentPanel(page).waitFor();
  check("no Google request while the question is open", googleRequests.length === 0);
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await page.waitForFunction(() => window.__gtagLoaded === 1);
  check("accepted: gtag script requested with the measurement ID", googleRequests.some((u) => u.includes(`id=${TEST_ID}`)), googleRequests.join(","));
  const layer = await events(page);
  const consentDefault = layer.find((e) => e[0] === "consent" && e[1] === "default");
  check("ad storage, ad user data and ad personalization are denied", consentDefault?.[2].ad_storage === "denied" && consentDefault[2].ad_user_data === "denied" && consentDefault[2].ad_personalization === "denied", JSON.stringify(consentDefault));
  const config = layer.find((e) => e[0] === "config");
  check("config has Google signals off", config?.[1] === TEST_ID && config[2].allow_google_signals === false && config[2].allow_ad_personalization_signals === false, JSON.stringify(config));
  check("choice saved as accepted", (await stored(page)).analytics === true);

  // Link clicks: stop the navigation, keep the handler.
  await page.evaluate(() => document.addEventListener("click", (e) => { if (e.target.closest("a")) e.preventDefault(); }, true));
  await page.evaluate(() => { const a = document.createElement("a"); a.href = "https://github.com/Diwak4r"; a.textContent = "GitHub"; a.id = "t-link"; document.querySelector("article").appendChild(a); });
  await page.locator("#t-link").click();
  const click = (await events(page)).find((e) => e[0] === "event" && e[1] === "link_click");
  check("external link click is recorded with domain and text", click?.[2].link_domain === "github.com" && click[2].link_text === "GitHub" && click[2].page_path === "/blog/free-ai-stack/", JSON.stringify(click));

  // Reading depth.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  const depth = (await events(page)).filter((e) => e[0] === "event" && e[1] === "scroll_depth").map((e) => e[2].percent);
  check("scroll depth reports 25, 50, 75 and 100 once each", JSON.stringify(depth) === "[25,50,75,100]", JSON.stringify(depth));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  check("scroll depth does not repeat", (await eventNames(page)).filter((n) => n === "scroll_depth").length === 4);

  // Signup source.
  await page.locator(".sub-footer-link").click();
  await page.waitForFunction(() => !document.querySelector(".sub-submit")?.disabled);
  await page.fill(".sub-panel input[name=name]", "Asha");
  await page.fill(".sub-panel input[name=email]", "asha@example.com");
  await page.locator(".sub-submit").click();
  await page.locator(".sub-title", { hasText: "Thank you" }).waitFor();
  const names = await eventNames(page);
  check("subscribe_open and newsletter_signup are recorded", names.includes("subscribe_open") && names.includes("newsletter_signup"), names.join(","));
  const signup = (await events(page)).find((e) => e[1] === "newsletter_signup");
  check("signup event carries the source page", signup?.[2].source === "/blog/free-ai-stack/", JSON.stringify(signup));

  // Withdraw.
  await page.evaluate(() => { document.cookie = "_ga=GA1.1.1.1; path=/"; document.cookie = "_ga_TEST123456=GS1; path=/"; });
  const countBefore = (await events(page)).length;
  await page.getByRole("button", { name: "Cookie settings" }).click();
  await consentPanel(page).waitFor();
  await page.getByRole("button", { name: "No thanks" }).click();
  check("withdrawn: _ga cookies deleted", !(await page.evaluate(() => document.cookie)).includes("_ga"));
  check("withdrawn: choice saved as declined", (await stored(page)).analytics === false);
  check("withdrawn: Google disable flag set", await page.evaluate((id) => window["ga-disable-" + id] === true, TEST_ID));
  await page.locator("#t-link").click();
  check("withdrawn: later clicks are not recorded", (await events(page)).length === countBefore);
  check("no console errors (accept)", errors.length === 0, errors.join(" | "));

  // Reload after a withdrawal: stays quiet.
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1800);
  check("after a decline, reload shows no panel and no Google", (await consentPanel(page).count()) === 0 && googleRequests.filter((u) => u.includes("gtag/js")).length === 1);
  await ctx.close();
}

// 4. Returning visitor who accepted: Google loads at once, no banner.
{
  const { ctx, page, googleRequests } = await newPage();
  await page.addInitScript(() => localStorage.setItem("consent.v1", JSON.stringify({ analytics: true, at: Date.now() })));
  await page.goto(`${BASE}/about/`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__gtagLoaded === 1);
  await page.waitForTimeout(1500);
  check("returning accepter: no banner", (await consentPanel(page).count()) === 0);
  check("returning accepter: Google loaded", googleRequests.length === 1);
  await ctx.close();
}

// 5. Mobile fit and contrast in both themes.
{
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await consentPanel(page).waitFor();
  const box = await consentPanel(page).boundingBox();
  check("mobile panel sits inside the viewport", box.x >= 8 && box.x + box.width <= 382 && box.y + box.height <= 836, JSON.stringify(box));
  await page.screenshot({ path: path.join(SHOTS, "consent-mobile-light.png") });
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.waitForTimeout(400);
    const c = await page.evaluate(() => {
      const bg = getComputedStyle(document.querySelector(".cns-panel")).backgroundColor;
      const text = getComputedStyle(document.querySelector(".cns-text")).color;
      const btn = getComputedStyle(document.querySelector(".cns-btn"));
      return { bg, text, btnFg: btn.color, btnBg: btn.backgroundColor };
    });
    check(`${theme}: body text contrast >= 4.5`, contrast(c.text, c.bg) >= 4.5, contrast(c.text, c.bg).toFixed(2));
    check(`${theme}: button text contrast >= 4.5`, contrast(c.btnFg, c.btnBg) >= 4.5, contrast(c.btnFg, c.btnBg).toFixed(2));
    if (theme === "dark") await page.screenshot({ path: path.join(SHOTS, "consent-mobile-dark.png") });
  }
  await ctx.close();
}

// 6. Privacy page.
{
  const { ctx, page, errors } = await newPage();
  await page.goto(`${BASE}/privacy/`, { waitUntil: "load" });
  check("privacy page has one h1", (await page.locator("h1").count()) === 1);
  const text = await page.locator("main").innerText();
  check("privacy page names Google Analytics, Cloudflare and the newsletter", /Google Analytics/.test(text) && /Cloudflare/.test(text) && /Newsletter/.test(text));
  await page.waitForTimeout(1500);
  check("privacy page does not open the subscribe panel", (await subPanel(page).count()) === 0);
  check("privacy page has no console errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
