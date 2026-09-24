import { AuthError, isAdminEmail, readBody, reply, sessionUser } from "./auth.js";
import { memberReferralCode, readReferralCode, referralCookie } from "./referral-core.js";

const WHATSAPP_NUMBER = "447481861478";
const MAX_REFERRALS = 5;
const REWARDS = [
  { number: 1, seasons: 1, movies: 2 },
  { number: 2, seasons: 1, movies: 2 },
  { number: 3, seasons: 2, movies: 2 },
  { number: 4, seasons: 1, movies: 2 },
  { number: 5, seasons: 2, movies: 2 },
];

function ensureHttps(request) {
  const url = new URL(request.url);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new AuthError(400, "Account access requires HTTPS.");
  }
  return url;
}

function mapAddon(row) {
  return { id: row.id, name: row.name, description: row.description, priceMinor: Number(row.price_minor),
    currency: row.currency, billingLabel: row.billing_label };
}

async function landingReferral(db, request) {
  const code = readReferralCode(request);
  if (!code) return null;
  const row = await db.prepare(`SELECT rc.code, u.display_name
    FROM referral_codes rc JOIN users u ON u.id = rc.user_id
    WHERE rc.code = ? AND u.account_status = 'enabled'`).bind(code).first();
  return row ? { code: row.code, displayName: row.display_name } : null;
}

async function ensureOwnCode(db, user, now) {
  await db.prepare(`INSERT OR IGNORE INTO referral_codes(user_id, code, created_at) VALUES (?, ?, ?)`)
    .bind(user.id, memberReferralCode(user.display_name, user.id), now).run();
  return db.prepare("SELECT code FROM referral_codes WHERE user_id = ?").bind(user.id).first();
}

function mapReferral(row) {
  return {
    id: row.id, status: row.status, member: row.referred_name, createdAt: Number(row.created_at),
    completedAt: row.completed_at == null ? null : Number(row.completed_at),
    referralNumber: row.referral_number == null ? null : Number(row.referral_number),
    reward: { movies: Number(row.reward_movie_requests), seasons: Number(row.reward_season_requests) },
    orderId: row.order_id || null,
  };
}

export async function referralAdminDetail(db, userId) {
  const inbound = await db.prepare(`SELECT r.*, rc.code AS referrer_code, u.display_name AS referrer_name,
      t.name AS tier_name
    FROM referrals r
    JOIN users u ON u.id = r.referrer_user_id
    JOIN referral_codes rc ON rc.user_id = r.referrer_user_id
    LEFT JOIN subscription_tiers t ON t.id = r.selected_tier_id
    WHERE r.referred_user_id = ?`).bind(userId).first();
  if (!inbound) return null;
  let addons = [];
  try { addons = JSON.parse(inbound.addons_json || "[]"); } catch {}
  return {
    id: inbound.id, status: inbound.status, referredBy: { code: inbound.referrer_code, displayName: inbound.referrer_name },
    order: inbound.order_id ? { id: inbound.order_id, tierId: inbound.selected_tier_id, tier: inbound.tier_name,
      planPriceMinor: Number(inbound.plan_price_minor || 0), addons, addonsTotalMinor: Number(inbound.addons_total_minor || 0),
      totalMinor: Number(inbound.order_total_minor || 0), currency: inbound.currency } : null,
    qualified: inbound.status === "completed", rewardIssued: inbound.rewarded_at != null,
    referralNumber: inbound.referral_number == null ? null : Number(inbound.referral_number),
    reward: { movies: Number(inbound.reward_movie_requests), seasons: Number(inbound.reward_season_requests) },
  };
}

