// Subscribe panel test for the classic site. Serves the repo root, stubs the
// Turnstile script and the Worker endpoint, and drives the real page.
// Run from the repo root: node scripts/verify-subscribe-ui.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const SHOTS = path.join(ROOT, ".qa-screens");
const PORT = 4190;
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
fs.mkdirSync(SHOTS, { recursive: true });

const TURNSTILE_STUB = `window.turnstile = {
  render(el, opts) {
    el.innerHTML = '<div style="height:65px;border:1px solid #bbb;display:flex;align-items:center;padding:0 12px;font-size:13px">Human check (test stub)</div>';
    window.__tsOpts = opts;
    setTimeout(() => opts.callback("stub-token"), 600);
    return "w1";
  },
  reset() { window.__tsResets = (window.__tsResets || 0) + 1; setTimeout(() => window.__tsOpts.callback("stub-token-2"), 30); },
};`;
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };

// Uses the installed Chrome. Set PW_CHANNEL=msedge (or "chromium" after `npx playwright install`) to change it.
const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || "chrome" });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function newPage({ viewport = { width: 1280, height: 800 }, mode = { status: 200 }, clock = false } = {}) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  const posts = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: TURNSTILE_STUB }));
  await page.route("https://subscribe.diwakaryadav.com.np/subscribe", (r) => {
    if (r.request().method() === "OPTIONS") return r.fulfill({ status: 204, headers: CORS });
    posts.push(JSON.parse(r.request().postData()));
    return r.fulfill({ status: mode.status, headers: { ...CORS, "content-type": "application/json" }, body: "{}" });
  });
  if (clock) await page.clock.install();
  return { ctx, page, errors, posts, mode };
}

const panel = (page) => page.locator(".sub-panel");
const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

