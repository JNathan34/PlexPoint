-- All timestamps are UTC Unix milliseconds. Money is stored in integer minor units.
-- Authentication storage is added with the authentication implementation.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(trim(email)) BETWEEN 3 AND 254),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 100),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  account_status TEXT NOT NULL DEFAULT 'enabled' CHECK (account_status IN ('enabled', 'disabled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
) STRICT;

CREATE TABLE subscription_tiers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  monthly_price_minor INTEGER NOT NULL CHECK (monthly_price_minor BETWEEN 0 AND 9007199254740991),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency GLOB '[A-Z][A-Z][A-Z]'),
  anime_access INTEGER NOT NULL DEFAULT 0 CHECK (anime_access IN (0, 1)),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0
) STRICT;

-- A subscription is the current entitlement, independent of its payment ledger.
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  tier_id TEXT NOT NULL REFERENCES subscription_tiers(id),
  access_status TEXT NOT NULL DEFAULT 'pending' CHECK (access_status IN ('pending', 'enabled', 'suspended', 'cancelled')),
  starts_at INTEGER,
  ends_at INTEGER,
  provider TEXT NOT NULL DEFAULT 'manual' CHECK (length(trim(provider)) > 0),
  provider_subscription_id TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  CHECK ((starts_at IS NULL AND ends_at IS NULL) OR
    (starts_at IS NOT NULL AND ends_at IS NOT NULL AND starts_at >= 0 AND ends_at > starts_at AND ends_at <= 8640000000000000)),
  CHECK (access_status != 'enabled' OR (starts_at IS NOT NULL AND ends_at IS NOT NULL)),
  UNIQUE (provider, provider_subscription_id)
) STRICT;
CREATE INDEX subscriptions_expiry ON subscriptions(access_status, ends_at);
CREATE INDEX subscriptions_tier ON subscriptions(tier_id);

-- Historical prices and dates stay unchanged when a tier's catalogue price changes.
CREATE TABLE billing_periods (
  id TEXT PRIMARY KEY NOT NULL,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
  tier_id TEXT NOT NULL REFERENCES subscription_tiers(id),
  starts_at INTEGER NOT NULL CHECK (starts_at >= 0),
  ends_at INTEGER NOT NULL CHECK (ends_at > starts_at AND ends_at <= 8640000000000000),
  amount_due_minor INTEGER NOT NULL CHECK (amount_due_minor BETWEEN 0 AND 9007199254740991),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency GLOB '[A-Z][A-Z][A-Z]'),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'void')),
  reference TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE (id, currency)
) STRICT;
CREATE INDEX billing_periods_subscription ON billing_periods(subscription_id, starts_at DESC);

-- Pending means awaiting administrator confirmation. Voiding keeps the history.
CREATE TABLE payments (
  id TEXT PRIMARY KEY NOT NULL,
  billing_period_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL CHECK (amount_minor BETWEEN 1 AND 9007199254740991),
  currency TEXT NOT NULL CHECK (currency GLOB '[A-Z][A-Z][A-Z]'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'void')),
  method TEXT NOT NULL CHECK (length(trim(method)) BETWEEN 1 AND 80),
  received_at INTEGER CHECK (received_at >= 0 AND received_at <= 8640000000000000),
  confirmed_at INTEGER CHECK (confirmed_at >= 0 AND confirmed_at <= 8640000000000000),
  recorded_by TEXT REFERENCES users(id),
  provider TEXT NOT NULL DEFAULT 'manual' CHECK (length(trim(provider)) > 0),
  provider_payment_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  CHECK (status != 'confirmed' OR (received_at IS NOT NULL AND confirmed_at IS NOT NULL)),
  FOREIGN KEY (billing_period_id, currency) REFERENCES billing_periods(id, currency),
  UNIQUE (provider, provider_payment_id)
) STRICT;
CREATE INDEX payments_period ON payments(billing_period_id, status);
CREATE INDEX payments_pending ON payments(status, created_at);

CREATE TABLE admin_notes (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 10000),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
) STRICT;
CREATE INDEX admin_notes_user ON admin_notes(user_id, created_at DESC);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  actor_id TEXT REFERENCES users(id),
  subject_user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (length(trim(action)) BETWEEN 1 AND 100),
  details_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details_json)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
) STRICT;
CREATE INDEX audit_events_user ON audit_events(subject_user_id, created_at DESC);

CREATE TABLE plex_account_links (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id),
  plex_user_id TEXT NOT NULL UNIQUE CHECK (length(trim(plex_user_id)) > 0),
  tautulli_user_id TEXT UNIQUE CHECK (tautulli_user_id IS NULL OR length(trim(tautulli_user_id)) > 0),
  verified_by TEXT NOT NULL REFERENCES users(id),
  verified_at INTEGER NOT NULL CHECK (verified_at >= 0)
) STRICT;

CREATE TABLE service_links (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
) STRICT;

CREATE TABLE help_articles (
  slug TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Getting started',
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
) STRICT;

-- Existing manual monthly prices, in pence; no automatic checkout is configured.
INSERT INTO subscription_tiers (id, name, monthly_price_minor, anime_access, sort_order) VALUES
  ('bronze', 'Bronze Tier', 250, 0, 10),
  ('silver', 'Silver Tier', 350, 0, 20),
  ('gold', 'Gold Tier', 500, 0, 30),
  ('diamond', 'Diamond Tier', 700, 0, 40),
  ('ruby', 'Ruby Tier', 1000, 1, 50),
  ('platinum', 'Platinum Tier', 1500, 1, 60);

INSERT INTO service_links (id, title, description, url, sort_order) VALUES
  ('plex', 'Open Plex', 'Watch your Plex libraries.', 'https://app.plex.tv/', 10),
  ('requests', 'Request a movie or show', 'Open the PlexPoint Overseerr request service.', 'https://request.plexpoint.uk/', 20),
  ('setup', 'Plex setup guides', 'Follow the existing PlexPoint device setup guides.', '/#tutorials', 30),
  ('install', 'Install Plex', 'Find the Plex application for your device.', 'https://www.plex.tv/apps-devices/', 40);