async function memberDashboard(db, request, user, now) {
  const ownCode = await ensureOwnCode(db, user, now);
  const result = await db.prepare(`SELECT r.id, r.status, r.created_at, r.completed_at, r.referral_number,
      r.reward_movie_requests, r.reward_season_requests, r.order_id, u.display_name AS referred_name
    FROM referrals r JOIN users u ON u.id = r.referred_user_id
    WHERE r.referrer_user_id = ? ORDER BY r.created_at DESC`).bind(user.id).all();
  const referrals = (result.results || []).map(mapReferral);
  const rewarded = referrals.filter((item) => item.referralNumber != null);
  const totals = rewarded.reduce((value, item) => ({ movies: value.movies + item.reward.movies,
    seasons: value.seasons + item.reward.seasons }), { movies: 0, seasons: 0 });
  const inbound = await referralAdminDetail(db, user.id);
  const tiers = await db.prepare(`SELECT id, name, monthly_price_minor, currency FROM subscription_tiers
    WHERE enabled = 1 AND monthly_price_minor > 0 ORDER BY sort_order, name`).all();
  const addons = await db.prepare(`SELECT id, name, description, price_minor, currency, billing_label
    FROM addon_catalog WHERE enabled = 1 ORDER BY sort_order, name`).all();
  const completed = rewarded.length;
  const nextReward = REWARDS.find((reward) => reward.number > completed) || null;
  return {
    landing: await landingReferral(db, request),
    dashboard: {
      code: ownCode.code, link: `${new URL(request.url).origin}/join/${encodeURIComponent(ownCode.code)}`,
      completed, maximum: MAX_REFERRALS, totals, nextReward, rewards: REWARDS, referrals,
    },
    inbound,
    plans: (tiers.results || []).map((tier) => ({ id: tier.id, name: tier.name,
      monthlyPriceMinor: Number(tier.monthly_price_minor), currency: tier.currency })),
    addons: (addons.results || []).map(mapAddon),
  };
}

