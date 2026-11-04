// Visit-counter test for the classic site. Serves the repo root, captures the beacon
// that js/landing.js sends to the Worker, and checks what is and is not counted.
// Run from the repo root: node scripts/verify-landing.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const PORT = 4198;
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

const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || "chrome" });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function visit(url, { referer, automated = false, then } = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const beacons = [];
  if (!automated) await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  await page.route("https://subscribe.diwakaryadav.com.np/hit", (r) => {
    beacons.push({ body: JSON.parse(r.request().postData()), type: r.request().headers()["content-type"] });
    return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
  });
  await page.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: "" }));
  await page.goto(`${BASE}${url}`, { waitUntil: "load", referer });
  await page.waitForTimeout(700);
  if (then) await then(page);
  const result = { beacons, landing: await page.evaluate(() => document.documentElement.getAttribute("data-landing")), cookie: await page.evaluate(() => document.cookie), storage: await page.evaluate(() => localStorage.length + sessionStorage.length) };
  await ctx.close();
  return result;
}

let v = await visit("/?utm_source=X&utm_medium=Social&utm_campaign=bio");
check("the decision is recorded on the page: sent", v.landing === "sent", String(v.landing));
check("a campaign link sends one beacon with source, medium, campaign and path",
  v.beacons.length === 1 && v.beacons[0].body.source === "X" && v.beacons[0].body.medium === "Social" && v.beacons[0].body.campaign === "bio" && v.beacons[0].body.path === "/", JSON.stringify(v.beacons));
check("the beacon is a plain-text POST, so it needs no preflight", v.beacons[0]?.type?.startsWith("text/plain"), v.beacons[0]?.type);
check("it sets no cookie and writes no storage", v.cookie === "" && v.storage === 0, `cookie=${v.cookie} storage=${v.storage}`);

v = await visit("/blog/free-ai-stack/", { referer: "https://t.co/abc123" });
check("a referrer without a tag sends the site name only", v.beacons.length === 1 && v.beacons[0].body.source === "t.co" && v.beacons[0].body.campaign === "" && v.beacons[0].body.path === "/blog/free-ai-stack/", JSON.stringify(v.beacons));

v = await visit("/", { referer: "https://www.linkedin.com/feed/" });
check("www is stripped from the referrer site", v.beacons[0]?.body.source === "linkedin.com", JSON.stringify(v.beacons));

v = await visit("/");
check("a direct visit is counted once with an empty source", v.beacons.length === 1 && v.beacons[0].body.source === "", JSON.stringify(v.beacons));

v = await visit("/", { referer: "https://www.diwakaryadav.com.np/blog/" });
check("an own-site referrer records skip-own-referrer", v.landing === "skip-own-referrer", String(v.landing));
check("a move from the main site is not counted", v.beacons.length === 0, JSON.stringify(v.beacons));
v = await visit("/", { referer: "https://www.os.diwakaryadav.com.np/" });
check("a move from DiwakarOS is not counted", v.beacons.length === 0, JSON.stringify(v.beacons));

v = await visit("/?utm_source=x&utm_medium=social", { then: (page) => page.reload({ waitUntil: "load" }).then(() => page.waitForTimeout(700)) });
check("a reload is not counted again", v.beacons.length === 1, String(v.beacons.length));

v = await visit("/?utm_source=x", { then: async (page) => { await page.locator('a[href="/about/"]').first().click(); await page.waitForLoadState("load"); await page.waitForTimeout(700); } });
check("clicking to another page of the site is not counted", v.beacons.length === 1, String(v.beacons.length));

v = await visit("/?utm_source=x", { automated: true });
check("an automated browser is not counted", v.beacons.length === 0, JSON.stringify(v.beacons));

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
