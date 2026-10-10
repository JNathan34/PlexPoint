import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { adminUsersResponse } from "../shared/portal/admin.js";
import { adminOverseerrUsersResponse } from "../shared/portal/admin-overseerr.js";
import { authResponse } from "../shared/portal/auth.js";

const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql", "0006_plex_avatars.sql", "0007_vip_addons.sql", "0008_billing_coverage.sql", "0009_referrals.sql", "0010_referral_redemptions.sql"];
const password = "A very long unique passphrase";

function setup(t, { avatars = true } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  for (const file of avatars ? migrations : migrations.filter((file) => file !== "0006_plex_avatars.sql")) sqlite.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
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

const account = (email, displayName) => ({ email, displayName, password });
const cookieOf = (response) => response.headers.get("Set-Cookie").split(";")[0];
const adminRequest = (cookie, method = "GET") => new Request("https://portal.example.test/api/portal/admin/users", {
  method, headers: cookie ? { Cookie: cookie } : {},
});
const importRequest = (cookie, body) => new Request("https://portal.example.test/api/portal/admin/overseerr-users", {
  method: body ? "POST" : "GET",
  headers: { Cookie: cookie, ...(body ? { Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1" } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
const overseerrFetch = async () => new Response(JSON.stringify({ results: [
  { id: 51, plexId: "plex-import-1", email: "first@example.test", plexUsername: "First", displayName: "First User", avatar: "https://images.example.test/first.jpg" },
  { id: 52, plexId: "plex-import-2", email: "second@example.test", plexUsername: "Second", displayName: "Second User" },
] }), { status: 200, headers: { "Content-Type": "application/json" } });

test("the owner can view a safe account list with Plex and subscription details", async (t) => {
  const { sqlite, env } = setup(t);
  const adminRegistration = await authResponse(authRequest("register", account("jacobnathan1718@gmail.com", "Jacob")), env, "register");
  const adminCookie = cookieOf(adminRegistration);
  const memberRegistration = await authResponse(authRequest("register", account("member@example.test", "Member")), env, "register");
  const member = (await memberRegistration.json()).user;
  const memberCookie = cookieOf(memberRegistration);
  const now = Date.now();
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at, avatar_url) VALUES (?, ?, ?, ?, ?)")
    .run("plex-member", member.id, "PlexMember", now, "https://plex.tv/users/member/avatar");
  sqlite.prepare("INSERT INTO subscriptions(id, user_id, tier_id, access_status, starts_at, ends_at, created_at, updated_at) VALUES (?, ?, ?, 'enabled', ?, ?, ?, ?)")
    .run("sub-member", member.id, "gold", now, now + 86400000, now, now);

  const forbidden = await adminUsersResponse(adminRequest(memberCookie), env);
  assert.equal(forbidden.status, 403);
  assert.equal((await forbidden.json()).message, "Administrator access is required.");

  const response = await adminUsersResponse(adminRequest(adminCookie), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const data = await response.json();
  assert.deepEqual(data.summary, { total: 2, enabled: 2, disabled: 0, subscribed: 1, overdue: 0 });
  const admin = data.users.find((user) => user.email === "jacobnathan1718@gmail.com");
  assert.equal(admin.isAdmin, true);
  assert.deepEqual(admin.signInMethods, ["Email"]);
  const listedMember = data.users.find((user) => user.id === member.id);
  assert.deepEqual(listedMember.signInMethods, ["Email", "Plex"]);
  assert.equal(listedMember.plexUsername, "PlexMember");
  assert.equal(listedMember.plexAvatarUrl, `/api/portal/avatar?userId=${encodeURIComponent(member.id)}`);
  assert.deepEqual(listedMember.subscription, { tier: "Gold Tier", status: "enabled", startsAt: now, endsAt: now + 86400000, monthlyPriceMinor: 500, currency: "GBP" });
  assert.doesNotMatch(JSON.stringify(data), /password_hash|token_hash|pin_code|\"salt\"/i);
});

test("the admin user list requires an authenticated owner and GET", async (t) => {
  const { env } = setup(t);
  assert.equal((await adminUsersResponse(adminRequest(), env)).status, 401);
  const method = await adminUsersResponse(adminRequest(undefined, "POST"), env);
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("Allow"), "GET");
  assert.equal((await adminUsersResponse(new Request("http://portal.example.test/api/portal/admin/users"), env)).status, 400);
});

test("the trusted Simply Pay manager can read the admin user list with CORS credentials", async (t) => {
  const { env } = setup(t);
  const registration = await authResponse(authRequest("register", account("jacobnathan1718@gmail.com", "Jacob")), env, "register");
  const response = await adminUsersResponse(new Request("https://portal.example.test/api/portal/admin/users", {
    headers: { Cookie: cookieOf(registration), Origin: "https://simply-pay.plexpoint.uk" },
  }), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://simply-pay.plexpoint.uk");
  const preflight = await adminUsersResponse(new Request("https://portal.example.test/api/portal/admin/users", {
    method: "OPTIONS", headers: { Origin: "https://simply-pay.plexpoint.uk" },
  }), env);
  assert.equal(preflight.status, 204);
});

test("the admin user list remains available before the avatar migration", async (t) => {
  const { sqlite, env } = setup(t, { avatars: false });
  const registration = await authResponse(authRequest("register", account("jacobnathan1718@gmail.com", "Jacob")), env, "register");
  const owner = (await registration.clone().json()).user;
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
    .run("owner-plex", owner.id, "JNathan34", Date.now());
  const response = await adminUsersResponse(adminRequest(cookieOf(registration)), env);
  assert.equal(response.status, 200);
  const listed = (await response.json()).users[0];
  assert.equal(listed.plexUsername, "JNathan34");
  assert.equal(listed.plexAvatarUrl, `/api/portal/avatar?userId=${encodeURIComponent(owner.id)}`);
});

test("an administrator can choose specific Overseerr users to import", async (t) => {
  const { sqlite, env } = setup(t);
  env.OVERSEERR_API_KEY = "a".repeat(24);
  env.OVERSEERR_URL = "https://requests.example.test";
  const registration = await authResponse(authRequest("register", account("jacobnathan1718@gmail.com", "Jacob")), env, "register");
  const cookie = cookieOf(registration);
  const listed = await adminOverseerrUsersResponse(importRequest(cookie), env, overseerrFetch);
  assert.equal(listed.status, 200);
  assert.deepEqual((await listed.json()).users.map((entry) => entry.status), ["available", "available"]);
  const imported = await adminOverseerrUsersResponse(importRequest(cookie, { action: "import_users", userIds: [52] }), env, overseerrFetch);
  assert.equal(imported.status, 200);
  assert.equal((await imported.json()).imported[0].displayName, "Second User");
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users WHERE email = 'first@example.test'").get().n, 0);
  assert.equal(sqlite.prepare("SELECT username FROM plex_identities WHERE plex_id = 'plex-import-2'").get().username, "Second");
  const relisted = await adminOverseerrUsersResponse(importRequest(cookie), env, overseerrFetch);
  assert.deepEqual((await relisted.json()).users.map((entry) => entry.status), ["available", "imported"]);
});

test("the Simply Pay manager can use the Overseerr importer with CORS", async (t) => {
  const { env } = setup(t);
  env.OVERSEERR_API_KEY = "a".repeat(24);
  env.OVERSEERR_URL = "https://requests.example.test";
  const registration = await authResponse(authRequest("register", account("jacobnathan1718@gmail.com", "Jacob")), env, "register");
  const response = await adminOverseerrUsersResponse(new Request("https://portal.example.test/api/portal/admin/overseerr-users", {
    headers: { Cookie: cookieOf(registration), Origin: "https://simply-pay.pages.dev" },
  }), env, overseerrFetch);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://simply-pay.pages.dev");
  const preflight = await adminOverseerrUsersResponse(new Request("https://portal.example.test/api/portal/admin/overseerr-users", {
    method: "OPTIONS", headers: { Origin: "https://simply-pay.pages.dev" },
  }), env, overseerrFetch);
  assert.equal(preflight.status, 204);
});
