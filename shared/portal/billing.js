import { AuthError, isAdminEmail, readBody, reply, sessionUser } from "./auth.js";
import { referralAdminDetail } from "./referrals.js";

const DAY_MS = 86_400_000;
const ACCESS_STATUSES = new Set(["pending", "enabled", "suspended", "cancelled"]);
const PAYMENT_METHODS = new Set(["bank_transfer", "cash", "card", "paypal", "other"]);

function ensureHttps(request) {
  const url = new URL(request.url);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new AuthError(400, "Account access requires HTTPS.");
  }
  return url;
}

function identifier(value, label = "account") {
  if (typeof value !== "string" || !value || value.length > 128 || /[\x00-\x1f\x7f]/.test(value)) {
    throw new AuthError(400, `Select a valid ${label}.`);
  }
  return value;
}

function dateTimestamp(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AuthError(400, `Enter a valid ${label}.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new AuthError(400, `Enter a valid ${label}.`);
  }
  return timestamp;
}

function addCalendarMonths(timestamp, months) {
  const source = new Date(timestamp);
  const day = source.getUTCDate();
  const target = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.getTime();
}

export function paymentState(period, now = Date.now()) {
  if (!period) return "none";
  if (period.status === "void") return "void";
  if (period.outstandingMinor === 0) return "paid";
  if (period.pendingMinor > 0) return "awaiting_confirmation";
  if (now >= period.endsAt) return "overdue";
  if (period.endsAt - now <= 7 * DAY_MS) return "due_soon";
  return period.confirmedMinor > 0 ? "partially_paid" : "unpaid";
}

function mapPeriod(row, now) {
  const amountDueMinor = Number(row.amount_due_minor);
  const confirmedMinor = Number(row.confirmed_minor || 0);
  const pendingMinor = Number(row.pending_minor || 0);
  const period = {
    id: row.id,
    tierId: row.tier_id,
    tier: row.tier_name,
    startsAt: Number(row.starts_at),
    endsAt: Number(row.ends_at),
    amountDueMinor,
    monthlyPriceMinor: Number(row.monthly_price_minor ?? row.amount_due_minor),
    currency: row.currency,
    status: row.status,
    confirmedMinor,
    pendingMinor,
    outstandingMinor: row.status === "void" ? 0 : Math.max(0, amountDueMinor - confirmedMinor),
    creditMinor: Math.max(0, confirmedMinor - amountDueMinor),
  };
  return { ...period, paymentStatus: paymentState(period, now) };
}

function mapPayment(row) {
  return {
    id: row.id,
    tierId: row.tier_id,
    tier: row.tier_name,
    amountMinor: Number(row.amount_minor),
    currency: row.currency,
    status: row.status,
    method: row.method,
    receivedAt: row.received_at == null ? null : Number(row.received_at),
    reference: row.provider_payment_id || null,
    note: row.note || null,
    coverageStartsAt: row.coverage_starts_at == null ? null : Number(row.coverage_starts_at),
    coverageEndsAt: row.coverage_ends_at == null ? null : Number(row.coverage_ends_at),
    coverageMonths: row.coverage_months == null ? null : Number(row.coverage_months),
    periodStartsAt: Number(row.period_starts_at),
    periodEndsAt: Number(row.period_ends_at),
  };
}

async function addonsForUser(db, userId, { includeInactive = false, now = Date.now() } = {}) {
  const result = await db.prepare(`SELECT
    a.id, a.name, a.description, ua.quantity, ua.starts_at, ua.ends_at, ua.duration_months
    FROM user_addons ua
    JOIN addon_catalog a ON a.id = ua.addon_id
    WHERE ua.user_id = ? AND a.enabled = 1
    ORDER BY a.sort_order, a.name`).bind(userId).all();
  return (result.results || []).map((addon) => ({
    id: addon.id,
    name: addon.name,
    description: addon.description,
    quantity: Number(addon.quantity),
    startsAt: addon.starts_at == null ? null : Number(addon.starts_at),
    endsAt: addon.ends_at == null ? null : Number(addon.ends_at),
    durationMonths: addon.duration_months == null ? null : Number(addon.duration_months),
    active: (addon.starts_at == null || Number(addon.starts_at) <= now)
      && (addon.ends_at == null || Number(addon.ends_at) > now),
  })).filter((addon) => includeInactive || addon.active);
}

export async function billingForUser(db, userId, { includeVoided = false, includeInactiveAddons = false, now = Date.now() } = {}) {
  const addons = await addonsForUser(db, userId, { includeInactive: includeInactiveAddons, now });
  const subscription = await db.prepare(`SELECT
    s.id, s.tier_id, s.access_status, s.starts_at, s.ends_at,
    t.name AS tier_name, t.monthly_price_minor, t.currency
    FROM subscriptions s JOIN subscription_tiers t ON t.id = s.tier_id
    WHERE s.user_id = ?`).bind(userId).first();
  if (!subscription) return { subscription: null, currentPeriod: null, payments: [], addons };

  const periodResult = await db.prepare(`SELECT
    bp.id, bp.tier_id, t.name AS tier_name, bp.starts_at, bp.ends_at,
    bp.amount_due_minor, COALESCE(bp.base_amount_due_minor, bp.amount_due_minor) AS monthly_price_minor,
    bp.currency, bp.status,
    COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_minor ELSE 0 END), 0) AS confirmed_minor,
    COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_minor ELSE 0 END), 0) AS pending_minor
    FROM billing_periods bp
    JOIN subscription_tiers t ON t.id = bp.tier_id
    LEFT JOIN payments p ON p.billing_period_id = bp.id
    WHERE bp.subscription_id = ?
    GROUP BY bp.id, bp.tier_id, t.name, bp.starts_at, bp.ends_at, bp.amount_due_minor,
      bp.base_amount_due_minor, bp.currency, bp.status
    ORDER BY bp.starts_at DESC LIMIT 24`).bind(subscription.id).all();
  const periods = (periodResult.results || []).map((row) => mapPeriod(row, now));
  const currentPeriod = periods.find((period) => period.status === "open"
    && period.startsAt === Number(subscription.starts_at) && period.endsAt === Number(subscription.ends_at))
    || periods.find((period) => period.status === "open") || null;

  const paymentResult = await db.prepare(`SELECT
    p.id, p.amount_minor, p.currency, p.status, p.method, p.received_at, p.provider_payment_id,
    p.note, p.coverage_starts_at, p.coverage_ends_at, p.coverage_months,
    bp.tier_id, t.name AS tier_name, bp.starts_at AS period_starts_at, bp.ends_at AS period_ends_at
    FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
    JOIN subscription_tiers t ON t.id = bp.tier_id
    WHERE bp.subscription_id = ? ${includeVoided ? "" : "AND p.status != 'void'"}
    ORDER BY COALESCE(p.received_at, p.created_at) DESC, p.created_at DESC LIMIT 50`).bind(subscription.id).all();
  const payments = (paymentResult.results || []).map(mapPayment);
  const lastPayment = payments.find((payment) => payment.status === "confirmed") || null;
  return {
    subscription: {
      id: subscription.id,
      tierId: subscription.tier_id,
      tier: subscription.tier_name,
      accessStatus: subscription.access_status,
      startsAt: subscription.starts_at == null ? null : Number(subscription.starts_at),
      endsAt: subscription.ends_at == null ? null : Number(subscription.ends_at),
      monthlyPriceMinor: Number(subscription.monthly_price_minor),
      currency: subscription.currency,
    },
    currentPeriod,
    lastPayment,
    payments,
    addons,
  };
}

async function authenticated(request, env, admin = false) {
  ensureHttps(request);
  if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
  const current = await sessionUser(env.PORTAL_DB, request);
  if (!current) throw new AuthError(401, "Please sign in to continue.");
  if (admin && !isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
  return current;
}

async function targetUser(db, userId) {
  const row = await db.prepare("SELECT id, email, display_name, account_status FROM users WHERE id = ?")
    .bind(identifier(userId)).first();
  if (!row) throw new AuthError(404, "That user account could not be found.");
  return { id: row.id, email: row.email, displayName: row.display_name, accountStatus: row.account_status };
}

async function adminDetail(db, userId, now = Date.now()) {
  const account = await targetUser(db, userId);
  const tiersResult = await db.prepare(`SELECT id, name, monthly_price_minor, currency
    FROM subscription_tiers WHERE enabled = 1 ORDER BY sort_order, name`).all();
  const addonsResult = await db.prepare(`SELECT id, name, description, price_minor, currency, billing_label
    FROM addon_catalog WHERE enabled = 1 ORDER BY sort_order, name`).all();
  return {
    account,
    tiers: (tiersResult.results || []).map((tier) => ({
      id: tier.id, name: tier.name, monthlyPriceMinor: Number(tier.monthly_price_minor), currency: tier.currency,
    })),
    availableAddons: (addonsResult.results || []).map((addon) => ({
      id: addon.id, name: addon.name, description: addon.description, priceMinor: Number(addon.price_minor),
      currency: addon.currency, billingLabel: addon.billing_label,
    })),
    billing: await billingForUser(db, userId, { includeVoided: true, includeInactiveAddons: true, now }),
    referral: await referralAdminDetail(db, userId),
  };
}

async function saveAddons(db, actor, body, now) {
  const userId = identifier(body.userId);
  await targetUser(db, userId);
  if (!Array.isArray(body.addons) || body.addons.length > 50) {
    throw new AuthError(400, "Select valid add-ons.");
  }
  const selected = [];
  const seen = new Set();
  for (const item of body.addons) {
    const id = identifier(item?.id, "add-on");
    const quantity = item?.quantity;
    const startsAt = dateTimestamp(item?.startsOn, "add-on start date");
    const durationMonths = item?.durationMonths;
    if (seen.has(id) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99
      || !Number.isSafeInteger(durationMonths) || durationMonths < 0 || durationMonths > 24) {
      throw new AuthError(400, "Select valid add-ons and quantities.");
    }
    seen.add(id);
    selected.push({ id, quantity, startsAt, durationMonths,
      endsAt: durationMonths === 0 ? null : addCalendarMonths(startsAt, durationMonths) });
  }
  if (selected.length) {
    const placeholders = selected.map(() => "?").join(",");
    const result = await db.prepare(`SELECT id FROM addon_catalog
      WHERE enabled = 1 AND id IN (${placeholders})`).bind(...selected.map((item) => item.id)).all();
    if ((result.results || []).length !== selected.length) throw new AuthError(400, "Select available add-ons.");
  }
  const statements = [db.prepare("DELETE FROM user_addons WHERE user_id = ?").bind(userId)];
  for (const addon of selected) {
    statements.push(db.prepare(`INSERT INTO user_addons
      (user_id, addon_id, quantity, assigned_by, created_at, updated_at, starts_at, ends_at, duration_months)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(userId, addon.id, addon.quantity, actor.id, now, now,
        addon.startsAt, addon.endsAt, addon.durationMonths));
  }
  statements.push(db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
    VALUES (?, ?, ?, 'billing.addons_updated', ?, ?)`)
    .bind(crypto.randomUUID(), actor.id, userId, JSON.stringify({ addons: selected }), now));
  await db.batch(statements);
  return adminDetail(db, userId, now);
}

async function savePlan(db, actor, body, now) {
  const userId = identifier(body.userId);
  await targetUser(db, userId);
  const tierId = identifier(body.tierId, "plan");
  const tier = await db.prepare(`SELECT id, name, monthly_price_minor, currency
    FROM subscription_tiers WHERE id = ? AND enabled = 1`).bind(tierId).first();
  if (!tier) throw new AuthError(400, "Select an available plan.");
  const accessStatus = typeof body.accessStatus === "string" ? body.accessStatus : "";
  if (!ACCESS_STATUSES.has(accessStatus)) throw new AuthError(400, "Select a valid access status.");
  const startsAt = dateTimestamp(body.startsOn, "plan start date");
  const endsAt = dateTimestamp(body.nextDueOn, "next payment due date");
  if (endsAt <= startsAt) throw new AuthError(400, "The next payment date must be after the plan start date.");

  const existing = await db.prepare("SELECT id FROM subscriptions WHERE user_id = ?").bind(userId).first();
  const subscriptionId = existing?.id || crypto.randomUUID();
  const periodId = crypto.randomUUID();
  const reference = `manual:${subscriptionId}:${startsAt}`;
  const details = JSON.stringify({ tierId, tier: tier.name, accessStatus, startsAt, endsAt,
    amountDueMinor: Number(tier.monthly_price_minor), currency: tier.currency });
  await db.batch([
    db.prepare(`INSERT INTO subscriptions
      (id, user_id, tier_id, access_status, starts_at, ends_at, provider, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'manual', 1, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET tier_id = excluded.tier_id, access_status = excluded.access_status,
        starts_at = excluded.starts_at, ends_at = excluded.ends_at, version = subscriptions.version + 1,
        updated_at = excluded.updated_at`).bind(subscriptionId, userId, tierId, accessStatus, startsAt, endsAt, now, now),
    db.prepare(`INSERT INTO billing_periods
      (id, subscription_id, tier_id, starts_at, ends_at, amount_due_minor, currency, status, reference, created_at,
       base_ends_at, base_amount_due_minor)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)
      ON CONFLICT(reference) DO UPDATE SET tier_id = excluded.tier_id, ends_at = excluded.ends_at,
        amount_due_minor = excluded.amount_due_minor, currency = excluded.currency, status = 'open',
        base_ends_at = excluded.base_ends_at, base_amount_due_minor = excluded.base_amount_due_minor`)
      .bind(periodId, subscriptionId, tierId, startsAt, endsAt, Number(tier.monthly_price_minor), tier.currency,
        reference, now, endsAt, Number(tier.monthly_price_minor)),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.plan_updated', ?, ?)`)
      .bind(crypto.randomUUID(), actor.id, userId, details, now),
  ]);
  return adminDetail(db, userId, now);
}

