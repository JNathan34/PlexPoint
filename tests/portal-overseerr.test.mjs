import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { authResponse } from "../shared/portal/auth.js";
import { avatarResponse, requestsResponse } from "../shared/portal/overseerr.js";

const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql", "0006_plex_avatars.sql", "0007_vip_addons.sql", "0008_billing_coverage.sql", "0009_referrals.sql"];

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
  return { sqlite, env: {
    OVERSEERR_API_KEY: "test-overseerr-key-123456",
    PORTAL_DB: {
      prepare,
      batch(statements) {
        sqlite.exec("BEGIN");
        try {
          const results = statements.map((statement) => statement.all());
          sqlite.exec("COMMIT");
          return results;
        } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
      },
    },
  } };
}

function authRequest(action, body, cookie) {
  return new Request(`https://portal.example.test/api/portal/auth/${action}`, {
    method: action === "session" ? "GET" : "POST",
    headers: { Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1", ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const cookieOf = (response) => response.headers.get("Set-Cookie").split(";")[0];

async function signedIn(t) {
  const { sqlite, env } = setup(t);
  const response = await authResponse(authRequest("register", {
    email: "viewer@example.test", displayName: "Viewer", password: "A very long unique passphrase",
  }), env, "register");
  const account = (await response.clone().json()).user;
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
    .run("123456", account.id, "PlexViewer", Date.now());
  return { sqlite, env, account, cookie: cookieOf(response) };
}

function overseerrFetcher(calls) {
  return async (input, options) => {
    const url = new URL(input);
    calls.push({ url, options });
    assert.equal(options.headers["X-Api-Key"], "test-overseerr-key-123456");
    assert.equal(options.redirect, "manual");
    if (url.pathname === "/api/v1/user") return Response.json({ results: [{
      id: 42, email: "viewer@example.test", plexUsername: "PlexViewer", avatar: "/avatarproxy/42",
    }] });
    if (url.pathname === "/api/v1/user/42/requests") return Response.json({ results: [{
      id: 8, status: 2, createdAt: "2026-09-15T12:00:00.000Z",
      media: { mediaType: "movie", tmdbId: 101, status: 3 },
    }] });
    if (url.pathname === "/api/v1/movie/101") return Response.json({ title: "A Recent Film", releaseDate: "2026-04-12", posterPath: "/poster.jpg" });
    if (url.pathname === "/avatarproxy/42") return new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/png" } });
    return new Response(null, { status: 404 });
  };
}

test("recent requests are matched to the signed-in Plex user and sanitized", async (t) => {
  const { env, cookie } = await signedIn(t);
  const calls = [];
  const response = await requestsResponse(new Request("https://portal.example.test/api/portal/requests", {
    headers: { Cookie: cookie },
  }), env, overseerrFetcher(calls));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data, { requests: [{
    id: 8,
    title: "A Recent Film",
    type: "movie",
    year: 2026,
    requestedAt: Date.parse("2026-09-15T12:00:00.000Z"),
    status: "processing",
    posterUrl: "https://image.tmdb.org/t/p/w185/poster.jpg",
  }] });
  assert.deepEqual(calls.map((call) => call.url.pathname), ["/api/v1/user", "/api/v1/user/42/requests", "/api/v1/movie/101"]);
  assert.equal(calls[1].url.searchParams.get("take"), "4");
  assert.doesNotMatch(JSON.stringify(data), /plexToken|test-overseerr-key/i);
});

test("profile pictures are proxied from Overseerr without exposing the API key", async (t) => {
  const { env, cookie } = await signedIn(t);
  const calls = [];
  const response = await avatarResponse(new Request("https://portal.example.test/api/portal/avatar", {
    headers: { Cookie: cookie },
  }), env, overseerrFetcher(calls));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "image/png");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
  assert.deepEqual(calls.map((call) => call.url.pathname), ["/api/v1/user", "/avatarproxy/42"]);
});

test("Overseerr failures stay isolated from the account session", async (t) => {
  const { env, cookie } = await signedIn(t);
  const session = await authResponse(authRequest("session", undefined, cookie), env, "session");
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.avatarUrl, "/api/portal/avatar");
  const requests = await requestsResponse(new Request("https://portal.example.test/api/portal/requests", {
    headers: { Cookie: cookie },
  }), env, async () => new Response("private upstream failure", { status: 500 }));
  assert.equal(requests.status, 502);
  assert.doesNotMatch(await requests.text(), /private upstream|test-overseerr-key/i);
});
