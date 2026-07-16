const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = '.qa-screens';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function toLines(arr) {
  return arr.map(e => `${e.type}: ${e.text}`);
}

async function check(page, url, slug) {
  console.log('Checking', url);
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({type: msg.type(), text: msg.text()}));
  page.on('pageerror', err => consoleLogs.push({type: 'pageerror', text: err.message}));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const screenshot = path.join(OUT, `${slug}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  const metrics = await page.evaluate(() => ({
    title: document.title,
    faviconHref: document.querySelector('link[rel*="icon"]')?.href || null,
    hasHeroWebP: !!document.querySelector('picture source[type="image/webp"]'),
    lcpImg: document.querySelector('img[fetchpriority="high"]')?.currentSrc || null,
    theme: document.documentElement.getAttribute('data-theme') || 'unset',
  }));
  return { url, screenshot, metrics, consoleLogs };
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const results = [];
  const base = 'https://diwakaryadav.com.np';

  for (const { slug, path: p } of [
    { slug: 'home', path: '/' },
    { slug: 'blog-trending-llms', path: '/blog/trending-llms/' },
    { slug: 'about', path: '/about/' },
    { slug: 'projects', path: '/projects/' },
    { slug: 'contact', path: '/contact/' },
    { slug: 'blog', path: '/blog/' },
  ]) {
    const page = await ctx.newPage();
    try {
      const r = await check(page, base + p, slug);
      results.push(r);
    } catch (e) {
      results.push({ url: base + p, screenshot: null, metrics: { error: e.message }, consoleLogs: [] });
    } finally {
      await page.close();
    }
  }
  await browser.close();

  const manifest = results.map(r => ({
    ...r,
    consoleLogs: r.consoleLogs.slice(0, 30),
    screenshot: r.screenshot ? r.screenshot.replace(/\\/g, '/') : null,
  }));
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
})();