async function recordPayment(db, actor, body, now) {
  const userId = identifier(body.userId);
  await targetUser(db, userId);
  const amountMinor = body.amountMinor;
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 1 || amountMinor > 100_000_000) {
    throw new AuthError(400, "Enter a payment amount between £0.01 and £1,000,000.");
  }
  const method = typeof body.method === "string" ? body.method : "";
  if (!PAYMENT_METHODS.has(method)) throw new AuthError(400, "Select a valid payment method.");
  const receivedAt = dateTimestamp(body.receivedOn, "payment date");
  const today = new Date(now);
  const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (receivedAt > todayStart) throw new AuthError(400, "The payment date cannot be in the future.");
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (reference.length > 80 || /[\x00-\x1f\x7f]/.test(reference)) {
    throw new AuthError(400, "Keep the payment reference under 80 characters.");
  }
  if (reference && await db.prepare("SELECT id FROM payments WHERE provider = 'manual' AND provider_payment_id = ?")
    .bind(reference).first()) throw new AuthError(409, "That payment reference has already been used.");
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 500 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(note)) {
    throw new AuthError(400, "Keep the payment note under 500 characters.");
  }
  const coverageMonths = body.coverageMonths;
  if (!Number.isSafeInteger(coverageMonths) || coverageMonths < 1 || coverageMonths > 24) {
    throw new AuthError(400, "Choose between 1 and 24 months for this payment.");
  }

  const period = await db.prepare(`SELECT
      bp.id, bp.currency, bp.starts_at, bp.ends_at, bp.amount_due_minor,
      COALESCE(bp.base_ends_at, bp.ends_at) AS base_ends_at,
      COALESCE(bp.base_amount_due_minor, bp.amount_due_minor) AS base_amount_due_minor,
      s.id AS subscription_id,
      COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_minor ELSE 0 END), 0) AS confirmed_minor
    FROM subscriptions s
    JOIN billing_periods bp ON bp.subscription_id = s.id
    LEFT JOIN payments p ON p.billing_period_id = bp.id
    WHERE s.user_id = ? AND bp.status = 'open' AND bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at
    GROUP BY bp.id, bp.currency, bp.starts_at, bp.ends_at, bp.amount_due_minor,
      bp.base_ends_at, bp.base_amount_due_minor, s.id
    ORDER BY bp.starts_at DESC LIMIT 1`).bind(userId).first();
  if (!period) throw new AuthError(409, "Assign a plan and billing dates before recording a payment.");
  const monthlyPriceMinor = Number(period.base_amount_due_minor);
  if (monthlyPriceMinor === 0) throw new AuthError(409, "This plan does not require payment.");
  const hasOutstandingBalance = Number(period.confirmed_minor) < Number(period.amount_due_minor);
  const coverageStartsAt = hasOutstandingBalance ? Number(period.starts_at) : Number(period.ends_at);
  const coverageEndsAt = addCalendarMonths(coverageStartsAt, coverageMonths);
  const requestedCoverageMinor = monthlyPriceMinor * coverageMonths;
  const periodExtensionMinor = hasOutstandingBalance
    ? Math.max(0, requestedCoverageMinor - Number(period.amount_due_minor))
    : requestedCoverageMinor;
  if (!Number.isSafeInteger(periodExtensionMinor) || periodExtensionMinor > 100_000_000) {
    throw new AuthError(400, "That coverage period is too large.");
  }
  const nextEndsAt = Math.max(Number(period.ends_at), coverageEndsAt);
  const nextAmountDueMinor = Number(period.amount_due_minor) + periodExtensionMinor;
  const paymentId = crypto.randomUUID();
  const details = JSON.stringify({ paymentId, amountMinor, currency: period.currency, method, receivedAt,
    coverageStartsAt, coverageEndsAt, coverageMonths, periodExtensionMinor,
    ...(reference ? { reference } : {}), ...(note ? { note } : {}) });
  const rewardSlot = `(SELECT MIN(candidate.n) FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    ) candidate WHERE NOT EXISTS (
      SELECT 1 FROM referrals used WHERE used.referrer_user_id = referrals.referrer_user_id
        AND used.referral_number = candidate.n AND used.rewarded_at IS NOT NULL
    ))`;
  await db.batch([
    db.prepare(`INSERT INTO payments
      (id, billing_period_id, amount_minor, currency, status, method, received_at, confirmed_at,
       recorded_by, provider, provider_payment_id, idempotency_key, created_at,
       coverage_starts_at, coverage_ends_at, coverage_months, period_extension_minor, note)
      VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(paymentId, period.id, amountMinor, period.currency, method, receivedAt, now, actor.id,
        reference || null, `manual:${paymentId}`, now, coverageStartsAt, coverageEndsAt, coverageMonths,
        periodExtensionMinor, note || null),
    db.prepare(`UPDATE billing_periods
      SET ends_at = ?, amount_due_minor = ?,
        base_ends_at = COALESCE(base_ends_at, ?),
        base_amount_due_minor = COALESCE(base_amount_due_minor, ?)
      WHERE id = ?`).bind(nextEndsAt, nextAmountDueMinor, Number(period.base_ends_at),
        Number(period.base_amount_due_minor), period.id),
    db.prepare(`UPDATE subscriptions SET ends_at = ?,
      access_status = CASE WHEN access_status = 'pending' AND EXISTS (
        SELECT 1 FROM referrals WHERE referred_user_id = ? AND status IN ('registered', 'awaiting_payment')
      ) THEN 'enabled' ELSE access_status END,
      version = version + 1, updated_at = ? WHERE id = ?`)
      .bind(nextEndsAt, userId, now, period.subscription_id),
    db.prepare(`UPDATE referrals SET
      status = 'completed', completion_payment_id = ?, completed_at = ?,
      referral_number = ${rewardSlot},
      reward_movie_requests = CASE WHEN ${rewardSlot} IS NULL THEN 0 ELSE 2 END,
      reward_season_requests = CASE WHEN ${rewardSlot} IS NULL THEN 0
        WHEN ${rewardSlot} IN (3, 5) THEN 2 ELSE 1 END,
      rewarded_at = CASE WHEN ${rewardSlot} IS NULL THEN NULL ELSE ? END,
      updated_at = ?
      WHERE referred_user_id = ? AND status IN ('registered', 'awaiting_payment')
        AND completion_payment_id IS NULL
        AND EXISTS (SELECT 1 FROM subscriptions paid_subscription
          JOIN subscription_tiers paid_tier ON paid_tier.id = paid_subscription.tier_id
          WHERE paid_subscription.user_id = referrals.referred_user_id
            AND paid_subscription.access_status = 'enabled'
            AND paid_tier.monthly_price_minor > 0)`)
      .bind(paymentId, now, now, now, userId),
    db.prepare(`INSERT INTO referral_credit_balances(user_id, movie_credits, season_credits, updated_at)
      SELECT referrer_user_id, reward_movie_requests, reward_season_requests, ? FROM referrals
      WHERE referred_user_id = ? AND completion_payment_id = ? AND rewarded_at IS NOT NULL
      ON CONFLICT(user_id) DO UPDATE SET
        movie_credits = referral_credit_balances.movie_credits + excluded.movie_credits,
        season_credits = referral_credit_balances.season_credits + excluded.season_credits,
        updated_at = excluded.updated_at`).bind(now, userId, paymentId),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_recorded', ?, ?)`)
      .bind(crypto.randomUUID(), actor.id, userId, details, now),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      SELECT ?, ?, ?, 'referral.reward_issued', ?, ? FROM referrals
      WHERE referred_user_id = ? AND completion_payment_id = ?`)
      .bind(crypto.randomUUID(), actor.id, userId, JSON.stringify({ paymentId }), now, userId, paymentId),
  ]);
  return adminDetail(db, userId, now);
}

async function voidPayment(db, actor, body, now) {
  const userId = identifier(body.userId);
  const paymentId = identifier(body.paymentId, "payment");
  await targetUser(db, userId);
  const payment = await db.prepare(`SELECT p.id, p.billing_period_id, s.id AS subscription_id,
      COALESCE(bp.base_ends_at, bp.ends_at) AS base_ends_at,
      COALESCE(bp.base_amount_due_minor, bp.amount_due_minor) AS base_amount_due_minor,
      CASE WHEN bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at THEN 1 ELSE 0 END AS is_current
    FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
    JOIN subscriptions s ON s.id = bp.subscription_id
    WHERE p.id = ? AND s.user_id = ? AND p.status != 'void'`).bind(paymentId, userId).first();
  if (!payment) throw new AuthError(404, "That payment could not be found or is already void.");
  const reward = await db.prepare(`SELECT r.referrer_user_id, r.reward_movie_requests, r.reward_season_requests,
      COALESCE(SUM(rr.movie_requests), 0) AS redeemed_movies,
      COALESCE(SUM(rr.season_requests), 0) AS redeemed_seasons
    FROM referrals r LEFT JOIN referral_redemptions rr
      ON rr.user_id = r.referrer_user_id AND rr.status = 'applied'
      AND rr.created_at >= COALESCE(r.completed_at, 0)
    WHERE r.referred_user_id = ? AND r.completion_payment_id = ?
    GROUP BY r.id, r.referrer_user_id, r.reward_movie_requests, r.reward_season_requests`)
    .bind(userId, paymentId).first();
  if (reward && (Number(reward.redeemed_movies) > 0 || Number(reward.redeemed_seasons) > 0)) {
    throw new AuthError(409, "That referral reward has already been redeemed, so void the temporary request adjustment first.");
  }
  await db.batch([
    db.prepare("UPDATE payments SET status = 'void' WHERE id = ? AND status != 'void'").bind(paymentId),
    db.prepare(`UPDATE referrals SET status = 'awaiting_payment', completion_payment_id = NULL,
      completed_at = NULL, rewarded_at = NULL, referral_number = NULL,
      reward_movie_requests = 0, reward_season_requests = 0, updated_at = ?
      WHERE referred_user_id = ? AND completion_payment_id = ?`).bind(now, userId, paymentId),
    db.prepare(`UPDATE referral_credit_balances SET
      movie_credits = MAX(0, movie_credits - ?), season_credits = MAX(0, season_credits - ?), updated_at = ?
      WHERE user_id = ?`).bind(Number(reward?.reward_movie_requests || 0),
      Number(reward?.reward_season_requests || 0), now, reward?.referrer_user_id || ""),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_voided', ?, ?)`)
      .bind(crypto.randomUUID(), actor.id, userId, JSON.stringify({ paymentId }), now),
  ]);
  const activeCoverage = await db.prepare(`SELECT
      COALESCE(MAX(coverage_ends_at), ?) AS latest_coverage_end,
      COALESCE(SUM(period_extension_minor), 0) AS extension_minor
    FROM payments WHERE billing_period_id = ? AND status = 'confirmed'`)
    .bind(Number(payment.base_ends_at), payment.billing_period_id).first();
  const nextEndsAt = Math.max(Number(payment.base_ends_at), Number(activeCoverage.latest_coverage_end));
  const nextAmountDueMinor = Number(payment.base_amount_due_minor) + Number(activeCoverage.extension_minor);
  await db.batch([
    db.prepare("UPDATE billing_periods SET ends_at = ?, amount_due_minor = ? WHERE id = ?")
      .bind(nextEndsAt, nextAmountDueMinor, payment.billing_period_id),
    db.prepare("UPDATE subscriptions SET ends_at = ?, version = version + 1, updated_at = ? WHERE id = ? AND ? = 1")
      .bind(nextEndsAt, now, payment.subscription_id, Number(payment.is_current)),
  ]);
  return adminDetail(db, userId, now);
}

