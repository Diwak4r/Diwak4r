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
