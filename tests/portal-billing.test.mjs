import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { adminBillingResponse, billingResponse } from "../shared/portal/billing.js";
import { adminUsersResponse } from "../shared/portal/admin.js";
import { authResponse } from "../shared/portal/auth.js";

const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql", "0006_plex_avatars.sql", "0007_vip_addons.sql", "0008_billing_coverage.sql"];
const password = "A very long unique passphrase";

function setup(t) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  for (const file of migrations) sqlite.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  const prepare = (sql) => {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      first() { return sqlite.prepare(sql).get(...values) || null; },
      all() { return { success: true, results: sqlite.prepare(sql).all(...values) }; },
      run() { return { success: true, meta: sqlite.prepare(sql).run(...values) }; },
    };
  };
  const env = { PORTAL_DB: {
    prepare,
    batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((statement) => statement.all());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  } };
  return { sqlite, env };
}

function authRequest(action, body, cookie) {
  return new Request(`https://portal.example.test/api/portal/auth/${action}`, {
    method: action === "session" ? "GET" : "POST",
    headers: { Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1", ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const cookieOf = (response) => response.headers.get("Set-Cookie").split(";")[0];
const register = async (env, email, displayName) => {
  const response = await authResponse(authRequest("register", { email, displayName, password }), env, "register");
  return { cookie: cookieOf(response), user: (await response.json()).user };
};
const getRequest = (path, cookie) => new Request(`https://portal.example.test${path}`, { headers: cookie ? { Cookie: cookie } : {} });
const postRequest = (path, cookie, body) => new Request(`https://portal.example.test${path}`, {
  method: "POST",
  headers: { Cookie: cookie, Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1" },
  body: JSON.stringify(body),
});

test("an admin assigns a plan, records payments and members see their own billing history", async (t) => {
  const { sqlite, env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const member = await register(env, "member@example.test", "Member");

  const saved = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: member.user.id, tierId: "gold", accessStatus: "enabled",
    startsOn: "2026-07-01", nextDueOn: "2026-08-01",
  }), env);
  assert.equal(saved.status, 200);
  const savedData = await saved.json();
  assert.equal(savedData.billing.subscription.tier, "Gold Tier");
  assert.equal(savedData.billing.currentPeriod.paymentStatus, "overdue");
  assert.equal(savedData.billing.currentPeriod.outstandingMinor, 500);
  assert.equal(savedData.tiers.length, 7);
  assert.equal(savedData.availableAddons.length, 3);

  const addons = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_addons", userId: member.user.id,
    addons: [
      { id: "extra-movie", quantity: 2, startsOn: "2026-09-01", durationMonths: 2 },
      { id: "extra-season", quantity: 1, startsOn: "2026-09-01", durationMonths: 0 },
    ],
  }), env);
  assert.equal(addons.status, 200);
  const addonData = await addons.json();
  assert.deepEqual(addonData.billing.addons.map(({ id, quantity }) => ({ id, quantity })), [
    { id: "extra-movie", quantity: 2 }, { id: "extra-season", quantity: 1 },
  ]);
  assert.equal(addonData.billing.addons[0].durationMonths, 2);
  assert.equal(addonData.billing.addons[0].endsAt, Date.parse("2026-11-01T00:00:00Z"));
  assert.equal(addonData.billing.addons[1].endsAt, null);

  const payment = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: member.user.id, amountMinor: 500,
    receivedOn: "2026-07-15", method: "bank_transfer", reference: "BANK-001", coverageMonths: 1,
    note: "July membership",
  }), env);
  assert.equal(payment.status, 200);
  const paymentData = await payment.json();
  assert.equal(paymentData.billing.currentPeriod.paymentStatus, "paid");
  assert.equal(paymentData.billing.currentPeriod.outstandingMinor, 0);
  assert.equal(paymentData.billing.lastPayment.reference, "BANK-001");
  assert.equal(paymentData.billing.lastPayment.note, "July membership");
  assert.equal(paymentData.billing.lastPayment.coverageMonths, 1);

  const memberView = await billingResponse(getRequest("/api/portal/billing", member.cookie), env);
  assert.equal(memberView.status, 200);
  const memberData = await memberView.json();
  assert.equal(memberData.billing.subscription.tierId, "gold");
  assert.equal(memberData.billing.payments.length, 1);
  assert.equal(memberData.billing.payments[0].tier, "Gold Tier");
  assert.equal(memberData.billing.payments[0].amountMinor, 500);
  assert.equal(memberData.billing.addons[0].name, "Extra Movie Request");
  assert.equal(memberData.billing.addons[0].quantity, 2);
  assert.doesNotMatch(JSON.stringify(memberData), /recorded_by|actor_id|details_json|token_hash/i);

  const audit = sqlite.prepare("SELECT action FROM audit_events WHERE subject_user_id = ? ORDER BY created_at, action").all(member.user.id);
  assert.deepEqual(audit.map((row) => row.action).sort(), ["billing.addons_updated", "billing.payment_recorded", "billing.plan_updated"]);
});

