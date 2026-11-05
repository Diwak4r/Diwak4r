// Local test for the subscribe Worker. Run from the worker/ folder: node test.mjs
// Starts `wrangler dev` with a throwaway local D1 database, then calls the real routes.
import { spawn, execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}`;
const OK_ORIGIN = "https://www.diwakaryadav.com.np";
const BAD_ORIGIN = "https://evil.example";
const ADMIN = { Authorization: "Bearer test-admin-token" };
const persist = mkdtempSync(join(tmpdir(), "subscribe-test-"));

let failed = 0;
const check = (label, pass, detail = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${pass ? "" : `  -> ${detail}`}`);
  if (!pass) failed++;
};

const post = (body, origin = OK_ORIGIN) =>
  fetch(`${BASE}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
const good = (email, extra = {}) => ({ name: "Asha", email, source: "/blog/test/", turnstile: "token", ...extra });
const admin = async (query = "") => (await fetch(`${BASE}/subscribers${query}`, { headers: ADMIN })).json();

const wrangler = (args) => execSync(`npx --yes wrangler@latest ${args}`, { stdio: "pipe", encoding: "utf8" });

wrangler(`d1 execute diwakar-subscribers --local --persist-to "${persist}" --file=schema.sql`);
const server = spawn("npx", ["--yes", "wrangler@latest", "dev", "--local", "--port", String(PORT), "--persist-to", persist], {
  shell: true,
  stdio: "ignore",
});

try {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(`${BASE}/nothing`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  let res = await fetch(`${BASE}/subscribe`, { method: "OPTIONS", headers: { Origin: OK_ORIGIN } });
  check("preflight from allowed origin", res.status === 204 && res.headers.get("access-control-allow-origin") === OK_ORIGIN);
  res = await fetch(`${BASE}/subscribe`, { method: "OPTIONS", headers: { Origin: BAD_ORIGIN } });
  check("preflight from other origin gets no CORS header", !res.headers.get("access-control-allow-origin"));

  check("POST from other origin is 403", (await post(good("a@x.com"), BAD_ORIGIN)).status === 403);
  check("missing Turnstile token is 400", (await post(good("a@x.com", { turnstile: "" }))).status === 400);
  check("bad email is 400", (await post(good("not-an-email"))).status === 400);
  check("empty name is 400", (await post(good("a@x.com", { name: "  " }))).status === 400);

  check("valid signup is 200", (await post(good("Asha@Example.com"))).status === 200);
  check("repeat signup is 200", (await post(good("asha@example.com"))).status === 200);
  check("honeypot is 200 and stores nothing", (await post(good("bot@example.com", { website: "http://spam" }))).status === 200);

  check("list without token is 401", (await fetch(`${BASE}/subscribers`)).status === 401);
  let list = await admin();
  check("one subscriber stored, email lowercased", list.count === 1 && list.subscribers[0].email === "asha@example.com", JSON.stringify(list));

  await post(good("evil@example.com", { name: "=HYPERLINK(1)" }));
  const csv = await (await fetch(`${BASE}/subscribers?format=csv`, { headers: ADMIN })).text();
  check("CSV has header and neutralizes a formula name", csv.startsWith("name,email,source,created_at") && csv.includes(`"'=HYPERLINK(1)"`), csv);

  const rows = JSON.parse(
    wrangler(`d1 execute diwakar-subscribers --local --persist-to "${persist}" --json --command "SELECT unsub_token FROM subscribers WHERE email='asha@example.com'"`),
  );
  const token = rows[0].results[0].unsub_token;
  res = await fetch(`${BASE}/unsubscribe?t=${token}`);
  check("unsubscribe page is 200", res.status === 200 && (await res.text()).includes("unsubscribed"));
  res = await fetch(`${BASE}/unsubscribe?t=wrong-token`);
  check("invalid token shows the same page", res.status === 200);
  list = await admin();
  check("unsubscribed person leaves the list", !list.subscribers.some((s) => s.email === "asha@example.com"));
  await post(good("asha@example.com"));
  list = await admin();
  check("re-signup does not undo an unsubscribe", !list.subscribers.some((s) => s.email === "asha@example.com"));

  // Visit counter: no cookie, no address, one number per combination.
  const hit = (body, origin = OK_ORIGIN) => fetch(`${BASE}/hit`, { method: "POST", headers: { "Content-Type": "text/plain", Origin: origin }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const stats = async (query = "") => (await fetch(`${BASE}/stats${query}`, { headers: ADMIN })).json();
  check("hit from another origin is 403", (await hit({ source: "x" }, BAD_ORIGIN)).status === 403);
  check("hit with bad JSON is 400", (await hit("not json")).status === 400);
  check("hit is 204", (await hit({ source: "X", medium: "Social", campaign: "Bio!", path: "/" })).status === 204);
  check("same hit again is 204", (await hit({ source: "x", medium: "social", campaign: "bio", path: "/" })).status === 204);
  await hit({}); // no source: a direct visit
  await hit({ source: "t.co", path: "/blog/free-ai-stack/" }, "https://www.os.diwakaryadav.com.np");
  check("stats without token is 401", (await fetch(`${BASE}/stats`)).status === 401);
  const st = await stats("?days=7");
  const xRow = st.bySource.find((r) => r.source === "x");
  check("source, medium and campaign are cleaned and joined", xRow?.medium === "social" && xRow.visits === 2, JSON.stringify(st.bySource));
  check("campaign list shows the cleaned campaign", st.byCampaign.some((r) => r.source === "x" && r.campaign === "bio" && r.visits === 2), JSON.stringify(st.byCampaign));
  check("a missing source is counted as direct / none", st.bySource.some((r) => r.source === "direct" && r.medium === "none" && r.visits === 1), JSON.stringify(st.bySource));
  check("a referrer without a campaign is referral", st.bySource.some((r) => r.source === "t.co" && r.medium === "referral"), JSON.stringify(st.bySource));
  check("the os site is counted apart from the main site", st.bySite.some((r) => r.host === "os" && r.visits === 1) && st.bySite.some((r) => r.host === "site" && r.visits === 3), JSON.stringify(st.bySite));
  check("total adds up", st.total === 4, String(st.total));
  check("stats stores no address or cookie column", !JSON.stringify(st).match(/ip|cookie|email/i));

  let limited = false;
  for (let i = 0; i < 8 && !limited; i++) limited = (await post(good(`rate${i}@example.com`))).status === 429;
  check("per-IP hourly limit returns 429", limited);

  // Contact messages: replace formsubmit.co. Stored in D1, read with the admin token.
  const send = (body, origin = OK_ORIGIN) =>
    fetch(`${BASE}/contact`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
  const msg = (extra = {}) => ({ source: "site-contact", name: "Rita", email: "Rita@Example.com", purpose: "Hiring / Job Opportunity", subject: "Hello", message: "Line one\nLine two", turnstile: "token", ...extra });
  const messages = async () => (await fetch(`${BASE}/messages`, { headers: ADMIN })).json();

  check("contact from other origin is 403", (await send(msg(), BAD_ORIGIN)).status === 403);
  check("contact with an unknown source is 400", (await send(msg({ source: "other" }))).status === 400);
  check("contact without a message is 400", (await send(msg({ message: "  " }))).status === 400);
  check("contact without a name is 400", (await send(msg({ name: "" }))).status === 400);
  check("contact with a bad email is 400", (await send(msg({ email: "nope" }))).status === 400);
  check("contact without a Turnstile token is 400", (await send(msg({ turnstile: "" }))).status === 400);
  check("contact honeypot is 200 and stores nothing", (await send(msg({ website: "http://spam" }))).status === 200);
  check("messages without token is 401", (await fetch(`${BASE}/messages`)).status === 401);
  check("nothing stored so far", (await messages()).count === 0);

  check("valid contact is 200", (await send(msg())).status === 200);
  check("a Notes message needs no name or email", (await send({ source: "os-note", message: "Nice site", turnstile: "token" })).status === 200);
  const stored = await messages();
  const rita = stored.messages.find((m) => m.source === "site-contact");
  check("two messages stored", stored.count === 2, JSON.stringify(stored));
  check("contact fields stored, email lowercased, line break kept", rita?.email === "rita@example.com" && rita.name === "Rita" && rita.message === "Line one\nLine two" && rita.purpose === "Hiring / Job Opportunity", JSON.stringify(rita));
  check("a note stores no sender", stored.messages.find((m) => m.source === "os-note")?.email === "");
  check("messages never expose the network hash", !JSON.stringify(stored).includes("ip_hash"));

  limited = false;
  for (let i = 0; i < 8 && !limited; i++) limited = (await send(msg({ message: `again ${i}` }))).status === 429;
  check("contact per-IP hourly limit returns 429", limited);
} finally {
  execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
  rmSync(persist, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
