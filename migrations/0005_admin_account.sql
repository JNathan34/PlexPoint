-- This is the single owner account. Runtime authorization also verifies the
-- normalized email so a stale or manually changed role never grants access.
UPDATE users
SET role = 'admin', updated_at = unixepoch() * 1000
WHERE email = 'jacobnathan1718@gmail.com' COLLATE NOCASE;
