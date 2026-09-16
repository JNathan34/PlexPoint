import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { plexAuthResponse } from "../shared/portal/plex-auth.js";
import { authResponse } from "../shared/portal/auth.js";

const origin = "https://portal.example.test";
const accessToken = "test-only-plex-authorization";
function request(action, cookie, body = {}, headers = {}) {
  return new Request(`${origin}/api/portal/plex/${action}`, { method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", "X-PlexPoint-Request": "1", ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: JSON.stringify(body) });
}
const cookies = (response) => response.headers.getSetCookie().map((value) => value.split(";")[0]);
function setup(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  for (const file of ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql"]) {
    db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
  const prepare = (sql) => {
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      first() { return db.prepare(sql).get(...args) || null; },
      all() { return { success: true, results: db.prepare(sql).all(...args) }; },
      run() { return { success: true, meta: db.prepare(sql).run(...args) }; },
    };
  };
  const env = { PORTAL_DB: { prepare, batch(statements) {
    db.exec("BEGIN");
    try { const result = statements.map((s) => s.all()); db.exec("COMMIT"); return result; }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  } } };
  const provider = { authorized: true, failure: false, redirect: false, invalidPin: false,
    user: { id: 4321, username: "PlexMovieFan", email: "plex@example.test" }, calls: [] };
  const fetcher = async (url, options) => {
    provider.calls.push({ url, options });
    assert.equal(new URL(url).origin, "https://plex.tv");
    assert.equal(options.redirect, "manual");
    assert.equal(options.headers["X-Plex-Product"], "PlexPoint");
    assert.ok(options.headers["X-Plex-Client-Identifier"]);
    if (provider.failure) throw new Error("provider-private-error");
    if (provider.redirect) {
      return new Response(null, { status: 302, headers: { Location: "https://example.test/not-plex" } });
    }
    if (new URL(url).pathname.endsWith("/user")) {
      assert.equal(options.headers["X-Plex-Token"], accessToken);
      assert.ok(!url.includes(accessToken));
      return Response.json(provider.user);
    }
    return Response.json({ id: provider.invalidPin ? -1 : 9876, code: "strongPinCode123456789", expiresIn: 600,
      ...(options.method === "GET" ? { authToken: provider.authorized ? accessToken : null } : {}) });
  };
  return { db, env, provider,
    call: (action, cookie, body, headers) => plexAuthResponse(request(action, cookie, body, headers), env, action, fetcher),
    async localAccount(email = "plex@example.test") {
      const response = await authResponse(request("register", null, { displayName: "Existing User", email, password: "a unique local test passphrase" }), env, "register");
      assert.equal(response.status, 201);
      return { cookie: cookies(response)[0], user: (await response.json()).user };
    },
  };
}

async function begin(call, session) {
  const response = await call("start", session);
  assert.equal(response.status, 200, await response.clone().text());
  return { response, state: cookies(response)[0], cookie: [cookies(response)[0], session].filter(Boolean).join("; ") };
}

test("Plex start creates a short-lived browser-bound flow and a fixed authorization destination", async (t) => {
  const { call, db, provider } = setup(t);
  const { response, state } = await begin(call);
  const data = await response.json();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.match(response.headers.get("Set-Cookie"), /^__Host-plexpoint_plex=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=600; Secure$/);
  const url = new URL(data.authorizationUrl);
  assert.equal(url.origin, "https://app.plex.tv");
  assert.equal(url.pathname, "/auth");
  const params = new URLSearchParams(url.hash.slice(2));
  assert.equal(params.get("forwardUrl"), `${origin}/account/?plex=return#account`);
  assert.equal(params.get("context[device][product]"), "PlexPoint");
  assert.equal(params.get("clientID"), provider.calls[0].options.headers["X-Plex-Client-Identifier"]);
  assert.equal(provider.calls[0].options.body, "strong=true");
  const row = db.prepare("SELECT * FROM plex_login_attempts").get();
  assert.notEqual(row.state_hash, state.split("=")[1]);
  assert.equal(row.user_id, null);
  assert.equal(db.prepare("SELECT count(*) AS n FROM users").get().n, 0);
});

test("Plex identity creates a normal portal session without persisting the Plex token or granting access", async (t) => {
  const { call, db, env } = setup(t);
  const { cookie } = await begin(call);
  const response = await call("complete", cookie, { plexId: "attacker-input", authToken: "untrusted" });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.user.displayName, "PlexMovieFan");
  assert.equal(data.user.plex.username, "PlexMovieFan");
  assert.equal(data.user.email, "plex@example.test");
  const session = cookies(response).find((value) => value.startsWith("__Host-plexpoint_session="));
  assert.ok(session);
  const me = await authResponse(new Request(`${origin}/api/portal/auth/session`, { headers: { Cookie: session } }), env, "session");
  assert.equal((await me.json()).user.plex.username, "PlexMovieFan");
  assert.equal(db.prepare("SELECT role FROM users").get().role, "user");
  for (const table of ["subscriptions", "password_credentials", "plex_account_links", "plex_login_attempts"]) {
    assert.equal(db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0);
  }
  for (const table of ["users", "plex_identities", "auth_sessions"]) {
    assert.ok(!JSON.stringify(db.prepare(`SELECT * FROM ${table}`).all()).includes(accessToken));
  }
  assert.ok(!JSON.stringify(data).includes(accessToken));
  assert.equal((await call("complete", cookie)).status, 410);
});

test("returning Plex users resolve by immutable provider ID even when their email changes", async (t) => {
  const { call, provider, db } = setup(t);
  const first = await begin(call);
  const user = (await (await call("complete", first.cookie)).json()).user;
  provider.user.email = "changed@example.test";
  provider.user.username = "NewName";
  const second = await begin(call);
  const returning = await call("complete", second.cookie);
  assert.equal(returning.status, 200);
  assert.equal((await returning.json()).user.id, user.id);
  assert.equal(db.prepare("SELECT count(*) AS n FROM users").get().n, 1);
  assert.equal(db.prepare("SELECT username FROM plex_identities").get().username, "NewName");
  db.exec("UPDATE users SET account_status='disabled'");
  const third = await begin(call);
  assert.equal((await call("complete", third.cookie)).status, 403);
});

test("matching emails never merge automatically; an authenticated user can explicitly connect Plex", async (t) => {
  const { call, localAccount, db } = setup(t);
  const local = await localAccount();
  const anonymous = await begin(call);
  const conflict = await call("complete", anonymous.cookie);
  assert.equal(conflict.status, 409);
  assert.match((await conflict.json()).message, /portal password/);
  assert.equal(db.prepare("SELECT count(*) AS n FROM plex_identities").get().n, 0);
  const linking = await begin(call, local.cookie);
  const response = await call("complete", linking.cookie);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.id, local.user.id);
  assert.equal(db.prepare("SELECT display_name FROM users").get().display_name, "Existing User");
  const returning = await begin(call);
  assert.equal((await (await call("complete", returning.cookie)).json()).user.id, local.user.id);
});

