PRAGMA foreign_keys = ON;

-- Preserve the original one-month charge so a voided multi-month payment can
-- safely roll the paid-through date and amount due back to their prior state.
ALTER TABLE billing_periods ADD COLUMN base_ends_at INTEGER;
ALTER TABLE billing_periods ADD COLUMN base_amount_due_minor INTEGER;
UPDATE billing_periods
SET base_ends_at = ends_at,
    base_amount_due_minor = amount_due_minor
WHERE base_ends_at IS NULL OR base_amount_due_minor IS NULL;

-- A payment is both a money movement and a statement of the service dates it
-- covers. Existing payments remain valid with unknown coverage.
ALTER TABLE payments ADD COLUMN coverage_starts_at INTEGER;
ALTER TABLE payments ADD COLUMN coverage_ends_at INTEGER;
ALTER TABLE payments ADD COLUMN coverage_months INTEGER;
ALTER TABLE payments ADD COLUMN period_extension_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN note TEXT;

-- Add-ons may be ongoing or limited to a chosen number of calendar months.
-- Null dates retain the behaviour of assignments created before this change.
ALTER TABLE user_addons ADD COLUMN starts_at INTEGER;
ALTER TABLE user_addons ADD COLUMN ends_at INTEGER;
ALTER TABLE user_addons ADD COLUMN duration_months INTEGER;
