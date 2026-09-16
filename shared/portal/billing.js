import { AuthError, isAdminEmail, readBody, reply, sessionUser } from "./auth.js";

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
    amountMinor: Number(row.amount_minor),
    currency: row.currency,
    status: row.status,
    method: row.method,
    receivedAt: row.received_at == null ? null : Number(row.received_at),
    reference: row.provider_payment_id || null,
    periodStartsAt: Number(row.period_starts_at),
    periodEndsAt: Number(row.period_ends_at),
  };
}

export async function billingForUser(db, userId, { includeVoided = false, now = Date.now() } = {}) {
  const subscription = await db.prepare(`SELECT
    s.id, s.tier_id, s.access_status, s.starts_at, s.ends_at,
    t.name AS tier_name, t.monthly_price_minor, t.currency
    FROM subscriptions s JOIN subscription_tiers t ON t.id = s.tier_id
    WHERE s.user_id = ?`).bind(userId).first();
  if (!subscription) return { subscription: null, currentPeriod: null, payments: [] };

  const periodResult = await db.prepare(`SELECT
    bp.id, bp.tier_id, t.name AS tier_name, bp.starts_at, bp.ends_at,
    bp.amount_due_minor, bp.currency, bp.status,
    COALESCE(SUM(CASE WHEN p.status = 'confirmed' THEN p.amount_minor ELSE 0 END), 0) AS confirmed_minor,
    COALESCE(SUM(CASE WHEN p.status = 'pending' THEN p.amount_minor ELSE 0 END), 0) AS pending_minor
    FROM billing_periods bp
    JOIN subscription_tiers t ON t.id = bp.tier_id
    LEFT JOIN payments p ON p.billing_period_id = bp.id
    WHERE bp.subscription_id = ?
    GROUP BY bp.id, bp.tier_id, t.name, bp.starts_at, bp.ends_at, bp.amount_due_minor, bp.currency, bp.status
    ORDER BY bp.starts_at DESC LIMIT 24`).bind(subscription.id).all();
  const periods = (periodResult.results || []).map((row) => mapPeriod(row, now));
  const currentPeriod = periods.find((period) => period.status === "open"
    && period.startsAt === Number(subscription.starts_at) && period.endsAt === Number(subscription.ends_at))
    || periods.find((period) => period.status === "open") || null;

  const paymentResult = await db.prepare(`SELECT
    p.id, p.amount_minor, p.currency, p.status, p.method, p.received_at, p.provider_payment_id,
    bp.starts_at AS period_starts_at, bp.ends_at AS period_ends_at
    FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
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
  return {
    account,
    tiers: (tiersResult.results || []).map((tier) => ({
      id: tier.id, name: tier.name, monthlyPriceMinor: Number(tier.monthly_price_minor), currency: tier.currency,
    })),
    billing: await billingForUser(db, userId, { includeVoided: true, now }),
  };
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
      (id, subscription_id, tier_id, starts_at, ends_at, amount_due_minor, currency, status, reference, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
      ON CONFLICT(reference) DO UPDATE SET tier_id = excluded.tier_id, ends_at = excluded.ends_at,
        amount_due_minor = excluded.amount_due_minor, currency = excluded.currency, status = 'open'`)
      .bind(periodId, subscriptionId, tierId, startsAt, endsAt, Number(tier.monthly_price_minor), tier.currency, reference, now),
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

  const period = await db.prepare(`SELECT bp.id, bp.currency
    FROM subscriptions s JOIN billing_periods bp ON bp.subscription_id = s.id
    WHERE s.user_id = ? AND bp.status = 'open' AND bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at
    ORDER BY bp.starts_at DESC LIMIT 1`).bind(userId).first();
  if (!period) throw new AuthError(409, "Assign a plan and billing dates before recording a payment.");
  const paymentId = crypto.randomUUID();
  const details = JSON.stringify({ paymentId, amountMinor, currency: period.currency, method, receivedAt,
    ...(reference ? { reference } : {}) });
  await db.batch([
    db.prepare(`INSERT INTO payments
      (id, billing_period_id, amount_minor, currency, status, method, received_at, confirmed_at,
       recorded_by, provider, provider_payment_id, idempotency_key, created_at)
      VALUES (?, ?, ?, ?, 'confirmed', ?, ?, ?, ?, 'manual', ?, ?, ?)`)
      .bind(paymentId, period.id, amountMinor, period.currency, method, receivedAt, now, actor.id,
        reference || null, `manual:${paymentId}`, now),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_recorded', ?, ?)`)
      .bind(crypto.randomUUID(), actor.id, userId, details, now),
  ]);
  return adminDetail(db, userId, now);
}

async function voidPayment(db, actor, body, now) {
  const userId = identifier(body.userId);
  const paymentId = identifier(body.paymentId, "payment");
  await targetUser(db, userId);
  const payment = await db.prepare(`SELECT p.id FROM payments p
    JOIN billing_periods bp ON bp.id = p.billing_period_id
    JOIN subscriptions s ON s.id = bp.subscription_id
    WHERE p.id = ? AND s.user_id = ? AND p.status != 'void'`).bind(paymentId, userId).first();
  if (!payment) throw new AuthError(404, "That payment could not be found or is already void.");
  await db.batch([
    db.prepare("UPDATE payments SET status = 'void' WHERE id = ? AND status != 'void'").bind(paymentId),
    db.prepare(`INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at)
      VALUES (?, ?, ?, 'billing.payment_voided', ?, ?)`)
      .bind(crypto.randomUUID(), actor.id, userId, JSON.stringify({ paymentId }), now),
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
    throw new AuthError(400, "Select a valid billing action.");
  } catch (error) { return errorResponse(error); }
}
