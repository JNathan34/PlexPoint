PRAGMA foreign_keys = ON;

-- Referral rewards are earned in PlexPoint first. Members redeem them in
-- whatever amount they want before the credits are applied to the current
-- calendar month's temporary request adjustment in the request service.
CREATE TABLE referral_credit_balances (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_credits INTEGER NOT NULL DEFAULT 0 CHECK (movie_credits >= 0),
  season_credits INTEGER NOT NULL DEFAULT 0 CHECK (season_credits >= 0),
  updated_at INTEGER NOT NULL CHECK (updated_at >= 0)
) STRICT;

CREATE TABLE referral_redemptions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_requests INTEGER NOT NULL CHECK (movie_requests >= 0),
  season_requests INTEGER NOT NULL CHECK (season_requests >= 0),
  month_key TEXT NOT NULL CHECK (length(month_key) = 7 AND substr(month_key, 5, 1) = '-'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'failed')),
  failure_reason TEXT,
  created_at INTEGER NOT NULL CHECK (created_at >= 0),
  applied_at INTEGER,
  CHECK (movie_requests + season_requests > 0)
) STRICT;

CREATE INDEX referral_redemptions_user ON referral_redemptions(user_id, created_at DESC);
CREATE INDEX referral_redemptions_status ON referral_redemptions(status, created_at DESC);

-- Backfill credits for rewards that were already issued before this migration.
INSERT INTO referral_credit_balances(user_id, movie_credits, season_credits, updated_at)
SELECT referrer_user_id, SUM(reward_movie_requests), SUM(reward_season_requests), MAX(updated_at)
FROM referrals
WHERE rewarded_at IS NOT NULL
GROUP BY referrer_user_id;
