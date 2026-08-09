// Main static-site verification: serves the repo root and exercises every
// local route with Playwright (console/page errors, exactly-one <h1>, no local
// 4xx/5xx) plus mobile-menu aria-expanded sync and whole-site link integrity.
// Run with: node scripts/verify-main-site.mjs   (from repo root)
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const PORT = 4189;
const TYPES = { ".html":"text/html",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon",".json":"application/json",".xml":"application/xml",".txt":"text/plain",".webmanifest":"application/manifest+json" };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(new URL(req.url,"http://x").pathname);
  let file = path.join(ROOT,p);
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()) file = path.join(ROOT, p==="/"?"index.html":path.join(p,"index.html"));
  if(!fs.existsSync(file)){res.writeHead(404);res.end("nf");return;}
  res.writeHead(200,{"Content-Type":(TYPES[path.extname(file)]||"application/octet-stream")});
  fs.createReadStream(file).pipe(res);
});
await new Promise((r)=>server.listen(PORT,r));

const routes=["/","/projects/","/about/","/blog/","/blog/trending-llms/","/blog/prompting-tips/","/contact/","/thank-you/","/404.html"];
const browser=await chromium.launch({headless:true});
const results=[];const check=(n,p,d="")=>results.push({n,p:Boolean(p),d});

for(const route of routes){
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  const cerr=[],perr=[],bad=[];
  page.on("console",m=>m.type()==="error"&&cerr.push(m.text()));
  page.on("pageerror",e=>perr.push(e.message));
  page.on("response",r=>{const u=r.url();if(u.includes(`127.0.0.1:${PORT}`)&&r.status()>=400)bad.push(`${r.status()} ${u}`);});
  const resp=await page.goto(`http://127.0.0.1:${PORT}${route}`,{waitUntil:"networkidle"}).catch(()=>null);
  const status=resp?resp.status():"ERR";
  const h1=await page.locator("h1").count();
  check(`${route} → HTTP ${status}`,status===200,`status ${status}`);
  check(`${route} exactly one <h1>`,h1===1,`${h1} h1`);
  check(`${route} no console errors`,cerr.length===0,cerr.join(" | "));
  check(`${route} no uncaught page errors`,perr.length===0,perr.join(" | "));
  check(`${route} no local 4xx/5xx`,bad.length===0,bad.join(" | "));
  await ctx.close();
}

// Mobile menu aria-expanded sync (shared js on every page)
{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await page.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:"networkidle"});
  const btn=page.locator(".mobile-menu-btn");
  const before=await btn.getAttribute("aria-expanded");
  await btn.click(); await page.waitForTimeout(200);
  const afterOpen=await btn.getAttribute("aria-expanded");
  const open=await page.locator(".nav-links").evaluate(el=>el.classList.contains("nav-links-open")).catch(()=>false);
  await btn.click(); await page.waitForTimeout(200);
  const afterClose=await btn.getAttribute("aria-expanded");
  check("mobile-menu aria-expanded starts false",before==="false",`${before}`);
  check("mobile-menu aria-expanded → true on open",afterOpen==="true",`${afterOpen}`);
  check("mobile-menu nav opens (class toggled)",open,`${open}`);
  check("mobile-menu aria-expanded → false on close",afterClose==="false",`${afterClose}`);
  await page.close();
}

// Whole-site internal link + asset integrity (root-resolved for absolute paths;
// the portfolio-os export and node_modules are separate roots and excluded).
const htmlFiles=[];
for(const f of fs.readdirSync(ROOT,{recursive:true})){
  const full=path.join(ROOT,f);
  if(/portfolio-os|node_modules|\.task|\.next/.test(f))continue;
  if(fs.statSync(full).isFile()&&f.endsWith(".html"))htmlFiles.push(full);
}
const broken=[];
for(const f of htmlFiles){
  const html=fs.readFileSync(f,"utf8");
  for(const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
    const ref=m[1];
    if(/^(https?:|mailto:|tel:|#|data:)/.test(ref))continue;
    const clean=ref.split("#")[0].split("?")[0];
    if(!clean)continue;
    const target=ref.startsWith("/")?path.join(ROOT,clean):path.join(path.dirname(f),clean);
    if(!fs.existsSync(target))broken.push(`${path.relative(ROOT,f)} → ${ref}`);
  }
}
check("All internal HTML local refs resolve",broken.length===0,broken.slice(0,10).join(" | "));

await browser.close();server.close();
const passed=results.filter(r=>r.p).length;
console.log("\n=== MAIN SITE VERIFICATION ===");
for(const r of results)console.log(`${r.p?"PASS":"FAIL"} — ${r.n}${r.d?" ("+r.d+")":""}`);
console.log(`\n${passed}/${results.length} passed`);
if(passed!==results.length)process.exitCode=1;
