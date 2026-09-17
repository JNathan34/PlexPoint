import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { activityResponse } from "../shared/portal/activity.js";
import { authResponse } from "../shared/portal/auth.js";

const migrations = ["0001_portal.sql", "0002_public_content.sql", "0003_auth.sql", "0004_plex_sign_in.sql", "0005_admin_account.sql", "0006_plex_avatars.sql"];

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
  const env = { TAUTULLI_API_KEY: "test-key-1234567890", PORTAL_DB: {
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

function authRequest(body) {
  return new Request("https://portal.example.test/api/portal/auth/register", {
    method: "POST",
    headers: { Origin: "https://portal.example.test", "Content-Type": "application/json", "X-PlexPoint-Request": "1" },
    body: JSON.stringify(body),
  });
}

const activityRequest = (cookie, range = "7", method = "GET") => new Request(`https://portal.example.test/api/portal/activity?range=${range}`, {
  method, headers: cookie ? { Cookie: cookie } : {},
});
const cookieOf = (response) => response.headers.get("Set-Cookie").split(";")[0];

function successfulTautulli(calls) {
  return async (input, options) => {
    const url = new URL(input);
    calls.push({ url, options });
    const command = url.searchParams.get("cmd");
    const statId = url.searchParams.get("stat_id");
    let data;
    if (command === "get_user_watch_time_stats") data = [{ query_days: 7, total_plays: 4, total_time: 7384 }];
    else if (command === "get_users") data = [{ user_id: 123456, username: "Viewer", email: "viewer@example.test" }];
    else if (statId === "popular_movies") data = [{ stat_id: statId, rows: [
      { title: "Movie One", year: 2026, total_plays: 12, users_watched: 5 },
      { title: "Movie Two", year: "2025", total_plays: "8", users_watched: "3" },
    ] }];
    else data = [{ stat_id: statId, rows: [{ title: "Show One", year: 2024, total_plays: 20, users_watched: 7 }] }];
    return Response.json({ response: { result: "success", message: null, data } });
  };
}

test("signed-in Plex users receive sanitized popular titles and personal watch time", async (t) => {
  const { sqlite, env } = setup(t);
  const registration = await authResponse(authRequest({ email: "viewer@example.test", displayName: "Viewer", password: "A very long unique passphrase" }), env, "register");
  const user = (await registration.clone().json()).user;
  const cookie = cookieOf(registration);
  sqlite.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
    .run("123456", user.id, "Viewer", Date.now());
  const calls = [];
  const response = await activityResponse(activityRequest(cookie), env, successfulTautulli(calls));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    range: "7",
    periodLabel: "Last 7 days",
    popularMovies: [
      { title: "Movie One", year: 2026, plays: 12, viewers: 5 },
      { title: "Movie Two", year: 2025, plays: 8, viewers: 3 },
    ],
    popularShows: [{ title: "Show One", year: 2024, plays: 20, viewers: 7 }],
    watchTime: { seconds: 7384, plays: 4 },
  });
  assert.equal(calls.length, 4);
  for (const call of calls) {
    assert.equal(call.url.origin, "https://tautulli.plexpoint.uk");
    assert.equal(call.url.pathname, "/api/v2");
    assert.equal(call.url.searchParams.has("apikey"), false);
    assert.equal(call.options.headers["X-Api-Key"], env.TAUTULLI_API_KEY);
    assert.equal(call.options.redirect, "error");
  }
  const personal = calls.find((call) => call.url.searchParams.get("cmd") === "get_user_watch_time_stats");
  assert.equal(personal.url.searchParams.get("user_id"), "123456");
  assert.equal(personal.url.searchParams.get("query_days"), "7");
});

test("email-only accounts still receive popular titles without another user's watch time", async (t) => {
  const { env } = setup(t);
  const registration = await authResponse(authRequest({ email: "email@example.test", displayName: "Email User", password: "A very long unique passphrase" }), env, "register");
  const calls = [];
  const response = await activityResponse(activityRequest(cookieOf(registration)), env, successfulTautulli(calls));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).watchTime, null);
  assert.equal(calls.length, 3);
  assert.equal(calls.filter((call) => call.url.searchParams.get("cmd") === "get_home_stats").length, 2);
  assert.equal(calls.filter((call) => call.url.searchParams.get("cmd") === "get_users").length, 1);
});

test("activity rejects unauthenticated, invalid, unconfigured, and unsupported requests", async (t) => {
  const { env } = setup(t);
  let upstreamCalls = 0;
  const fetcher = async () => { upstreamCalls++; return Response.json({}); };
  assert.equal((await activityResponse(activityRequest(), env, fetcher)).status, 401);
  assert.equal((await activityResponse(activityRequest(undefined, "365"), env, fetcher)).status, 400);
  const method = await activityResponse(activityRequest(undefined, "7", "POST"), env, fetcher);
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("Allow"), "GET");
  assert.equal(upstreamCalls, 0);

  const registration = await authResponse(authRequest({ email: "viewer@example.test", displayName: "Viewer", password: "A very long unique passphrase" }), env, "register");
  const unconfigured = await activityResponse(activityRequest(cookieOf(registration)), { PORTAL_DB: env.PORTAL_DB }, fetcher);
  assert.equal(unconfigured.status, 503);
  assert.equal((await unconfigured.json()).message, "Viewing activity is not configured yet.");
});

test("upstream errors are generic and never reveal configuration", async (t) => {
  const { env } = setup(t);
  const registration = await authResponse(authRequest({ email: "viewer@example.test", displayName: "Viewer", password: "A very long unique passphrase" }), env, "register");
  const response = await activityResponse(activityRequest(cookieOf(registration)), env, async () => new Response("private upstream failure", { status: 500 }));
  assert.equal(response.status, 502);
  const text = await response.text();
  assert.doesNotMatch(text, /private upstream|test-key|tautulli\.plexpoint/i);
  assert.match(text, /temporarily unavailable/i);
});
