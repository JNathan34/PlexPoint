import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { authResponse } from "../shared/portal/auth.js";
import { adminRequestCreditsResponse, applyOverseerrRequestCredits, avatarResponse, configuredOverseerr, findOverseerrUser, requestsResponse } from "../shared/portal/overseerr.js";

const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql", "0006_plex_avatars.sql", "0007_vip_addons.sql", "0008_billing_coverage.sql", "0009_referrals.sql", "0010_referral_redemptions.sql"];

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
      id: 42, email: "viewer@example.test", plexId: 123456, plexUsername: "PlexViewer", avatar: "/avatarproxy/42",
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

test("request-service account matching searches every page and prefers the immutable Plex id", async () => {
  const config = configuredOverseerr({ OVERSEERR_API_KEY: "test-overseerr-key-123456" });
  const calls = [];
  const fetcher = async (input) => {
    const url = new URL(input);
    calls.push({ q: url.searchParams.get("q"), skip: Number(url.searchParams.get("skip")) });
    if (url.searchParams.has("q")) return Response.json({ pageInfo: { results: 0 }, results: [] });
    if (url.searchParams.get("skip") === "0") {
      return Response.json({ pageInfo: { results: 101 }, results: [
        { id: 5, email: "current@example.test", plexId: 999, plexUsername: "OldName" },
        ...Array.from({ length: 99 }, (_, index) => ({ id: 1000 + index, email: `other-${index}@example.test` })),
      ] });
    }
    return Response.json({ pageInfo: { results: 101 }, results: [
      { id: 42, email: "old@example.test", plexId: 123456, plexUsername: "PreviousName" },
    ] });
  };
  const result = await findOverseerrUser(config, {
    email: "current@example.test", plex_id: "123456", plex_username: "CurrentName",
  }, fetcher);
  assert.equal(result.id, 42);
  assert.deepEqual(calls, [
    { q: "current@example.test", skip: 0 },
    { q: "currentname", skip: 0 },
    { q: null, skip: 0 },
    { q: null, skip: 100 },
  ]);
});

test("request-service account matching uses the targeted user search first", async () => {
  const config = configuredOverseerr({ OVERSEERR_API_KEY: "test-overseerr-key-123456" });
  const calls = [];
  const fetcher = async (input) => {
    const url = new URL(input);
    calls.push(Object.fromEntries(url.searchParams));
    return Response.json({ pageInfo: { results: 1 }, results: [
      { id: 42, email: "viewer@example.test", plexId: 123456, plexUsername: "PlexViewer" },
    ] });
  };
  const result = await findOverseerrUser(config, {
    email: "viewer@example.test", plex_id: "123456", plex_username: "PlexViewer",
  }, fetcher);
  assert.equal(result.id, 42);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].q, "viewer@example.test");
  assert.equal(calls[0].take, "20");
});

test("targeted account matching supports older request servers that omit Plex ids", async () => {
  const config = configuredOverseerr({ OVERSEERR_API_KEY: "test-overseerr-key-123456" });
  let calls = 0;
  const result = await findOverseerrUser(config, {
    email: "viewer@example.test", plex_id: "123456", plex_username: "PlexViewer",
  }, async () => {
    calls++;
    return Response.json({ results: [
      { id: 42, email: "viewer@example.test", plexUsername: "PlexViewer" },
    ] });
  });
  assert.equal(result.id, 42);
  assert.equal(calls, 1);
});

test("referral credits increase the real account quota without changing other settings", async () => {
  const config = configuredOverseerr({ OVERSEERR_API_KEY: "test-overseerr-key-123456" });
  let posted = null;
  const quota = { movie: { limit: 5, used: 4, remaining: 1 }, tv: { limit: 4, used: 4, remaining: 0 } };
  const fetcher = async (input, options) => {
    const url = new URL(input);
    assert.equal(options.headers["X-Api-Key"], "test-overseerr-key-123456");
    if (url.pathname === "/api/v1/user/42/settings/main" && !options.method) {
      return Response.json({ username: "PlexViewer", email: "viewer@example.test", discordId: "123",
        locale: "en", discoverRegion: "GB", streamingRegion: "GB", originalLanguage: "en",
        movieQuotaLimit: 5, movieQuotaDays: 30, tvQuotaLimit: 4, tvQuotaDays: 30,
        watchlistSyncMovies: true, watchlistSyncTv: false });
    }
    if (url.pathname === "/api/v1/user/42/quota" && !options.method) return Response.json(quota);
    if (url.pathname === "/api/v1/user/42/settings/main" && options.method === "POST") {
      posted = JSON.parse(options.body);
      quota.movie.limit = posted.movieQuotaLimit;
      quota.movie.remaining = Math.max(0, quota.movie.limit - quota.movie.used);
      quota.tv.limit = posted.tvQuotaLimit;
      quota.tv.remaining = Math.max(0, quota.tv.limit - quota.tv.used);
      return Response.json(posted);
    }
    return new Response(null, { status: 404 });
  };
  const result = await applyOverseerrRequestCredits(config,
    { id: 42, email: "viewer@example.test", plex_username: "PlexViewer" }, { movies: 3, seasons: 2 }, fetcher);
  assert.deepEqual(result, { movieLimit: 8, tvLimit: 6 });
  assert.equal(posted.movieQuotaLimit, 8);
  assert.equal(posted.tvQuotaLimit, 6);
  assert.equal(posted.movieQuotaDays, 30);
  assert.equal(posted.tvQuotaDays, 30);
  assert.equal(posted.watchlistSyncMovies, true);
  assert.equal("movieQuotaBonus" in posted, false);
  assert.equal("tvQuotaBonus" in posted, false);
  assert.equal("discordId" in posted, false);
});

