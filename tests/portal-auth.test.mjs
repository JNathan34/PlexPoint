import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { authResponse } from "../shared/portal/auth.js";

function setup(t, { avatars = true } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  t.after(() => sqlite.close());
  const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql"];
  if (avatars) migrations.push("0006_plex_avatars.sql");
  migrations.push("0007_vip_addons.sql", "0008_billing_coverage.sql", "0009_referrals.sql", "0010_referral_redemptions.sql");
  for (const file of migrations) {
    sqlite.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
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
  return { sqlite, env, call: (action, body, options) => authResponse(request(action, body, options), env, action) };
}
const details = { displayName: "Movie Fan", email: "fan@example.test", password: "A very long unique passphrase" };
function request(action, body, { cookie, origin = "https://portal.example.test", method, headers = {}, url = "https://portal.example.test" } = {}) {
  return new Request(`${url}/api/portal/auth/${action}`, {
    method: method || (action === "session" ? "GET" : "POST"),
    headers: { Origin: origin, "Content-Type": "application/json", "X-PlexPoint-Request": "1", ...(cookie ? { Cookie: cookie } : {}), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const cookieOf = (response) => response.headers.get("Set-Cookie").split(";")[0];

test("registration normalizes email, persists hashes, and creates no privileges or entitlements", async (t) => {
  const { call, sqlite } = setup(t);
  const response = await call("register", { ...details, email: " FAN@EXAMPLE.TEST ", role: "admin", account_status: "disabled" });
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.match(response.headers.get("Set-Cookie"), /^__Host-plexpoint_session=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure$/);
  const data = await response.json();
  assert.deepEqual(Object.keys(data.user).sort(), ["createdAt", "displayName", "email", "id"]);
  assert.equal(data.user.email, "fan@example.test");
  const user = sqlite.prepare("SELECT * FROM users").get();
  assert.equal(user.role, "user");
  assert.equal(user.account_status, "enabled");
  const credential = sqlite.prepare("SELECT * FROM password_credentials").get();
  assert.equal(credential.salt.length, 32);
  assert.equal(credential.password_hash.length, 64);
  assert.notEqual(credential.password_hash, details.password);
  assert.notEqual(sqlite.prepare("SELECT token_hash FROM auth_sessions").get().token_hash, cookieOf(response).split("=")[1]);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM subscriptions").get().n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM plex_account_links").get().n, 0);
  assert.equal((await (await call("session", undefined, { cookie: cookieOf(response) })).json()).user.id, data.user.id);
});

test("the configured owner email is returned and stored as an administrator", async (t) => {
  const { call, sqlite } = setup(t);
  const response = await call("register", { ...details, email: " JacobNathan1718@GMAIL.com " });
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.user.email, "jacobnathan1718@gmail.com");
  assert.equal(data.user.isAdmin, true);
  assert.equal(sqlite.prepare("SELECT role FROM users WHERE id = ?").get(data.user.id).role, "admin");
});

test("sessions remain available while the optional Plex avatar migration is pending", async (t) => {
  const { call, sqlite } = setup(t, { avatars: false });
  const registered = await call("register", details);
  const user = (await registered.clone().json()).user;
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
    .run("plex-before-avatar", user.id, "PlexBeforeAvatar", Date.now());
  const response = await call("session", undefined, { cookie: cookieOf(registered) });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).user.plex, { username: "PlexBeforeAvatar" });
});

test("login rotates the presented session and logout revokes it server-side", async (t) => {
  const { call, sqlite } = setup(t);
  const registered = await call("register", details);
  const first = cookieOf(registered);
  const loggedIn = await call("login", details, { cookie: first });
  assert.equal(loggedIn.status, 200);
  const second = cookieOf(loggedIn);
  assert.notEqual(second, first);
  assert.equal((await (await call("session", undefined, { cookie: first })).json()).user, null);
  assert.ok((await (await call("session", undefined, { cookie: second })).json()).user);
  const logout = await call("logout", {}, { cookie: second });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM auth_sessions").get().n, 0);
  assert.equal((await (await call("session", undefined, { cookie: second })).json()).user, null);
  assert.equal((await call("logout", {})).status, 200);
});

test("incorrect, missing-credential, disabled, and unknown accounts share the login failure", async (t) => {
  const { call, sqlite } = setup(t);
  const registered = await call("register", details);
  const responses = [await call("login", { ...details, password: "wrong password" }), await call("login", { ...details, email: "missing@example.test" })];
  sqlite.exec("UPDATE users SET account_status='disabled'");
  responses.push(await call("login", details));
  assert.equal((await (await call("session", undefined, { cookie: cookieOf(registered) })).json()).user, null);
  sqlite.exec("UPDATE users SET account_status='enabled'; DELETE FROM password_credentials");
  responses.push(await call("login", details));
  for (const response of responses) {
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("Set-Cookie"), null);
    assert.equal((await response.json()).message, "Email or password is incorrect.");
  }
});

