PRAGMA foreign_keys = ON;

-- Prices used by the referral order review. They mirror the existing public
-- add-on prices and are snapshotted onto each order when it is submitted.
ALTER TABLE addon_catalog ADD COLUMN price_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE addon_catalog ADD COLUMN currency TEXT NOT NULL DEFAULT 'GBP';
ALTER TABLE addon_catalog ADD COLUMN billing_label TEXT NOT NULL DEFAULT 'one-off';

UPDATE addon_catalog SET price_minor = 50, billing_label = 'one-off' WHERE id = 'extra-movie';
UPDATE addon_catalog SET price_minor = 100, billing_label = 'one-off' WHERE id = 'extra-season';
UPDATE addon_catalog SET price_minor = 250, billing_label = 'per month' WHERE id = 'extra-household-member';

-- Codes are stored separately so a member's share link remains stable even if
-- their Plex username or display name changes later.
CREATE TABLE referral_codes (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL COLLATE NOCASE UNIQUE
    CHECK (length(code) BETWEEN 6 AND 32 AND code NOT GLOB '*[^A-Z0-9-]*'),
  created_at INTEGER NOT NULL CHECK (created_at >= 0)
) STRICT;

CREATE TABLE referrals (
  id TEXT PRIMARY KEY NOT NULL,
  referrer_user_id TEXT NOT NULL REFERENCES users(id),
  referred_user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'awaiting_payment', 'completed', 'cancelled')),
  selected_tier_id TEXT REFERENCES subscription_tiers(id),
  plan_price_minor INTEGER CHECK (plan_price_minor IS NULL OR plan_price_minor >= 0),
  addons_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(addons_json)),
  addons_total_minor INTEGER NOT NULL DEFAULT 0 CHECK (addons_total_minor >= 0),
  order_total_minor INTEGER CHECK (order_total_minor IS NULL OR order_total_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency GLOB '[A-Z][A-Z][A-Z]'),
  order_id TEXT UNIQUE,
  referral_number INTEGER CHECK (referral_number IS NULL OR referral_number BETWEEN 1 AND 5),
  reward_movie_requests INTEGER NOT NULL DEFAULT 0 CHECK (reward_movie_requests BETWEEN 0 AND 2),
  reward_season_requests INTEGER NOT NULL DEFAULT 0 CHECK (reward_season_requests BETWEEN 0 AND 2),
  completion_payment_id TEXT UNIQUE REFERENCES payments(id),
  completed_at INTEGER,
  rewarded_at INTEGER,
  created_at INTEGER NOT NULL CHECK (created_at >= 0),
  updated_at INTEGER NOT NULL CHECK (updated_at >= 0),
  CHECK (referrer_user_id != referred_user_id),
  CHECK (order_id IS NULL OR selected_tier_id IS NOT NULL),
  CHECK (completion_payment_id IS NULL OR status = 'completed')
) STRICT;

CREATE UNIQUE INDEX referrals_reward_milestone
  ON referrals(referrer_user_id, referral_number)
  WHERE referral_number IS NOT NULL;
CREATE INDEX referrals_referrer_status ON referrals(referrer_user_id, status, created_at DESC);
CREATE INDEX referrals_status_updated ON referrals(status, updated_at DESC);
