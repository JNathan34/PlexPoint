import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { authResponse } from "../shared/portal/auth.js";
import { adminBillingResponse } from "../shared/portal/billing.js";
import { adminReferralsResponse, referralLandingResponse, referralsResponse } from "../shared/portal/referrals.js";

const files = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql",
  "0005_admin_account.sql", "0006_plex_avatars.sql", "0007_vip_addons.sql", "0008_billing_coverage.sql", "0009_referrals.sql", "0010_referral_redemptions.sql"];
const origin = "https://portal.example.test";
const password = "A very long unique passphrase";

function setup(t) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  for (const file of files) sqlite.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  const prepare = (sql) => { let values = []; return {
    bind(...args) { values = args; return this; },
    first() { return sqlite.prepare(sql).get(...values) || null; },
    all() { return { success: true, results: sqlite.prepare(sql).all(...values) }; },
    run() { return { success: true, meta: sqlite.prepare(sql).run(...values) }; },
  }; };
  return { sqlite, env: { OVERSEERR_API_KEY: "test-overseerr-key-123456", PORTAL_DB: { prepare, batch(statements) {
    sqlite.exec("BEGIN");
    try { const results = statements.map((statement) => statement.all()); sqlite.exec("COMMIT"); return results; }
    catch (error) { sqlite.exec("ROLLBACK"); throw error; }
  } } } };
}

