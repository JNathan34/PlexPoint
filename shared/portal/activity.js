import { AuthError, reply, sessionUser } from "./auth.js";

const DEFAULT_TAUTULLI_URL = "https://tautulli.plexpoint.uk";
const ACTIVITY_RANGE = "7";
const ACTIVITY_LABEL = "Last 7 days";

function configuredEndpoint(env) {
  if (typeof env.TAUTULLI_API_KEY !== "string" || !/^[a-zA-Z0-9_-]{16,256}$/.test(env.TAUTULLI_API_KEY)) {
    throw new AuthError(503, "Viewing activity is not configured yet.");
  }
  let url;
  try { url = new URL(env.TAUTULLI_URL || DEFAULT_TAUTULLI_URL); }
  catch { throw new AuthError(503, "Viewing activity is not configured yet."); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new AuthError(503, "Viewing activity is not configured yet.");
  }
  const root = url.pathname.replace(/\/+$/, "");
  url.pathname = root.endsWith("/api/v2") ? root : `${root}/api/v2`;
  return { url, apiKey: env.TAUTULLI_API_KEY };
}

async function tautulliRequest(config, command, parameters, fetcher) {
  const url = new URL(config.url);
  url.searchParams.set("cmd", command);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json", "X-Api-Key": config.apiKey },
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("upstream status");
    const payload = await response.json();
    if (payload?.response?.result !== "success") throw new Error("upstream response");
    return payload.response.data;
  } finally { clearTimeout(timeout); }
}

const count = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
};

function popularItems(data, statId) {
  const stats = Array.isArray(data) ? data : [data];
  const rows = stats.find((stat) => stat?.stat_id === statId)?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 5).flatMap((row) => {
    const title = typeof row?.title === "string" ? row.title.trim().slice(0, 200) : "";
    if (!title) return [];
    const year = /^\d{4}$/.test(String(row.year || "")) ? Number(row.year) : null;
    return [{ title, year, plays: count(row.total_plays), viewers: count(row.users_watched) }];
  });
}

function watchTime(data, range) {
  if (!Array.isArray(data)) return null;
  const row = data.find((entry) => String(entry?.query_days) === range);
  return row ? { seconds: count(row.total_time), plays: count(row.total_plays) } : null;
}

const normalized = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

async function tautulliUserId(config, current, fetcher) {
  const candidate = String(current.tautulli_user_id || current.plex_id || "");
  const fallback = /^[1-9][0-9]{0,19}$/.test(candidate) ? candidate : "";
  try {
    const data = await tautulliRequest(config, "get_users", {}, fetcher);
    const users = Array.isArray(data) ? data : [];
    const plexUsername = normalized(current.plex_username);
    const email = normalized(current.email);
    const match = users.find((item) => fallback && String(item?.user_id) === fallback)
      || users.find((item) => email && normalized(item?.email) === email)
      || users.find((item) => plexUsername && [item?.username, item?.friendly_name].some((value) => normalized(value) === plexUsername));
    const resolved = String(match?.user_id || "");
    return /^[1-9][0-9]{0,19}$/.test(resolved) ? resolved : fallback;
  } catch (error) {
    console.warn(JSON.stringify({ event: "tautulli_user_lookup_unavailable", errorType: error instanceof Error ? error.name : typeof error }));
    return fallback;
  }
}

export async function activityResponse(request, env, fetcher = fetch) {
  try {
    const requestUrl = new URL(request.url);
    if (requestUrl.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    const requestedRange = requestUrl.searchParams.get("range");
    if (requestedRange && requestedRange !== ACTIVITY_RANGE) {
      throw new AuthError(400, "Viewing activity is fixed to the last 7 days.");
    }
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view activity.");
    const config = configuredEndpoint(env);
    const common = { grouping: "1", time_range: ACTIVITY_RANGE, stats_type: "plays", stats_count: "5" };
    const [moviesResult, showsResult, userId] = await Promise.all([
      tautulliRequest(config, "get_home_stats", { ...common, stat_id: "popular_movies" }, fetcher),
      tautulliRequest(config, "get_home_stats", { ...common, stat_id: "popular_tv" }, fetcher),
      tautulliUserId(config, current, fetcher),
    ].map((promise) => Promise.resolve(promise).then((value) => ({ value }), (error) => ({ error }))));
    const resolvedUserId = userId.value || "";
    let watchData = null;
    let watchError = null;
    if (resolvedUserId) {
      try {
        watchData = await tautulliRequest(config, "get_user_watch_time_stats",
          { grouping: "1", query_days: ACTIVITY_RANGE, user_id: resolvedUserId }, fetcher);
      } catch (error) { watchError = error; }
    }
    if (moviesResult.error && showsResult.error && (!resolvedUserId || watchError)) {
      throw moviesResult.error;
    }
    for (const [source, result] of [["movies", moviesResult], ["shows", showsResult]]) {
      if (result.error) console.warn(JSON.stringify({ event: "tautulli_partial_activity", source, errorType: result.error instanceof Error ? result.error.name : typeof result.error }));
    }
    if (watchError) console.warn(JSON.stringify({ event: "tautulli_partial_activity", source: "watch_time", errorType: watchError instanceof Error ? watchError.name : typeof watchError }));
    return reply({
      range: ACTIVITY_RANGE,
      periodLabel: ACTIVITY_LABEL,
      popularMovies: popularItems(moviesResult.value, "popular_movies"),
      popularShows: popularItems(showsResult.value, "popular_tv"),
      watchTime: resolvedUserId ? watchTime(watchData, ACTIVITY_RANGE) : null,
    });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({ event: "tautulli_activity_error", errorType: error instanceof Error ? error.name : typeof error }));
    return reply({ message: error instanceof AuthError ? error.message : "Viewing activity is temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 502);
  }
}