async function saveOrder(db, user, body, now) {
  const inbound = await db.prepare(`SELECT id, status FROM referrals WHERE referred_user_id = ?`)
    .bind(user.id).first();
  if (!inbound) throw new AuthError(409, "Open a valid friend referral link before choosing a plan.");
  if (!["registered", "awaiting_payment"].includes(inbound.status)) {
    throw new AuthError(409, "This referral order has already been completed.");
  }
  const tierId = typeof body.tierId === "string" ? body.tierId : "";
  const tier = await db.prepare(`SELECT id, name, monthly_price_minor, currency FROM subscription_tiers
    WHERE id = ? AND enabled = 1 AND monthly_price_minor > 0`).bind(tierId).first();
  if (!tier) throw new AuthError(400, "Choose an available paid plan.");
  if (!Array.isArray(body.addons) || body.addons.length > 10) throw new AuthError(400, "Choose valid extras.");
  const selected = [];
  const seen = new Set();
  for (const item of body.addons) {
    if (!item || typeof item.id !== "string" || seen.has(item.id) || !Number.isSafeInteger(item.quantity)
      || item.quantity < 1 || item.quantity > 10) throw new AuthError(400, "Choose valid extra quantities.");
    seen.add(item.id);
    selected.push({ id: item.id, quantity: item.quantity });
  }
  let addons = [];
  if (selected.length) {
    const placeholders = selected.map(() => "?").join(",");
    const rows = await db.prepare(`SELECT id, name, price_minor, currency, billing_label FROM addon_catalog
      WHERE enabled = 1 AND id IN (${placeholders})`).bind(...selected.map((item) => item.id)).all();
    if ((rows.results || []).length !== selected.length) throw new AuthError(400, "Choose available extras.");
    const byId = new Map(rows.results.map((row) => [row.id, row]));
    addons = selected.map((item) => { const row = byId.get(item.id); return { id: item.id, name: row.name,
      quantity: item.quantity, unitPriceMinor: Number(row.price_minor), totalMinor: Number(row.price_minor) * item.quantity,
      billingLabel: row.billing_label }; });
  }
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.totalMinor, 0);
  const total = Number(tier.monthly_price_minor) + addonsTotal;
  const existing = await db.prepare("SELECT order_id FROM referrals WHERE id = ?").bind(inbound.id).first();
  const orderId = existing?.order_id || `PP-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  await db.prepare(`UPDATE referrals SET status = 'awaiting_payment', selected_tier_id = ?, plan_price_minor = ?,
    addons_json = ?, addons_total_minor = ?, order_total_minor = ?, currency = ?, order_id = ?, updated_at = ?
    WHERE id = ? AND status IN ('registered', 'awaiting_payment')`)
    .bind(tier.id, Number(tier.monthly_price_minor), JSON.stringify(addons), addonsTotal, total, tier.currency, orderId, now, inbound.id).run();
  return { id: orderId, username: user.plex_username || user.display_name, plan: tier.name,
    planPriceMinor: Number(tier.monthly_price_minor), addons, addonsTotalMinor: addonsTotal,
    totalMinor: total, currency: tier.currency };
}

function whatsappOrder(order, inbound) {
  const extras = order.addons.length ? order.addons.map((addon) => `${addon.quantity}× ${addon.name}`).join(", ") : "None";
  const message = ["Hi, I'd like to complete my PlexPoint order.", "", `Order: ${order.id}`,
    `Plex username: ${order.username}`, `Plan: ${order.plan}`, `Extras: ${extras}`,
    `Total: £${(order.totalMinor / 100).toFixed(2)}`, `Referred by: ${inbound.referredBy.code}`].join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export async function referralsResponse(request, env) {
  try {
    ensureHttps(request);
    if (!["GET", "POST"].includes(request.method)) return reply({ message: "Method not allowed." }, 405, { Allow: "GET, POST" });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const user = await sessionUser(env.PORTAL_DB, request);
    if (!user) {
      if (request.method === "POST") throw new AuthError(401, "Please sign in to continue.");
      return reply({ landing: await landingReferral(env.PORTAL_DB, request), dashboard: null, inbound: null, plans: [], addons: [] });
    }
    const now = Date.now();
    if (request.method === "GET") return reply(await memberDashboard(env.PORTAL_DB, request, user, now));
    const body = await readBody(request);
    if (body.action !== "save_order") throw new AuthError(400, "Choose a valid referral action.");
    const order = await saveOrder(env.PORTAL_DB, user, body, now);
    const data = await memberDashboard(env.PORTAL_DB, request, user, now);
    return reply({ ...data, order, whatsappUrl: whatsappOrder(order, data.inbound) });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Referral services are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503);
  }
}

export async function adminReferralsResponse(request, env) {
  try {
    ensureHttps(request);
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const user = await sessionUser(env.PORTAL_DB, request);
    if (!user) throw new AuthError(401, "Please sign in to continue.");
    if (!isAdminEmail(user.email)) throw new AuthError(403, "Administrator access is required.");
    const rows = await env.PORTAL_DB.prepare(`SELECT r.id, r.status, r.order_id, r.created_at, r.completed_at,
      r.referral_number, r.reward_movie_requests, r.reward_season_requests,
      referrer.display_name AS referrer_name, rc.code AS referrer_code,
      referred.id AS referred_user_id, referred.display_name AS referred_name,
      t.name AS tier_name, r.order_total_minor, r.currency
      FROM referrals r
      JOIN users referrer ON referrer.id = r.referrer_user_id
      JOIN referral_codes rc ON rc.user_id = r.referrer_user_id
      JOIN users referred ON referred.id = r.referred_user_id
      LEFT JOIN subscription_tiers t ON t.id = r.selected_tier_id
      ORDER BY r.updated_at DESC, r.created_at DESC`).all();
    return reply({ referrals: (rows.results || []).map((row) => ({ id: row.id, status: row.status,
      referrer: { name: row.referrer_name, code: row.referrer_code }, referred: { id: row.referred_user_id, name: row.referred_name },
      orderId: row.order_id || null, tier: row.tier_name || null, totalMinor: row.order_total_minor == null ? null : Number(row.order_total_minor),
      currency: row.currency, referralNumber: row.referral_number == null ? null : Number(row.referral_number),
      reward: { movies: Number(row.reward_movie_requests), seasons: Number(row.reward_season_requests) },
      createdAt: Number(row.created_at), completedAt: row.completed_at == null ? null : Number(row.completed_at) })) });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Referral services are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503);
  }
}

export async function referralLandingResponse(request, env, code) {
  if (!env.PORTAL_DB || request.method !== "GET") return new Response(null, { status: request.method === "GET" ? 503 : 405 });
  const normalized = typeof code === "string" ? code.toUpperCase() : "";
  if (!/^[A-Z0-9-]{6,32}$/.test(normalized)) return Response.redirect(new URL("/account/?referral=invalid#account", request.url), 302);
  const valid = await env.PORTAL_DB.prepare(`SELECT rc.code FROM referral_codes rc JOIN users u ON u.id = rc.user_id
    WHERE rc.code = ? AND u.account_status = 'enabled'`).bind(normalized).first();
  if (!valid) return Response.redirect(new URL("/account/?referral=invalid#account", request.url), 302);
  return new Response(null, { status: 302, headers: {
    Location: new URL(`/account/?referred=${encodeURIComponent(valid.code)}#account`, request.url).href,
    "Set-Cookie": referralCookie(request, valid.code), "Cache-Control": "no-store",
  } });
}
