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

  let limited = false;
  for (let i = 0; i < 8 && !limited; i++) limited = (await post(good(`rate${i}@example.com`))).status === 429;
  check("per-IP hourly limit returns 429", limited);
} finally {
  execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" });
  rmSync(persist, { recursive: true, force: true });
}

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