test("Plex linking rejects a swapped or logged-out initiating session", async (t) => {
  const { call, localAccount, db } = setup(t);
  const one = await localAccount("one@example.test");
  const two = await localAccount("two@example.test");
  const linking = await begin(call, one.cookie);
  assert.equal((await call("complete", `${linking.state}; ${two.cookie}`)).status, 409);
  assert.equal((await call("complete", linking.state)).status, 409);
  assert.equal(db.prepare("SELECT count(*) AS n FROM plex_identities").get().n, 0);
  const anonymous = await begin(call);
  assert.equal((await call("complete", `${anonymous.state}; ${one.cookie}`)).status, 409);
});

test("an already-linked Plex identity cannot be attached to a second portal account", async (t) => {
  const { call, localAccount } = setup(t);
  const first = await begin(call);
  assert.equal((await call("complete", first.cookie)).status, 200);
  const other = await localAccount("other@example.test");
  const second = await begin(call, other.cookie);
  assert.equal((await call("complete", second.cookie)).status, 409);
});

test("pending PINs are polled at most every two seconds and concurrent completion is single-use", async (t) => {
  const { call, provider, db } = setup(t);
  provider.authorized = false;
  const { cookie } = await begin(call);
  assert.equal((await call("complete", cookie)).status, 202);
  assert.equal((await call("complete", cookie)).status, 202);
  assert.equal(provider.calls.length, 2);
  assert.equal(db.prepare("SELECT count(*) AS n FROM users").get().n, 0);
  provider.authorized = true;
  db.exec("UPDATE plex_login_attempts SET last_poll_at=0");
  const responses = await Promise.all([call("complete", cookie), call("complete", cookie)]);
  assert.equal(responses.filter((response) => response.status === 200).length, 1);
  assert.equal(db.prepare("SELECT count(*) AS n FROM auth_sessions").get().n, 1);
});

test("missing, altered, expired, superseded, and cancelled state cannot authenticate", async (t) => {
  const { call, db, provider } = setup(t);
  assert.equal((await call("complete", null, { pinId: 9876 })).status, 410);
  assert.equal((await call("complete", `__Host-plexpoint_plex=${"a".repeat(64)}`)).status, 410);
  assert.equal(provider.calls.length, 0);
  const first = await begin(call);
  await begin(call, first.state);
  assert.equal((await call("complete", first.cookie)).status, 410);
  const expiring = await begin(call);
  db.exec("UPDATE plex_login_attempts SET expires_at=1");
  assert.equal((await call("complete", expiring.cookie)).status, 410);
  const cancelled = await begin(call);
  const response = await call("cancel", cancelled.cookie);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.equal((await call("complete", cancelled.cookie)).status, 410);
});

test("upstream failure and malformed identities never create accounts or reveal upstream errors", async (t) => {
  const { call, provider, db } = setup(t);
  provider.failure = true;
  const failure = await call("start");
  assert.equal(failure.status, 502);
  assert.doesNotMatch(await failure.text(), /provider-private-error/);
  provider.failure = false;
  provider.redirect = true;
  assert.equal((await call("start")).status, 502);
  provider.redirect = false;
  provider.invalidPin = true;
  assert.equal((await call("start")).status, 502);
  provider.invalidPin = false;
  const flow = await begin(call);
  provider.user.id = "invalid";
  assert.equal((await call("complete", flow.cookie)).status, 502);
  assert.equal(db.prepare("SELECT count(*) AS n FROM users").get().n, 0);
});

test("Plex endpoints enforce same-origin JSON POST, local binding and initiation throttles", async (t) => {
  const { call, provider, env } = setup(t);
  assert.equal((await call("start", null, {}, { Origin: "https://elsewhere.example.test" })).status, 403);
  assert.equal((await call("start", null, {}, { "X-PlexPoint-Request": "" })).status, 403);
  assert.equal((await call("start", null, {}, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await plexAuthResponse(new Request(`${origin}/api/portal/plex/start`), env, "start")).status, 405);
  assert.equal((await plexAuthResponse(request("start"), {}, "start")).status, 503);
  assert.equal(provider.calls.length, 0);
  for (let i = 0; i < 30; i++) assert.equal((await call("start")).status, 200);
  assert.equal((await call("start")).status, 429);
  assert.equal(provider.calls.length, 30);
});
