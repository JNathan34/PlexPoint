-- Keep the profile image Plex returns with a verified identity. Existing
-- accounts remain valid and receive an avatar the next time Plex verifies them.
ALTER TABLE plex_identities
ADD COLUMN avatar_url TEXT
CHECK (
  avatar_url IS NULL
  OR (length(avatar_url) BETWEEN 8 AND 2048 AND avatar_url GLOB 'https://*')
);
