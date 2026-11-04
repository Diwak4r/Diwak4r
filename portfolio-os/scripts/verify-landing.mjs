// Visit-counter test for DiwakarOS. Serves out/ (run `npm run build` first), captures the
// beacon that lib/landing.ts sends to the Worker, and checks what is and is not counted.
// Run from portfolio-os/: node scripts/verify-landing.mjs
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(process.cwd(), "out");
const PORT = 4199;
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

const browser = await chromium.launch({ headless: true });
let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

async function visit(query, { referer, automated = false, reload = false } = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const beacons = [];
  if (!automated) await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  await page.route("https://subscribe.diwakaryadav.com.np/hit", (r) => {
    beacons.push({ body: JSON.parse(r.request().postData()), type: r.request().headers()["content-type"] });
    return r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
  });
  await page.route("https://cloudflareinsights.com/**", (r) => r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } }));
  await page.goto(`${BASE}${query}`, { waitUntil: "load", referer });
  await page.waitForTimeout(900);
  if (reload) { await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900); }
  const result = { beacons, cookie: await page.evaluate(() => document.cookie) };
  await ctx.close();
  return result;
}

let v = await visit("?utm_source=LinkedIn&utm_medium=Social&utm_campaign=bio");
check("a campaign link sends one beacon with source, medium, campaign and path",
  v.beacons.length === 1 && v.beacons[0].body.source === "LinkedIn" && v.beacons[0].body.medium === "Social" && v.beacons[0].body.campaign === "bio" && v.beacons[0].body.path === "/", JSON.stringify(v.beacons));
check("the beacon is a plain-text POST", v.beacons[0]?.type?.startsWith("text/plain"), v.beacons[0]?.type);
check("it sets no cookie", v.cookie === "", v.cookie);

v = await visit("", { referer: "https://t.co/abc123" });
check("a referrer without a tag sends the site name only", v.beacons.length === 1 && v.beacons[0].body.source === "t.co" && v.beacons[0].body.campaign === "", JSON.stringify(v.beacons));

v = await visit("");
check("a direct visit is counted once with an empty source", v.beacons.length === 1 && v.beacons[0].body.source === "", JSON.stringify(v.beacons));

v = await visit("", { referer: "https://www.diwakaryadav.com.np/" });
check("a move from the main site is not counted", v.beacons.length === 0, JSON.stringify(v.beacons));

v = await visit("?utm_source=x", { reload: true });
check("a reload is not counted again", v.beacons.length === 1, String(v.beacons.length));

v = await visit("?utm_source=x", { automated: true });
check("an automated browser is not counted", v.beacons.length === 0, JSON.stringify(v.beacons));

await browser.close();
server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
