// Prints the cookieless visit counts. Run from worker/: node stats.mjs [days]
// It counts visits that arrive from outside: a tagged link or another site, plus direct visits.
// It does not count moves between pages. Days are UTC.
import fs from "node:fs";

const days = process.argv[2] || "30";
const token = fs.readFileSync(new URL("./.admin-token", import.meta.url), "utf8").trim();

const res = await fetch(`https://subscribe.diwakaryadav.com.np/stats?days=${encodeURIComponent(days)}`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) {
  console.error(`stats request failed: ${res.status}`);
  process.exit(1);
}

const s = await res.json();
console.log(`Visits from outside, last ${s.days} days (since ${s.since}): ${s.total}`);
const show = (title, rows) => {
  console.log(`\n${title}`);
  if (rows.length) console.table(rows);
  else console.log("  none yet");
};
show("By site (site = diwakaryadav.com.np, os = DiwakarOS)", s.bySite);
show("By source and medium", s.bySource);
show("By campaign (tagged links only)", s.byCampaign);
show("Top landing pages", s.byPage);
show("By day", s.byDay);
