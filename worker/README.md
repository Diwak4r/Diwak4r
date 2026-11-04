# Subscribe Worker

Collects name and email from the subscribe panel on `www.diwakaryadav.com.np` and from the Newsletter app in DiwakarOS. Runs on Cloudflare Workers with a D1 database.

- Live at `https://subscribe.diwakaryadav.com.np`
- Worker name `diwakar-subscribe`, database `diwakar-subscribers`
- Spam guard: Cloudflare Turnstile, a hidden honeypot field, and 5 signups per hour per network

## Read the list

The admin token is in `worker/.admin-token` (git-ignored). From this folder:

```bash
# JSON
curl -H "Authorization: Bearer $(cat .admin-token)" https://subscribe.diwakaryadav.com.np/subscribers

# CSV, newest first, active subscribers only
curl -H "Authorization: Bearer $(cat .admin-token)" "https://subscribe.diwakaryadav.com.np/subscribers?format=csv" -o subscribers.csv
```

Or query the database directly:

```bash
npx wrangler d1 execute diwakar-subscribers --remote --command "SELECT name, email, source, datetime(created_at/1000,'unixepoch') AS joined FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at DESC"
```

`source` is the page path the person signed up from (a blog post path, or `os` for DiwakarOS).

## Visit counts from your social links

`js/landing.js` (classic site) and `portfolio-os/lib/landing.ts` (DiwakarOS) send one small beacon when a visitor arrives from outside. It carries the campaign tag (`?utm_source=...`) or the name of the site that sent the visitor, plus the page. The Worker adds one to a daily total in the `hits` table. It stores no cookie, no network address, and no id, so it runs whatever the visitor chose about analytics cookies.

Not counted: reloads, back and forward, moves between your own pages and sites, and automated browsers.

```bash
node stats.mjs        # last 30 days
node stats.mjs 7      # last 7 days
```

Use tagged links in your profiles, for example `https://www.diwakaryadav.com.np/?utm_source=x&utm_medium=social&utm_campaign=bio`. Values are lower-cased and cut to safe characters. A visit with no tag and no referrer is counted as `direct`.

## Change and redeploy

```bash
npx wrangler deploy                       # after editing src/index.js
node test.mjs                             # local test with a throwaway database
npx wrangler secret put ADMIN_TOKEN       # rotate a secret (also TURNSTILE_SECRET, IP_SALT)
```

Secrets are stored in Cloudflare, not in this repository. For local runs, `.dev.vars` holds Cloudflare's public Turnstile test secret.

## Before you send the first email

- Signups are single opt-in. Anyone can type another person's address. Before the first send, add a confirmation email or accept that risk.
- Every email must carry a one-click unsubscribe link: `https://subscribe.diwakaryadav.com.np/unsubscribe?t=<unsub_token>`. The token is the `unsub_token` column in each row.
- Sending needs an email service (for example Resend) and a verified sender domain. This Worker only stores addresses.
- Escape the `name` field before you put it in HTML.
