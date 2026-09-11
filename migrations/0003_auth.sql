-- Portal identities are independent of Plex accounts and subscription entitlements.
CREATE TABLE password_credentials (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  iterations INTEGER NOT NULL CHECK (iterations >= 100000),
  created_at INTEGER NOT NULL
) STRICT;

-- Only a digest of the random session cookie is persisted.
CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at)
) STRICT;
CREATE INDEX auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX auth_sessions_expiry ON auth_sessions(expires_at);

CREATE TABLE auth_rate_limits (
  key_hash TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts > 0),
  expires_at INTEGER NOT NULL
) STRICT;
CREATE INDEX auth_rate_limits_expiry ON auth_rate_limits(expires_at);