// 1. Footer link, manual open, validation, success.
{
  const { ctx, page, errors, posts } = await newPage();
  // /contact/ never auto-opens, so the footer click is the only trigger here.
  await page.goto(`${BASE}/contact/`, { waitUntil: "load" });
  check("panel is closed on load", (await panel(page).count()) === 0);
  const link = page.locator(".sub-footer-link");
  check("footer link exists", (await link.count()) === 1);
  await link.click();
  await panel(page).waitFor();
  check("dialog has an accessible name", (await panel(page).getAttribute("aria-labelledby")) === "sub-title");
  const focused = await page.evaluate(() => { const a = document.activeElement; return `${a.tagName}|${a.getAttribute("name")}|${a.className}`; });
  check("name field has focus after a click on the link", focused === "INPUT|name|", focused);
  const submit = page.locator(".sub-submit");
  check("submit disabled before the human check", await submit.isDisabled());
  await page.waitForFunction(() => !document.querySelector(".sub-submit").disabled);
  check("submit enabled after the human check", await submit.isEnabled());

  await submit.click();
  check("empty name shows an error", (await page.locator(".sub-status").textContent()).includes("name"));
  await page.fill(".sub-panel input[name=name]", "Asha");
  await page.fill(".sub-panel input[name=email]", "not-an-email");
  await submit.click();
  check("bad email shows an error", (await page.locator(".sub-status").textContent()).includes("email"));
  check("no request sent for invalid input", posts.length === 0);

  await page.screenshot({ path: path.join(SHOTS, "subscribe-desktop-light.png") });
  await page.fill(".sub-panel input[name=email]", "asha@example.com");
  await submit.click();
  await page.locator(".sub-title", { hasText: "Thank you, Asha." }).waitFor();
  check("one request with name, email, source, token, empty honeypot",
    posts.length === 1 && posts[0].name === "Asha" && posts[0].email === "asha@example.com" && posts[0].source === "/contact/" && posts[0].turnstile === "stub-token" && posts[0].website === "",
    JSON.stringify(posts));
  check("state saved as subscribed", await page.evaluate(() => JSON.parse(localStorage.getItem("sub.v1")).state === "subscribed"));
  await page.screenshot({ path: path.join(SHOTS, "subscribe-desktop-thanks.png") });
  await page.getByRole("button", { name: "Close" }).click();
  check("panel closes after thanks", (await panel(page).count()) === 0);
  check("no console errors (flow 1)", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

// 2. Server errors keep the form and reset the check.
{
  const { ctx, page, posts } = await newPage({ mode: { status: 429 } });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.locator(".sub-footer-link").click();
  await page.waitForFunction(() => !document.querySelector(".sub-submit").disabled);
  await page.fill(".sub-panel input[name=name]", "Ravi");
  await page.fill(".sub-panel input[name=email]", "ravi@example.com");
  await page.locator(".sub-submit").click();
  await page.waitForFunction(() => document.querySelector(".sub-status")?.dataset.kind === "error");
  check("429 shows the rate-limit message", (await page.locator(".sub-status").textContent()).includes("Too many"));
  check("check was reset after the error", (await page.evaluate(() => window.__tsResets)) === 1);
  await page.waitForFunction(() => !document.querySelector(".sub-submit").disabled);
  check("form can be sent again", posts.length === 1 && (await page.locator(".sub-submit").isEnabled()));
  await ctx.close();
}

// 3. Dismiss: Not now and Escape both remember, and the panel stays away.
for (const how of ["Not now", "Escape"]) {
  const { ctx, page } = await newPage({ clock: true });
  await page.goto(`${BASE}/blog/free-ai-stack/`, { waitUntil: "load" });
  await page.clock.fastForward(26000);
  await panel(page).waitFor();
  check(`auto open after 25 s (${how} run)`, true);
  if (how === "Not now") await page.getByRole("button", { name: "Not now" }).click();
  else await page.keyboard.press("Escape");
  check(`${how} closes the panel`, (await panel(page).count()) === 0);
  check(`${how} saves dismissed`, await page.evaluate(() => JSON.parse(localStorage.getItem("sub.v1")).state === "dismissed"));
  await page.reload({ waitUntil: "load" });
  await page.clock.fastForward(30000);
  check(`${how}: no auto open on the next visit`, (await panel(page).count()) === 0);
  await page.evaluate(() => localStorage.setItem("sub.v1", JSON.stringify({ state: "dismissed", at: Date.now() - 22 * 86400000 })));
  await page.reload({ waitUntil: "load" });
  await page.clock.fastForward(30000);
  check(`${how}: asks again after 21 days`, (await panel(page).count()) === 1);
  await ctx.close();
}

// 4. No auto open on thank-you and contact; the scroll trigger works on a post.
for (const route of ["/thank-you/", "/contact/"]) {
  const { ctx, page } = await newPage({ clock: true });
  await page.goto(`${BASE}${route}`, { waitUntil: "load" });
  await page.clock.fastForward(60000);
  check(`no auto open on ${route}`, (await panel(page).count()) === 0);
  check(`footer link still on ${route}`, (await page.locator(".sub-footer-link").count()) === 1);
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(`${BASE}/blog/free-ai-stack/`, { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.6));
  await panel(page).waitFor({ timeout: 3000 });
  check("opens after a 50 percent scroll", true);
  await page.locator(".sub-footer-link").click();
  check("footer link focuses the name field when the panel is already open", await page.evaluate(() => document.activeElement?.getAttribute("name") === "name"));
  check("still one panel after the click", (await panel(page).count()) === 1);
  await ctx.close();
}

// 5. Mobile fit, dark theme contrast, honeypot placement.
{
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/blog/free-ai-stack/`, { waitUntil: "load" });
  await page.locator(".sub-footer-link").click();
  await page.waitForFunction(() => !document.querySelector(".sub-submit").disabled);
  const box = await panel(page).boundingBox();
  check("mobile panel sits inside the viewport with a margin", box.x >= 8 && box.x + box.width <= 390 - 8 && box.y + box.height <= 844 - 8, JSON.stringify(box));
  await page.screenshot({ path: path.join(SHOTS, "subscribe-mobile-light.png") });
  const trap = await page.locator(".sub-trap").boundingBox();
  check("honeypot is off screen", trap.x < -1000);

  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.waitForTimeout(400); // let the color transitions finish before reading computed colors
    const colors = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector(".sub-submit"));
      const p = getComputedStyle(document.querySelector(".sub-panel"));
      const t = getComputedStyle(document.querySelector(".sub-text"));
      const n = getComputedStyle(document.querySelector(".sub-note"));
      return { btnFg: s.color, btnBg: s.backgroundColor, panelBg: p.backgroundColor, text: t.color, note: n.color };
    });
    check(`${theme}: button text contrast >= 4.5`, contrast(colors.btnFg, colors.btnBg) >= 4.5, contrast(colors.btnFg, colors.btnBg).toFixed(2));
    check(`${theme}: body text contrast >= 4.5`, contrast(colors.text, colors.panelBg) >= 4.5, contrast(colors.text, colors.panelBg).toFixed(2));
    check(`${theme}: note text contrast >= 4.5`, contrast(colors.note, colors.panelBg) >= 4.5, contrast(colors.note, colors.panelBg).toFixed(2));
    if (theme === "dark") await page.screenshot({ path: path.join(SHOTS, "subscribe-mobile-dark.png") });
  }
  await ctx.close();
}

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
