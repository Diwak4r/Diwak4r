// Prints the newest contact messages. Run from worker/: node messages.mjs
// Sources: site-contact (classic /contact/), os-contact (DiwakarOS Contact), os-note (DiwakarOS Notes).
import fs from "node:fs";

const token = fs.readFileSync(new URL("./.admin-token", import.meta.url), "utf8").trim();

const res = await fetch("https://subscribe.diwakaryadav.com.np/messages", {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) {
  console.error(`messages request failed: ${res.status}`);
  process.exit(1);
}

const { count, messages } = await res.json();
console.log(`${count} message(s), newest first\n`);
for (const m of messages) {
  const from = m.name ? `${m.name} <${m.email}>` : "anonymous note";
  console.log(`#${m.id}  ${m.created_at}  [${m.source}]  ${from}`);
  if (m.purpose || m.subject) console.log(`  ${[m.purpose, m.subject].filter(Boolean).join(" | ")}`);
  console.log(`  ${m.message.replace(/\n/g, "\n  ")}\n`);
}
