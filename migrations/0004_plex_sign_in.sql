-- Authentication identities are separate from administrator-managed Plex entitlements.
-- Plex access tokens are used only in memory to verify identity, never persisted.
CREATE TABLE plex_identities (
  plex_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  linked_at INTEGER NOT NULL
) STRICT;

CREATE TABLE plex_login_attempts (
  state_hash TEXT PRIMARY KEY NOT NULL,
  pin_id INTEGER NOT NULL,
  pin_code TEXT NOT NULL,
  client_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_hash TEXT,
  expires_at INTEGER NOT NULL,
  last_poll_at INTEGER NOT NULL DEFAULT 0,
  CHECK ((user_id IS NULL AND session_hash IS NULL) OR (user_id IS NOT NULL AND session_hash IS NOT NULL))
) STRICT;
CREATE INDEX plex_login_attempts_expiry ON plex_login_attempts(expires_at);