test("an ignored quota update is rejected instead of spending referral credits", async () => {
  const config = configuredOverseerr({ OVERSEERR_API_KEY: "test-overseerr-key-123456" });
  const fetcher = async (input, options) => {
    const url = new URL(input);
    if (url.pathname.endsWith("/settings/main") && !options.method) {
      return Response.json({ email: "viewer@example.test", movieQuotaLimit: 5, movieQuotaDays: 30,
        tvQuotaLimit: 4, tvQuotaDays: 30 });
    }
    if (url.pathname.endsWith("/quota")) {
      return Response.json({ movie: { limit: 5, used: 4, remaining: 1 }, tv: { limit: 4, used: 4, remaining: 0 } });
    }
    if (url.pathname.endsWith("/settings/main") && options.method === "POST") return Response.json({});
    return new Response(null, { status: 404 });
  };
  await assert.rejects(() => applyOverseerrRequestCredits(config,
    { id: 42, email: "viewer@example.test" }, { movies: 1, seasons: 0 }, fetcher), /did not save/);
});

test("an administrator can grant and verify request credits for a member", async (t) => {
  const { sqlite, env } = setup(t);
  const adminRegistration = await authResponse(authRequest("register", {
    email: "jacobnathan1718@gmail.com", displayName: "Jacob", password: "A very long unique admin passphrase",
  }), env, "register");
  const memberRegistration = await authResponse(authRequest("register", {
    email: "member@example.test", displayName: "Member", password: "A very long unique member passphrase",
  }), env, "register");
  const member = (await memberRegistration.clone().json()).user;
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
    .run("999", member.id, "MemberPlex", Date.now());
  const request = new Request("https://portal.example.test/api/portal/admin/request-credits", {
    method: "POST",
    headers: {
      Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1",
      Cookie: cookieOf(adminRegistration),
    },
    body: JSON.stringify({ userId: member.id, movies: 3, seasons: 2 }),
  });
  const quota = { movie: { limit: 5, used: 1, remaining: 4 }, tv: { limit: 4, used: 1, remaining: 3 } };
  const fetcher = async (input, options) => {
    const url = new URL(input);
    if (url.pathname === "/api/v1/user") {
      return Response.json({ results: [{ id: 42, email: "member@example.test", plexId: 999, plexUsername: "MemberPlex" }] });
    }
    if (url.pathname === "/api/v1/user/42/settings/main" && !options.method) {
      return Response.json({ username: "MemberPlex", email: "member@example.test",
        movieQuotaLimit: quota.movie.limit, movieQuotaDays: 30, tvQuotaLimit: quota.tv.limit, tvQuotaDays: 30 });
    }
    if (url.pathname === "/api/v1/user/42/quota") return Response.json(quota);
    if (url.pathname === "/api/v1/user/42/settings/main" && options.method === "POST") {
      const body = JSON.parse(options.body);
      quota.movie.limit = body.movieQuotaLimit;
      quota.tv.limit = body.tvQuotaLimit;
      return Response.json(body);
    }
    return new Response(null, { status: 404 });
  };
  const response = await adminRequestCreditsResponse(request, env, fetcher);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    granted: { movies: 3, seasons: 2 }, limits: { movies: 8, seasons: 6 },
  });
  const audit = sqlite.prepare("SELECT actor_id, subject_user_id, action, details_json FROM audit_events WHERE action = 'admin.requests_granted'").get();
  assert.equal(audit.subject_user_id, member.id);
  assert.equal(audit.action, "admin.requests_granted");
  assert.deepEqual(JSON.parse(audit.details_json), { movies: 3, seasons: 2, movieLimit: 8, seasonLimit: 6 });
});

test("request-credit grants reject non-admins and invalid amounts before contacting the service", async (t) => {
  const { env } = setup(t);
  const memberRegistration = await authResponse(authRequest("register", {
    email: "member@example.test", displayName: "Member", password: "A very long unique member passphrase",
  }), env, "register");
  let calls = 0;
  const request = (cookie, body) => new Request("https://portal.example.test/api/portal/admin/request-credits", {
    method: "POST",
    headers: {
      Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1", Cookie: cookie,
    },
    body: JSON.stringify(body),
  });
  const forbidden = await adminRequestCreditsResponse(request(cookieOf(memberRegistration), {
    userId: "member", movies: 1, seasons: 0,
  }), env, async () => { calls++; return Response.json({}); });
  assert.equal(forbidden.status, 403);

  const adminRegistration = await authResponse(authRequest("register", {
    email: "jacobnathan1718@gmail.com", displayName: "Jacob", password: "A very long unique admin passphrase",
  }), env, "register");
  const invalid = await adminRequestCreditsResponse(request(cookieOf(adminRegistration), {
    userId: "member", movies: 101, seasons: 0,
  }), env, async () => { calls++; return Response.json({}); });
  assert.equal(invalid.status, 400);
  assert.equal(calls, 0);
});
