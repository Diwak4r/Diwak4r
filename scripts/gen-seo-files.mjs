// Builds sitemap.xml and llms.txt from the pages themselves, so both stay in step
// with the site. Run after adding or editing pages: `npm run seo`.
// Each page's canonical URL, <title>, meta description, and modified date are read
// from its HTML. The modified date comes from JSON-LD "dateModified", then
// article:modified_time, then the page's last git commit date.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.diwakaryadav.com.np";

const MAIN_PAGES = ["index.html", "about/index.html", "projects/index.html", "blog/index.html", "contact/index.html"];
const blogPosts = readdirSync(join(ROOT, "blog"))
  .filter((d) => statSync(join(ROOT, "blog", d)).isDirectory() && existsSync(join(ROOT, "blog", d, "index.html")))
  .map((d) => `blog/${d}/index.html`);

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const pick = (html, re) => (html.match(re) || [])[1];

function gitDate(file) {
  try {
    return execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT }).toString().trim();
  } catch {
    return "";
  }
}

function readPage(file) {
  const html = readFileSync(join(ROOT, file), "utf8");
  const canonical = pick(html, /<link rel="canonical" href="([^"]+)"/) || `${SITE}/${file.replace(/index\.html$/, "")}`;
  const title = decode((pick(html, /<title>([^<]+)<\/title>/) || "").replace(/\s*\|\s*Diwakar Ray Yadav\s*$/, ""));
  const description = decode(pick(html, /<meta name="description"\s+content="([^"]+)"/) || "");
  const modified =
    pick(html, /"dateModified":\s*"([0-9-]{10})/) ||
    pick(html, /<meta property="article:modified_time" content="([0-9-]{10})/) ||
    gitDate(file) ||
    new Date().toISOString().slice(0, 10);
  const published = pick(html, /"datePublished":\s*"([0-9-]{10})/) || modified;
  return { file, canonical, title, description, modified, published };
}

const main = MAIN_PAGES.map(readPage);
const posts = blogPosts.map(readPage).sort((a, b) => b.published.localeCompare(a.published));

// sitemap.xml
const urls = [...main, ...posts]
  .map((p) => `  <url>\n    <loc>${p.canonical}</loc>\n    <lastmod>${p.modified}</lastmod>\n  </url>`)
  .join("\n");
writeFileSync(
  join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  "utf8"
);

// llms.txt (format: https://llmstxt.org)
const line = (p) => `- [${p.title}](${p.canonical}): ${p.description}`;
const llms = `# Diwakar Ray Yadav

> BIT student in Kathmandu, Nepal. Growth Intern at Springbase AI. Tests new AI models by building things with them and writes about AI tools, models, and agents in plain English.

Diwakar started in office work (NEPSE share trading and IT support), moved into AI through The Mindsnack, and built Nepal AI Gateway, a free OpenAI-compatible AI API for developers in Nepal that needs no international card. He posts model tests and one-file Three.js builds on X as @Norwakar.

## Pages

${main.map(line).join("\n")}

## Blog posts

${posts.map(line).join("\n")}

## Projects and profiles

- [Nepal AI Gateway](https://ai.diwakaryadav.com.np/): A free AI API for developers in Nepal, OpenAI-compatible, no card needed.
- [DiwakarOS](https://www.os.diwakaryadav.com.np/): The macOS-desktop version of this portfolio, running in the browser.
- [GitHub](https://github.com/Diwak4r): Source code for his projects.
- [X (@Norwakar)](https://x.com/Norwakar): AI model tests, builds, and news.

## Optional

- [RSS feed](${SITE}/feed.xml): Latest blog posts.
- [Sitemap](${SITE}/sitemap.xml): Every page on the site.
`;
writeFileSync(join(ROOT, "llms.txt"), llms, "utf8");

// feed.xml (RSS 2.0), newest first
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rssDate = (d) => new Date(`${d.length === 7 ? d + "-01" : d}T00:00:00Z`).toUTCString();
const items = posts
  .map((p) => {
    const html = readFileSync(join(ROOT, p.file), "utf8");
    const section = decode(pick(html, /"articleSection":\s*"([^"]+)"/) || "AI");
    const pub = pick(html, /"datePublished":\s*"([0-9-]{7,10})"/) || p.published;
    return `    <item>
      <title>${xml(p.title)}</title>
      <link>${p.canonical}</link>
      <guid>${p.canonical}</guid>
      <pubDate>${rssDate(pub)}</pubDate>
      <description>${xml(p.description)}</description>
      <category>${xml(section)}</category>
    </item>`;
  })
  .join("\n\n");
writeFileSync(
  join(ROOT, "feed.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Diwakar Ray Yadav Blog</title>
    <link>${SITE}/blog/</link>
    <description>What I learn from testing AI tools and building with them.</description>
    <language>en</language>
    <lastBuildDate>${rssDate(posts.map((p) => p.modified).sort().pop())}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />

${items}
  </channel>
</rss>
`,
  "utf8"
);

console.log(`sitemap.xml: ${main.length + posts.length} URLs`);
console.log(`feed.xml: ${posts.length} posts`);
console.log(`llms.txt: ${main.length} pages, ${posts.length} posts`);
