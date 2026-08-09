// Verifies the blog posts for SEO/slop compliance.
// Checks: exactly one <h1>, no em dash, valid JSON-LD, internal links resolve, word count.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Collect post dirs: blog/<slug>/index.html
const blogRoot = join(ROOT, "blog");
const dirs = readdirSync(blogRoot).filter((d) => {
  const p = join(blogRoot, d);
  return statSync(p).isDirectory() && existsSync(join(p, "index.html"));
});

let failures = 0;
const rows = [];

function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const d of dirs) {
  const file = join(blogRoot, d, "index.html");
  const html = readFileSync(file, "utf8");
  const issues = [];

  // 1. exactly one h1
  const h1count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1count !== 1) issues.push(`h1 count=${h1count}`);

  // 2. no em dash (U+2014). En dash (U+2013) allowed for ranges.
  if (html.includes("—")) issues.push("em dash present");

  // 3. required meta
  if (!/<title>([\s\S]*?)<\/title>/i.test(html)) issues.push("no <title>");
  if (!/name="description"/i.test(html)) issues.push("no description");
  if (!/rel="canonical"/i.test(html)) issues.push("no canonical");

  // 4. JSON-LD valid
  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  let jsonOk = false;
  if (ld) {
    try {
      const obj = JSON.parse(ld[1]);
      if (obj["@type"] !== "BlogPosting") issues.push("JSON-LD type != BlogPosting");
      if (!obj.headline) issues.push("JSON-LD missing headline");
      jsonOk = true;
    } catch (e) {
      issues.push("JSON-LD parse error");
    }
  } else {
    issues.push("no JSON-LD");
  }

  // 5. internal links resolve
  const links = [...html.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(links)];
  const broken = unique.filter((l) => {
    if (l === "/") return existsSync(join(ROOT, "index.html"));
    const target = join(ROOT, l.replace(/^\//, ""));
    return !(existsSync(target) || existsSync(target + "/index.html"));
  });
  if (broken.length) issues.push("broken links: " + broken.join(", "));

  // 6. word count (whole article region, rough)
  const body = html.match(/<article class="blog-article[\s\S]*?">([\s\S]*?)<\/article>/i);
  const text = body ? stripTags(body[1]) : "";
  const words = text ? text.split(" ").length : 0;
  if (words < 600) issues.push(`low word count=${words}`);

  const status = issues.length === 0 ? "PASS" : "FAIL";
  if (issues.length) failures++;
  rows.push({ slug: d, words, jsonOk, status, issues });
}

console.log("POST".padEnd(28), "WORDS".padEnd(7), "JSON", "STATUS", "ISSUES");
for (const r of rows) {
  console.log(
    r.slug.padEnd(28),
    String(r.words).padEnd(7),
    r.jsonOk ? "Y" : "N",
    r.status.padEnd(5),
    r.issues.join("; ")
  );
}
console.log(`\n${rows.length} posts checked, ${failures} failed`);
process.exit(failures ? 1 : 0);