function errorResponse(error) {
  return reply({ message: error instanceof AuthError ? error.message : "Billing services are temporarily unavailable. Please try again later." },
    error instanceof AuthError ? error.status : 503);
}

export async function billingResponse(request, env) {
  try {
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    const current = await authenticated(request, env);
    return reply({ billing: await billingForUser(env.PORTAL_DB, current.id) });
  } catch (error) { return errorResponse(error); }
}

export async function adminBillingResponse(request, env) {
  try {
    const url = ensureHttps(request);
    if (!["GET", "POST"].includes(request.method)) return reply({ message: "Method not allowed." }, 405, { Allow: "GET, POST" });
    const current = await authenticated(request, env, true);
    const now = Date.now();
    if (request.method === "GET") return reply(await adminDetail(env.PORTAL_DB, url.searchParams.get("userId"), now));
    const body = await readBody(request);
    if (body.action === "save_plan") return reply(await savePlan(env.PORTAL_DB, current, body, now));
    if (body.action === "record_payment") return reply(await recordPayment(env.PORTAL_DB, current, body, now));
    if (body.action === "void_payment") return reply(await voidPayment(env.PORTAL_DB, current, body, now));
    if (body.action === "save_addons") return reply(await saveAddons(env.PORTAL_DB, current, body, now));
    throw new AuthError(400, "Select a valid billing action.");
  } catch (error) { return errorResponse(error); }
}
