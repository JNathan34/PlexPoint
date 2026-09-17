import { AuthError, isAdminEmail, plexAvatarColumnAvailable, reply, sessionUser } from "./auth.js";

const DEFAULT_OVERSEERR_URL = "https://request.plexpoint.uk";
const MAX_JSON_BYTES = 1_000_000;
const MAX_AVATAR_BYTES = 2_000_000;

function configuredOverseerr(env) {
  const apiKey = typeof env.OVERSEERR_API_KEY === "string" ? env.OVERSEERR_API_KEY.trim() : "";
  if (!/^[A-Za-z0-9+/_=-]{16,512}$/.test(apiKey)) {
    throw new AuthError(503, "Recent requests are not configured yet.");
  }
  let root;
  try { root = new URL(env.OVERSEERR_URL || DEFAULT_OVERSEERR_URL); }
  catch { throw new AuthError(503, "Recent requests are not configured yet."); }
  if (root.protocol !== "https:" || root.username || root.password || root.search || root.hash) {
    throw new AuthError(503, "Recent requests are not configured yet.");
  }
  root.pathname = root.pathname.replace(/\/+$/, "").replace(/\/api\/v1$/i, "") || "/";
  const apiBase = new URL(`${root.pathname.replace(/\/+$/, "")}/api/v1/`, root.origin);
  return { root, apiBase, apiKey };
}

async function overseerrJson(config, path, search, fetcher) {
  const url = new URL(path.replace(/^\/+/, ""), config.apiBase);
  for (const [key, value] of Object.entries(search || {})) url.searchParams.set(key, String(value));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json", "X-Api-Key": config.apiKey },
      // Workers does not implement redirect:"error". Manual mode keeps the
      // request on the fixed host and the status check rejects every 3xx.
      redirect: "manual",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("upstream status");
    const declaredLength = Number(response.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_JSON_BYTES) throw new Error("upstream response too large");
    const text = await response.text();
    if (text.length > MAX_JSON_BYTES) throw new Error("upstream response too large");
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("upstream response");
    return data;
  } finally { clearTimeout(timeout); }
}

const normalized = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

async function findOverseerrUser(config, account, fetcher) {
  const payload = await overseerrJson(config, "user", { take: 100, skip: 0, sort: "created" }, fetcher);
  const users = Array.isArray(payload.results) ? payload.results : [];
  const email = normalized(account.email);
  const plexUsername = normalized(account.plex_username || account.plexUsername);
  return users.find((candidate) => email && normalized(candidate?.email) === email)
    || users.find((candidate) => plexUsername && normalized(candidate?.plexUsername) === plexUsername)
    || null;
}

function safeText(value, fallback, limit = 200) {
  const text = typeof value === "string" ? value.trim().replace(/[\x00-\x1f\x7f]/g, "") : "";
  return text ? text.slice(0, limit) : fallback;
}

function mediaType(media) {
  const type = normalized(media?.mediaType || media?.type);
  if (type === "tv" || type === "show") return "tv";
  if (type === "movie") return "movie";
  return media?.tvdbId ? "tv" : "movie";
}

function requestStatus(request) {
  const mediaStatus = Number(request?.media?.status);
  if (mediaStatus === 5) return "added";
  if (mediaStatus === 4) return "partial";
  if (mediaStatus === 3) return "processing";
  if (mediaStatus === 6) return "removed";
  const status = Number(request?.status);
  if (status === 3) return "declined";
  if (status === 2) return "approved";
  if (status === 1) return "pending";
  return "unknown";
}

function safePoster(path) {
  return typeof path === "string" && /^\/[A-Za-z0-9._/-]{1,300}$/.test(path)
    ? `https://image.tmdb.org/t/p/w185${path}` : null;
}