function jsonRequest(path, cookie, body) {
  return new Request(`${origin}${path}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : {
      Origin: origin, "Content-Type": "application/json", "X-PlexPoint-Request": "1",
    }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

async function register(env, email, displayName, cookie = "") {
  const response = await authResponse(jsonRequest("/api/portal/auth/register", cookie,
    { email, displayName, password }), env, "register");
  assert.equal(response.status, 201);
  const session = response.headers.getSetCookie().find((value) => value.startsWith("__Host-plexpoint_session="));
  return { cookie: session.split(";")[0], user: (await response.json()).user };
}

test("a referral survives signup, produces an order, and is rewarded once after admin payment", async (t) => {
  const { sqlite, env } = setup(t);
  const referrer = await register(env, "referrer@example.test", "Friendly Referrer");
  const dashboardResponse = await referralsResponse(jsonRequest("/api/portal/referrals", referrer.cookie), env);
  const dashboard = await dashboardResponse.json();
  assert.match(dashboard.dashboard.code, /^FRIENDLYREFE-[A-F0-9]{6}$/);
  assert.equal(dashboard.dashboard.completed, 0);

  const landing = await referralLandingResponse(new Request(`${origin}/join/${dashboard.dashboard.code}`), env, dashboard.dashboard.code);
  assert.equal(landing.status, 302);
  const referralCookie = landing.headers.getSetCookie()[0].split(";")[0];
  const friend = await register(env, "friend@example.test", "New Friend", referralCookie);
  const attached = sqlite.prepare("SELECT status FROM referrals WHERE referred_user_id = ?").get(friend.user.id);
  assert.equal(attached.status, "registered");

  const selected = await referralsResponse(jsonRequest("/api/portal/referrals", friend.cookie, {
    action: "save_order", tierId: "gold", addons: [{ id: "extra-movie", quantity: 2 }],
  }), env);
  assert.equal(selected.status, 200);
  const selectedData = await selected.json();
  assert.equal(selectedData.order.plan, "Gold Tier");
  assert.equal(selectedData.order.totalMinor, 600);
  assert.match(selectedData.order.id, /^PP-[A-F0-9]{10}$/);
  assert.match(selectedData.whatsappUrl, /^https:\/\/wa\.me\/447481861478\?text=/);

  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  let response = await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: friend.user.id, tierId: "gold", accessStatus: "pending",
    startsOn: "2026-09-01", nextDueOn: "2026-10-01",
  }), env);
  assert.equal(response.status, 200);
  response = await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: friend.user.id, amountMinor: 500, coverageMonths: 1,
    receivedOn: "2026-09-24", method: "bank_transfer", reference: "REF-FIRST", note: "Referral order paid",
  }), env);
  const paid = await response.json();
  assert.equal(paid.billing.subscription.accessStatus, "enabled");
  assert.equal(paid.referral.qualified, true);
  assert.equal(paid.referral.referralNumber, 1);
  assert.deepEqual(paid.referral.reward, { movies: 2, seasons: 1 });

  const after = await referralsResponse(jsonRequest("/api/portal/referrals", referrer.cookie), env);
  const progress = (await after.json()).dashboard;
  assert.equal(progress.completed, 1);
  assert.deepEqual(progress.totals, { movies: 2, seasons: 1 });

  await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: friend.user.id, amountMinor: 500, coverageMonths: 1,
    receivedOn: "2026-09-24", method: "cash", reference: "REF-SECOND", note: "Next month",
  }), env);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_events WHERE action='referral.reward_issued'").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM referrals WHERE rewarded_at IS NOT NULL").get().n, 1);

  const adminList = await adminReferralsResponse(jsonRequest("/api/portal/admin/referrals", admin.cookie), env);
  const list = await adminList.json();
  assert.equal(list.referrals[0].referrer.code, dashboard.dashboard.code);
  assert.equal(list.referrals[0].orderId, selectedData.order.id);
});

test("self-referral, free plans, and duplicate referrers are blocked", async (t) => {
  const { sqlite, env } = setup(t);
  const owner = await register(env, "owner@example.test", "Owner");
  const own = await referralsResponse(jsonRequest("/api/portal/referrals", owner.cookie), env);
  const code = (await own.json()).dashboard.code;
  const landing = await referralLandingResponse(new Request(`${origin}/join/${code}`), env, code);
  const ownReferralCookie = landing.headers.getSetCookie()[0].split(";")[0];
  const existingLogin = await authResponse(jsonRequest("/api/portal/auth/login", ownReferralCookie,
    { email: "owner@example.test", password }), env, "login");
  assert.equal(existingLogin.status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM referrals WHERE referred_user_id = ?").get(owner.user.id).n, 0);

  const friend = await register(env, "waiting@example.test", "Waiting");
  sqlite.prepare(`INSERT INTO referrals(id, referrer_user_id, referred_user_id, status, created_at, updated_at)
    VALUES ('manual-ref', ?, ?, 'registered', 1, 1)`).run(owner.user.id, friend.user.id);
  const free = await referralsResponse(jsonRequest("/api/portal/referrals", friend.cookie,
    { action: "save_order", tierId: "vip", addons: [] }), env);
  assert.equal(free.status, 400);
  assert.throws(() => sqlite.prepare(`INSERT INTO referrals(id, referrer_user_id, referred_user_id, status, created_at, updated_at)
    VALUES ('duplicate-ref', ?, ?, 'registered', 2, 2)`).run(friend.user.id, friend.user.id));

  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: friend.user.id, tierId: "silver", accessStatus: "cancelled",
    startsOn: "2026-09-01", nextDueOn: "2026-10-01",
  }), env);
  const cancelledPayment = await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: friend.user.id, amountMinor: 350, coverageMonths: 1,
    receivedOn: "2026-09-24", method: "cash", reference: "CANCELLED-PLAN", note: "Should not qualify",
  }), env);
  assert.equal(cancelledPayment.status, 200);
  const cancelledReferral = sqlite.prepare("SELECT status,rewarded_at FROM referrals WHERE referred_user_id = ?").get(friend.user.id);
  assert.equal(cancelledReferral.status, "registered");
  assert.equal(cancelledReferral.rewarded_at, null);
});

test("a member can never receive more than the five configured referral rewards", async (t) => {
  const { sqlite, env } = setup(t);
  const referrer = await register(env, "capped@example.test", "Capped Member");
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  for (let number = 1; number <= 5; number++) {
    const id = `completed-friend-${number}`;
    sqlite.prepare("INSERT INTO users(id,email,display_name) VALUES (?,?,?)").run(id, `${id}@example.test`, `Friend ${number}`);
    sqlite.prepare(`INSERT INTO referrals(id,referrer_user_id,referred_user_id,status,referral_number,
      reward_movie_requests,reward_season_requests,completed_at,rewarded_at,created_at,updated_at)
      VALUES (?,?,?,'completed',?,2,?,?,?,1,1)`).run(`ref-${number}`, referrer.user.id, id, number,
      [3, 5].includes(number) ? 2 : 1, number, number);
  }
  const sixth = await register(env, "sixth@example.test", "Sixth Friend");
  sqlite.prepare(`INSERT INTO referrals(id,referrer_user_id,referred_user_id,status,created_at,updated_at)
    VALUES ('sixth-ref',?,?,'registered',2,2)`).run(referrer.user.id, sixth.user.id);
  await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: sixth.user.id, tierId: "bronze", accessStatus: "enabled",
    startsOn: "2026-09-01", nextDueOn: "2026-10-01",
  }), env);
  const paid = await adminBillingResponse(jsonRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: sixth.user.id, amountMinor: 250, coverageMonths: 1,
    receivedOn: "2026-09-24", method: "cash", reference: "SIXTH-REFERRAL", note: "Paid",
  }), env);
  assert.equal(paid.status, 200);
  const sixthRow = sqlite.prepare("SELECT status,referral_number,rewarded_at,reward_movie_requests,reward_season_requests FROM referrals WHERE id='sixth-ref'").get();
  assert.equal(sixthRow.status, "completed");
  assert.equal(sixthRow.referral_number, null);
  assert.equal(sixthRow.rewarded_at, null);
  assert.equal(sixthRow.reward_movie_requests, 0);
  assert.equal(sixthRow.reward_season_requests, 0);
  const dashboard = await referralsResponse(jsonRequest("/api/portal/referrals", referrer.cookie), env);
  const progress = (await dashboard.json()).dashboard;
  assert.equal(progress.completed, 5);
  assert.deepEqual(progress.totals, { movies: 10, seasons: 7 });
  assert.equal(progress.nextReward, null);
});

test("a referrer chooses how many earned credits to redeem as a temporary monthly adjustment", async (t) => {
  const { sqlite, env } = setup(t);
  const referrer = await register(env, "redeemer@example.test", "Redeemer");
  sqlite.prepare(`INSERT INTO referral_credit_balances(user_id, movie_credits, season_credits, updated_at)
    VALUES (?, 4, 2, 100)`).run(referrer.user.id);
  let posted = null;
  const fetcher = async (input, options) => {
    const url = new URL(input);
    assert.equal(options.headers["X-Api-Key"], "test-overseerr-key-123456");
    if (url.pathname === "/api/v1/user" && !options.method) {
      return Response.json({ results: [{ id: 42, email: "redeemer@example.test", plexUsername: "Redeemer" }] });
    }
    if (url.pathname === "/api/v1/user/42/settings/main" && !options.method) {
      return Response.json({ username: "Redeemer", email: "redeemer@example.test", movieQuotaLimit: -1,
        movieQuotaDays: 7, movieQuotaPeriod: "days", movieQuotaBonus: 1, tvQuotaLimit: -1,
        tvQuotaDays: 7, tvQuotaPeriod: "days", tvQuotaBonus: 0 });
    }
    if (url.pathname === "/api/v1/user/42/settings/main" && options.method === "POST") {
      posted = JSON.parse(options.body);
      return Response.json(posted);
    }
    return new Response(null, { status: 404 });
  };
  const response = await referralsResponse(jsonRequest("/api/portal/referrals", referrer.cookie, {
    action: "redeem_reward", movies: 3, seasons: 1,
  }), env, fetcher);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.redeemed, { movies: 3, seasons: 1, month: new Date().toISOString().slice(0, 7) });
  assert.deepEqual(data.dashboard.available, { movies: 1, seasons: 1 });
  assert.equal(data.dashboard.redemptions[0].status, "applied");
  assert.equal(posted.movieQuotaBonus, 4);
  assert.equal(posted.tvQuotaBonus, 1);
  const remaining = sqlite.prepare("SELECT movie_credits,season_credits FROM referral_credit_balances WHERE user_id = ?")
    .get(referrer.user.id);
  assert.equal(remaining.movie_credits, 1);
  assert.equal(remaining.season_credits, 1);
});
