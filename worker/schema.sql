CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL,
  unsub_token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  unsubscribed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_subscribers_ip_time ON subscribers (ip_hash, created_at);

-- One row per day, site, source, medium, campaign and page. No address, cookie or id.
CREATE TABLE IF NOT EXISTS hits (
  day TEXT NOT NULL,
  host TEXT NOT NULL,
  source TEXT NOT NULL,
  medium TEXT NOT NULL,
  campaign TEXT NOT NULL,
  path TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, host, source, medium, campaign, path)
);