function safeTimestamp(value) {
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

async function requestDetails(config, request, fetcher) {
  const media = request?.media && typeof request.media === "object" ? request.media : {};
  const type = mediaType(media);
  const tmdbId = Number(media.tmdbId);
  let details = media;
  if (Number.isInteger(tmdbId) && tmdbId > 0 && tmdbId <= 2_147_483_647) {
    try { details = await overseerrJson(config, `${type}/${tmdbId}`, {}, fetcher); }
    catch (error) {
      console.warn(JSON.stringify({ event: "overseerr_request_detail_unavailable", mediaType: type, errorType: error instanceof Error ? error.name : typeof error }));
    }
  }
  const title = safeText(details.title || details.name || media.title || media.name,
    type === "tv" ? "TV request" : "Movie request");
  const date = details.releaseDate || details.firstAirDate || details.release_date || details.first_air_date;
  const yearMatch = typeof date === "string" ? date.match(/^\d{4}/) : null;
  return {
    id: Number.isFinite(Number(request?.id)) ? Number(request.id) : null,
    title,
    type,
    year: yearMatch ? Number(yearMatch[0]) : null,
    requestedAt: safeTimestamp(request?.createdAt),
    status: requestStatus(request),
    posterUrl: safePoster(details.posterPath || details.poster_path || media.posterPath || media.poster_path),
  };
}

export async function requestsResponse(request, env, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view requests.");
    const config = configuredOverseerr(env);
    const overseerrUser = await findOverseerrUser(config, current, fetcher);
    if (!overseerrUser || !Number.isInteger(Number(overseerrUser.id))) return reply({ requests: [] });
    const payload = await overseerrJson(config, `user/${Number(overseerrUser.id)}/requests`, { take: 6, skip: 0 }, fetcher);
    const recent = Array.isArray(payload.results) ? payload.results.slice(0, 6) : [];
    return reply({ requests: await Promise.all(recent.map((item) => requestDetails(config, item, fetcher))) });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({
      event: "overseerr_requests_error",
      errorType: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error",
    }));
    return reply({ message: error instanceof AuthError ? error.message : "Recent requests are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 502);
  }
}

function safeAvatarSource(value, config) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value, config?.root || DEFAULT_OVERSEERR_URL);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
    return url;
  } catch { return null; }
}

async function accountForAvatar(db, id) {
  const avatarSelect = await plexAvatarColumnAvailable(db) ? "p.avatar_url AS plex_avatar_url" : "NULL AS plex_avatar_url";
  return db.prepare(`SELECT u.id, u.email, p.username AS plex_username, ${avatarSelect}
    FROM users u LEFT JOIN plex_identities p ON p.user_id = u.id WHERE u.id = ?`).bind(id).first();
}

async function proxiedAvatar(source, config, fetcher) {
  if (source.origin !== config?.root.origin) {
    return new Response(null, { status: 302, headers: { Location: source.href, "Cache-Control": "private, no-store", Vary: "Cookie" } });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(source, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif", "X-Api-Key": config.apiKey },
      redirect: "manual",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("upstream status");
    const type = (response.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    if (!new Set(["image/avif", "image/webp", "image/png", "image/jpeg", "image/gif"]).has(type)) throw new Error("unsupported avatar");
    const declaredLength = Number(response.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_AVATAR_BYTES) throw new Error("avatar too large");
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_AVATAR_BYTES) throw new Error("avatar too large");
    return new Response(body, { headers: {
      "Content-Type": type, "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff", Vary: "Cookie",
    } });
  } finally { clearTimeout(timeout); }
}

export async function avatarResponse(request, env, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to view this profile picture.");
    const requestedId = url.searchParams.get("userId") || current.id;
    if (!/^[A-Za-z0-9-]{1,64}$/.test(requestedId)) throw new AuthError(400, "Invalid account.");
    if (requestedId !== current.id && !isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
    const account = await accountForAvatar(env.PORTAL_DB, requestedId);
    if (!account) throw new AuthError(404, "Profile picture not found.");

    let config = null;
    let overseerrAvatar = null;
    try {
      config = configuredOverseerr(env);
      const overseerrUser = await findOverseerrUser(config, account, fetcher);
      overseerrAvatar = safeAvatarSource(overseerrUser?.avatar, config);
    } catch (error) {
      console.warn(JSON.stringify({ event: "overseerr_avatar_fallback", errorType: error instanceof Error ? error.name : typeof error }));
    }
    const source = overseerrAvatar || safeAvatarSource(account.plex_avatar_url, null);
    if (!source) throw new AuthError(404, "Profile picture not found.");
    if (source.origin === config?.root.origin) return await proxiedAvatar(source, config, fetcher);
    return new Response(null, { status: 302, headers: { Location: source.href, "Cache-Control": "private, no-store", Vary: "Cookie" } });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({ event: "portal_avatar_error", errorType: error instanceof Error ? error.name : typeof error }));
    return reply({ message: error instanceof AuthError ? error.message : "Profile picture is temporarily unavailable." },
      error instanceof AuthError ? error.status : 502);
  }
}

export { configuredOverseerr, findOverseerrUser };