test("expired, tampered, duplicate, and absent session cookies do not authenticate", async (t) => {
  const { call, sqlite } = setup(t);
  const registered = await call("register", details);
  const cookie = cookieOf(registered);
  for (const value of [undefined, "__Host-plexpoint_session=invalid", `__Host-plexpoint_session=${"a".repeat(64)}`, `${cookie}; ${cookie}`]) {
    assert.equal((await (await call("session", undefined, { cookie: value })).json()).user, null);
  }
  sqlite.exec("UPDATE auth_sessions SET created_at=1, expires_at=2");
  const expired = await call("session", undefined, { cookie });
  assert.equal((await expired.json()).user, null);
  assert.match(expired.headers.get("Set-Cookie"), /Max-Age=0/);
});

test("duplicate registration cannot replace credentials or grant a session", async (t) => {
  const { call, sqlite } = setup(t);
  await call("register", details);
  const original = sqlite.prepare("SELECT * FROM password_credentials").get();
  const duplicate = await call("register", { ...details, email: "FAN@EXAMPLE.TEST", password: "Some completely different passphrase" });
  assert.equal(duplicate.status, 400);
  assert.equal(duplicate.headers.get("Set-Cookie"), null);
  assert.deepEqual(sqlite.prepare("SELECT * FROM password_credentials").get(), original);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 1);
});

test("registration validates names, emails, and password bounds without trimming passwords", async (t) => {
  const { call, sqlite } = setup(t);
  for (const changed of [
    { displayName: " " }, { displayName: "n".repeat(101) }, { displayName: "bad\nname" },
    { email: "invalid" }, { email: "a".repeat(250) + "@example.test" }, { email: null },
    { password: "short" }, { password: "p".repeat(129) }, { password: 12345 },
  ]) assert.equal((await call("register", { ...details, ...changed })).status, 400);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 0);
  const password = "  a passphrase with spaces  ";
  assert.equal((await call("register", { ...details, password })).status, 201);
  assert.equal((await call("login", { ...details, password: password.trim() })).status, 401);
  assert.equal((await call("login", { ...details, password })).status, 200);
});

test("mutations reject cross-origin, missing custom headers, bad JSON, and oversized bodies", async (t) => {
  const { env, call, sqlite } = setup(t);
  assert.equal((await call("register", details, { origin: "https://other.example.test" })).status, 403);
  assert.equal((await call("register", details, { origin: "" })).status, 403);
  assert.equal((await call("register", details, { headers: { "X-PlexPoint-Request": "" } })).status, 403);
  assert.equal((await call("register", details, { headers: { "Content-Type": "text/plain" } })).status, 415);
  assert.equal((await call("register", { ...details, extra: "x".repeat(5000) })).status, 413);
  const malformed = new Request("https://portal.example.test/api/portal/auth/register", {
    method: "POST", headers: { Origin: "https://portal.example.test", "X-PlexPoint-Request": "1", "Content-Type": "application/json" }, body: "{",
  });
  assert.equal((await authResponse(malformed, env, "register")).status, 400);
  assert.equal((await call("register", [])).status, 400);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 0);
});

test("unsupported methods, unknown actions, and unconfigured databases fail closed", async (t) => {
  const { call } = setup(t);
  const response = await call("login", undefined, { method: "GET" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
  assert.equal((await call("unknown", {})).status, 404);
  assert.equal((await authResponse(request("register", details), {}, "register")).status, 503);
  assert.equal((await authResponse(request("session"), { PORTAL_DB: { prepare() { throw new Error("private SQL error"); } } }, "session")).status, 200);
  assert.equal((await call("register", details, { url: "http://portal.example.test", origin: "http://portal.example.test" })).status, 400);
});

test("local HTTP uses a development cookie while production requires HTTPS", async (t) => {
  const { call } = setup(t);
  const response = await call("register", details, { url: "http://127.0.0.1", origin: "http://127.0.0.1" });
  assert.equal(response.status, 201);
  assert.match(response.headers.get("Set-Cookie"), /^plexpoint_local_session=/);
  assert.doesNotMatch(response.headers.get("Set-Cookie"), /; Secure/);
});

test("database-backed throttles cover unknown emails, expire, and store no raw identifiers", async (t) => {
  const { call, sqlite } = setup(t);
  for (let i = 0; i < 10; i++) assert.equal((await call("login", details)).status, 401);
  const limited = await call("login", details);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "900");
  assert.ok(sqlite.prepare("SELECT key_hash FROM auth_rate_limits").all().every((row) => /^[a-f0-9]{64}$/.test(row.key_hash)));
  sqlite.exec("UPDATE auth_rate_limits SET expires_at=1");
  assert.equal((await call("login", details)).status, 401);
});

test("registration batches roll back and never leak database errors", async (t) => {
  const { call, sqlite } = setup(t);
  sqlite.exec("CREATE TRIGGER reject_session BEFORE INSERT ON auth_sessions BEGIN SELECT RAISE(ABORT, 'private failure'); END");
  const response = await call("register", details);
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private failure/);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM password_credentials").get().n, 0);
});
