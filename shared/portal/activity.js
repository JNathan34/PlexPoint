import { AuthError, reply, sessionUser } from "./auth.js";

const DEFAULT_TAUTULLI_URL = "https://tautulli.plexpoint.uk";
const PERIODS = {
  "1": "Last day",
  "7": "Last 7 days",
  "30": "Last 30 days",
  "0": "All time",
};

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

export async function activityResponse(request, env, fetcher = fetch) {
  try {
    const requestUrl = new URL(request.url);
    if (requestUrl.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    const range = requestUrl.searchParams.get("range") || "7";
    if (!PERIODS[range]) throw new AuthError(400, "Choose a valid viewing period.");
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view activity.");
    const config = configuredEndpoint(env);
    const common = { grouping: "1", time_range: range, stats_type: "plays", stats_count: "5" };
    const candidateUserId = String(current.tautulli_user_id || current.plex_id || "");
    const userId = /^[1-9][0-9]{0,19}$/.test(candidateUserId) ? candidateUserId : "";

    const [moviesData, showsData, watchData] = await Promise.all([
      tautulliRequest(config, "get_home_stats", { ...common, stat_id: "popular_movies" }, fetcher),
      tautulliRequest(config, "get_home_stats", { ...common, stat_id: "popular_tv" }, fetcher),
      userId ? tautulliRequest(config, "get_user_watch_time_stats", { grouping: "1", query_days: range, user_id: userId }, fetcher) : null,
    ]);
    return reply({
      range,
      periodLabel: PERIODS[range],
      popularMovies: popularItems(moviesData, "popular_movies"),
      popularShows: popularItems(showsData, "popular_tv"),
      watchTime: userId ? watchTime(watchData, range) : null,
    });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({ event: "tautulli_activity_error", errorType: error instanceof Error ? error.name : typeof error }));
    return reply({ message: error instanceof AuthError ? error.message : "Viewing activity is temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 502);
  }
}
