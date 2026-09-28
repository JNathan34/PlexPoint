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
    const send = async (useQueryKey) => {
      const requestUrl = new URL(url);
      const headers = { Accept: "application/json" };
      if (useQueryKey) requestUrl.searchParams.set("apikey", config.apiKey);
      else headers["X-Api-Key"] = config.apiKey;
      const response = await fetcher(requestUrl, {
        headers,
        // Workers supports manual redirects at the edge; the status check below
        // rejects every 3xx so credentials never follow an upstream redirect.
        redirect: "manual",
        signal: controller.signal,
      });
      let payload = null;
      try { payload = await response.json(); } catch { /* handled below */ }
      return { response, payload };
    };

    let result = await send(false);
    const message = String(result.payload?.response?.message || "");
    const needsLegacyAuth = [400, 401, 403].includes(result.response.status)
      || (result.response.ok && result.payload?.response?.result !== "success"
        && /api.?key|unauthori[sz]ed/i.test(message));
    if (needsLegacyAuth) result = await send(true);
    if (!result.response.ok) throw new Error("upstream status");
    const payload = result.payload;
    if (payload?.response?.result !== "success") throw new Error("upstream response");
    return payload.response.data;
  } finally { clearTimeout(timeout); }
}

const count = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
};

function watchTime(data, range) {
  if (!Array.isArray(data)) return null;
  const row = data.find((entry) => String(entry?.query_days) === range);
  return row
    ? { seconds: count(row.total_time), plays: count(row.total_plays) }
    : { seconds: 0, plays: 0 };
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
    if (fallback) return fallback;
    throw error;
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
    const resolvedUserId = await tautulliUserId(config, current, fetcher);
    const watchData = resolvedUserId
      ? await tautulliRequest(config, "get_user_watch_time_stats",
        { grouping: "1", query_days: ACTIVITY_RANGE, user_id: resolvedUserId }, fetcher)
      : null;
    return reply({
      range: ACTIVITY_RANGE,
      periodLabel: ACTIVITY_LABEL,
      // Kept for response compatibility; the retired viewing panel no longer
      // needs two extra home-stat requests on every account-page load.
      popularMovies: [],
      popularShows: [],
      watchTime: resolvedUserId ? watchTime(watchData, ACTIVITY_RANGE) : null,
    });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({ event: "tautulli_activity_error", errorType: error instanceof Error ? error.name : typeof error }));
    return reply({ message: error instanceof AuthError ? error.message : "Viewing activity is temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 502);
  }
}