test("billing access is private and admin mutations are owner-only and same-origin", async (t) => {
  const { env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const first = await register(env, "first@example.test", "First");
  const second = await register(env, "second@example.test", "Second");

  assert.equal((await billingResponse(getRequest("/api/portal/billing"), env)).status, 401);
  const own = await billingResponse(getRequest(`/api/portal/billing?userId=${second.user.id}`, first.cookie), env);
  assert.deepEqual(await own.json(), { billing: { subscription: null, currentPeriod: null, payments: [], addons: [] } });

  const forbidden = await adminBillingResponse(getRequest(`/api/portal/admin/billing?userId=${second.user.id}`, first.cookie), env);
  assert.equal(forbidden.status, 403);
  const crossOrigin = new Request("https://portal.example.test/api/portal/admin/billing", {
    method: "POST", headers: { Cookie: admin.cookie, Origin: "https://evil.example", "Content-Type": "application/json", "X-PlexPoint-Request": "1" },
    body: JSON.stringify({ action: "save_plan", userId: second.user.id }),
  });
  assert.equal((await adminBillingResponse(crossOrigin, env)).status, 403);
});

test("one payment can catch up several months or prepay several months ahead", async (t) => {
  const { env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const member = await register(env, "multi-month@example.test", "Multi Month");
  await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: member.user.id, tierId: "gold", accessStatus: "enabled",
    startsOn: "2026-07-01", nextDueOn: "2026-08-01",
  }), env);

  const caughtUp = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: member.user.id, amountMinor: 1500, coverageMonths: 3,
    receivedOn: "2026-09-01", method: "bank_transfer", reference: "CATCH-UP-3",
    note: "Caught up July to September",
  }), env);
  const caughtUpData = await caughtUp.json();
  assert.equal(caughtUpData.billing.subscription.endsAt, Date.parse("2026-10-01T00:00:00Z"));
  assert.equal(caughtUpData.billing.currentPeriod.amountDueMinor, 1500);
  assert.equal(caughtUpData.billing.currentPeriod.outstandingMinor, 0);
  assert.equal(caughtUpData.billing.lastPayment.coverageStartsAt, Date.parse("2026-07-01T00:00:00Z"));
  assert.equal(caughtUpData.billing.lastPayment.coverageEndsAt, Date.parse("2026-10-01T00:00:00Z"));

  const prepaid = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: member.user.id, amountMinor: 1500, coverageMonths: 3,
    receivedOn: "2026-09-02", method: "cash", reference: "AHEAD-3", note: "Three months ahead",
  }), env);
  const prepaidData = await prepaid.json();
  assert.equal(prepaidData.billing.subscription.endsAt, Date.parse("2027-01-01T00:00:00Z"));
  assert.equal(prepaidData.billing.currentPeriod.amountDueMinor, 3000);
  assert.equal(prepaidData.billing.currentPeriod.confirmedMinor, 3000);
  assert.equal(prepaidData.billing.currentPeriod.paymentStatus, "paid");
  assert.equal(prepaidData.billing.lastPayment.coverageStartsAt, Date.parse("2026-10-01T00:00:00Z"));
  assert.equal(prepaidData.billing.lastPayment.coverageEndsAt, Date.parse("2027-01-01T00:00:00Z"));

  const voided = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "void_payment", userId: member.user.id, paymentId: prepaidData.billing.lastPayment.id,
  }), env);
  const voidedData = await voided.json();
  assert.equal(voidedData.billing.subscription.endsAt, Date.parse("2026-10-01T00:00:00Z"));
  assert.equal(voidedData.billing.currentPeriod.amountDueMinor, 1500);
  assert.equal(voidedData.billing.currentPeriod.outstandingMinor, 0);
});

test("voiding a payment preserves its audit trail and restores the outstanding balance", async (t) => {
  const { sqlite, env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const member = await register(env, "member@example.test", "Member");
  await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: member.user.id, tierId: "bronze", accessStatus: "enabled",
    startsOn: "2026-08-01", nextDueOn: "2026-09-01",
  }), env);
  const recorded = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "record_payment", userId: member.user.id, amountMinor: 250,
    receivedOn: "2026-08-02", method: "cash", reference: "", coverageMonths: 1,
  }), env);
  const paymentId = (await recorded.json()).billing.payments[0].id;
  const voided = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "void_payment", userId: member.user.id, paymentId,
  }), env);
  const data = await voided.json();
  assert.equal(data.billing.payments[0].status, "void");
  assert.equal(data.billing.currentPeriod.outstandingMinor, 250);
  assert.equal(sqlite.prepare("SELECT status FROM payments WHERE id = ?").get(paymentId).status, "void");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM audit_events WHERE action = 'billing.payment_voided'").get().n, 1);
});

test("the admin user list includes an automatically calculated payment state", async (t) => {
  const { env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const member = await register(env, "member@example.test", "Member");
  await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: member.user.id, tierId: "silver", accessStatus: "enabled",
    startsOn: "2026-07-01", nextDueOn: "2026-08-01",
  }), env);
  const response = await adminUsersResponse(getRequest("/api/portal/admin/users", admin.cookie), env);
  const listed = (await response.json()).users.find((account) => account.id === member.user.id);
  assert.equal(listed.billing.status, "overdue");
  assert.equal(listed.billing.outstandingMinor, 350);
});

test("VIP uses the normal entitlement flow without requiring a payment", async (t) => {
  const { env } = setup(t);
  const admin = await register(env, "jacobnathan1718@gmail.com", "Jacob");
  const member = await register(env, "vip@example.test", "VIP Member");
  const response = await adminBillingResponse(postRequest("/api/portal/admin/billing", admin.cookie, {
    action: "save_plan", userId: member.user.id, tierId: "vip", accessStatus: "enabled",
    startsOn: "2026-09-01", nextDueOn: "2027-09-01",
  }), env);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.billing.subscription.tier, "VIP");
  assert.equal(data.billing.subscription.monthlyPriceMinor, 0);
  assert.equal(data.billing.currentPeriod.amountDueMinor, 0);
  assert.equal(data.billing.currentPeriod.paymentStatus, "paid");
  assert.equal(data.billing.payments.length, 0);
});
