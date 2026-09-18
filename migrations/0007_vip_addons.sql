PRAGMA foreign_keys = ON;

-- VIP is a manually managed, no-payment entitlement. Keeping it in the same
-- catalogue lets the existing subscription and access controls continue to
-- work without a parallel account path.
INSERT OR IGNORE INTO subscription_tiers
  (id, name, monthly_price_minor, currency, anime_access, enabled, sort_order)
VALUES ('vip', 'VIP', 0, 'GBP', 1, 1, 70);

CREATE TABLE addon_catalog (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 100),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 500),
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE user_addons (
  user_id TEXT NOT NULL REFERENCES users(id),
  addon_id TEXT NOT NULL REFERENCES addon_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
  assigned_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  PRIMARY KEY (user_id, addon_id)
) STRICT;
CREATE INDEX user_addons_user ON user_addons(user_id, updated_at DESC);

INSERT INTO addon_catalog (id, name, description, sort_order) VALUES
  ('extra-movie', 'Extra Movie Request', 'Adds 1 extra movie request.', 10),
  ('extra-season', 'Extra Season Request', 'Adds 1 extra season request.', 20),
  ('extra-household-member', 'Extra Household Member', 'Adds another person from outside your household to your plan.', 30);
