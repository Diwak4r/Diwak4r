// Subscribe API for diwakaryadav.com.np and os.diwakaryadav.com.np.
// POST /subscribe        public, protected by Turnstile + per-IP limit
// GET  /unsubscribe?t=   public, one token per subscriber
// GET  /subscribers      private, Bearer ADMIN_TOKEN, JSON or ?format=csv

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const SOURCE_MAX = 200;
const HOURLY_LIMIT_PER_IP = 5;
const HOUR_MS = 3_600_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get("Origin"), env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (request.method === "POST" && url.pathname === "/subscribe") return await subscribe(request, env, cors);
      if (request.method === "GET" && url.pathname === "/unsubscribe") return await unsubscribe(url, env);
      if (request.method === "GET" && url.pathname === "/subscribers") return await listSubscribers(request, url, env);
      return json({ error: "not_found" }, 404, cors);
    } catch (err) {
      console.error("worker failure", url.pathname, err.message);
      return json({ error: "server_error" }, 500, cors);
    }
  },
};

function corsHeaders(origin, env) {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (!origin || !allowed.includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

async function sha256(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile(token, ip, env) {
  if (typeof token !== "string" || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch(TURNSTILE_URL, { method: "POST", body: form });
  const out = await res.json();
  return out.success === true;
}

async function subscribe(request, env, cors) {
  if (!cors["Access-Control-Allow-Origin"]) return json({ error: "forbidden" }, 403, cors);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_json" }, 400, cors);
  }

  // Honeypot: a bot fills the hidden field. Reply with success and store nothing.
  if (body.website) return json({ ok: true }, 200, cors);

  const name = clean(body.name, NAME_MAX);
  const email = clean(body.email, EMAIL_MAX).toLowerCase();
  const source = clean(body.source, SOURCE_MAX);
  if (!name || !EMAIL_RE.test(email)) return json({ error: "invalid" }, 400, cors);

  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!(await verifyTurnstile(body.turnstile, ip, env))) return json({ error: "captcha" }, 400, cors);

  const ipHash = await sha256(ip + env.IP_SALT);
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE ip_hash = ? AND created_at > ?")
    .bind(ipHash, Date.now() - HOUR_MS)
    .first();
  if (recent.n >= HOURLY_LIMIT_PER_IP) return json({ error: "rate_limited" }, 429, cors);

  // A repeat email changes nothing, so a person who unsubscribed stays unsubscribed.
  await env.DB.prepare(
    "INSERT INTO subscribers (email, name, source, ip_hash, unsub_token, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING",
  )
    .bind(email, name, source, ipHash, crypto.randomUUID(), Date.now())
    .run();

  return json({ ok: true }, 200, cors);
}

async function unsubscribe(url, env) {
  const token = url.searchParams.get("t") || "";
  if (token) {
    await env.DB.prepare("UPDATE subscribers SET unsubscribed_at = ? WHERE unsub_token = ? AND unsubscribed_at IS NULL")
      .bind(Date.now(), token)
      .run();
  }
  // Same page for a valid and an invalid token, so nobody can probe for tokens.
  return new Response(UNSUBSCRIBED_PAGE, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function isAdmin(request, env) {
  const header = request.headers.get("Authorization") || "";
  const given = new TextEncoder().encode(header);
  const expected = new TextEncoder().encode(`Bearer ${env.ADMIN_TOKEN}`);
  return given.byteLength === expected.byteLength && crypto.subtle.timingSafeEqual(given, expected);
}

// A leading = + - @ makes a spreadsheet run the cell as a formula, so prefix a quote.
function csvCell(value) {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

async function listSubscribers(request, url, env) {
  if (!(await isAdmin(request, env))) return json({ error: "unauthorized" }, 401);

  const { results } = await env.DB.prepare(
    "SELECT name, email, source, created_at FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at DESC",
  ).all();
  const rows = results.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() }));

  if (url.searchParams.get("format") !== "csv") return json({ count: rows.length, subscribers: rows }, 200);

  const lines = ["name,email,source,created_at", ...rows.map((r) => [r.name, r.email, r.source, r.created_at].map(csvCell).join(","))];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const UNSUBSCRIBED_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FEFAE0;color:#2D3748;font:18px/1.6 Georgia,serif}main{max-width:30rem;padding:2rem}a{color:#8F5A41}</style>
</head><body><main><h1>You are unsubscribed.</h1><p>I will not email you again. Thank you for reading.</p><p><a href="https://www.diwakaryadav.com.np/">Back to the site</a></p></main></body></html>`;
