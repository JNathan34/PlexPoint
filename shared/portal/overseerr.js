import { AuthError, isAdminEmail, plexAvatarColumnAvailable, readBody, reply, sessionUser } from "./auth.js";

const DEFAULT_OVERSEERR_URL = "https://request.plexpoint.uk";
const MAX_JSON_BYTES = 1_000_000;
const MAX_AVATAR_BYTES = 2_000_000;
const USER_PAGE_SIZE = 100;
const MAX_USER_PAGES = 20;

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

async function overseerrMutation(config, path, body, fetcher) {
  const url = new URL(path.replace(/^\/+/, ""), config.apiBase);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": config.apiKey,
      },
      body: JSON.stringify(body),
      redirect: "manual",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("upstream status");
    const declaredLength = Number(response.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_JSON_BYTES) throw new Error("upstream response too large");
    const text = await response.text();
    if (text.length > MAX_JSON_BYTES) throw new Error("upstream response too large");
    if (!text.trim()) return null;
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("upstream response");
    return data;
  } finally { clearTimeout(timeout); }
}

const normalized = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

async function findOverseerrUser(config, account, fetcher) {
  const plexId = String(account.plex_id ?? account.plexId ?? "").trim();
  const email = normalized(account.email);
  const plexUsername = normalized(account.plex_username || account.plexUsername);
  let emailMatch = null;
  let usernameMatch = null;

  const inspectUsers = (users) => {
    const plexMatch = users.find((candidate) => plexId && String(candidate?.plexId ?? "").trim() === plexId);
    emailMatch ||= users.find((candidate) => email && normalized(candidate?.email) === email) || null;
    usernameMatch ||= users.find((candidate) => plexUsername
      && normalized(candidate?.plexUsername) === plexUsername) || null;
    // Older Overseerr/Zima builds omit plexId even for API-key admins. An
    // exact match on both remaining account signals is safe to use
    // without falling back to a full paginated scan.
    const legacyMatch = users.find((candidate) => candidate?.plexId == null
      && email && normalized(candidate?.email) === email
      && plexUsername && normalized(candidate?.plexUsername) === plexUsername);
    return plexMatch || legacyMatch;
  };

  // Overseerr/Seerr supports `q` across email and Plex username. In normal use
  // this resolves one account in a single request instead of downloading every
  // user page, which keeps admin grants well inside the browser timeout.
  for (const query of [...new Set([email, plexUsername].filter(Boolean))]) {
    const payload = await overseerrJson(config, "user",
      { take: 20, skip: 0, sort: "created", q: query }, fetcher);
    const users = Array.isArray(payload.results) ? payload.results : [];
    const plexMatch = inspectUsers(users);
    if (plexMatch) return plexMatch;
  }

  if (!plexId) return emailMatch || usernameMatch;

  for (let page = 0; page < MAX_USER_PAGES; page++) {
    const skip = page * USER_PAGE_SIZE;
    const payload = await overseerrJson(config, "user",
      { take: USER_PAGE_SIZE, skip, sort: "created" }, fetcher);
    const users = Array.isArray(payload.results) ? payload.results : [];
    const plexMatch = inspectUsers(users);
    if (plexMatch) return plexMatch;

    const resultCount = Number(payload?.pageInfo?.results);
    if (users.length < USER_PAGE_SIZE
      || (Number.isSafeInteger(resultCount) && skip + users.length >= resultCount)) break;
  }
  return emailMatch || usernameMatch;
}

function quotaLimit(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function nullableText(value, limit = 200) {
  const text = safeText(value, "", limit);
  return text || null;
}

function quotaPeriod(value) {
  return value === "days" || value === "calendarMonth" ? value : null;
}

function settingsPayload(settings, user, overrides = {}) {
  return {
    username: nullableText(settings?.username ?? user?.username ?? user?.plexUsername),
    email: safeText(settings?.email ?? user?.email, ""),
    discordId: nullableText(settings?.discordId),
    locale: nullableText(settings?.locale),
    discoverRegion: nullableText(settings?.discoverRegion),
    streamingRegion: nullableText(settings?.streamingRegion),
    // Overseerr used `region`; Zima/Seerr split it into discovery and
    // streaming regions. Supplying both preserves either server variant.
    region: nullableText(settings?.region ?? settings?.discoverRegion),
    originalLanguage: nullableText(settings?.originalLanguage),
    movieQuotaLimit: quotaLimit(settings?.movieQuotaLimit),
    movieQuotaDays: quotaLimit(settings?.movieQuotaDays),
    movieQuotaPeriod: quotaPeriod(settings?.movieQuotaPeriod),
    movieQuotaBonus: quotaLimit(settings?.movieQuotaBonus),
    tvQuotaLimit: quotaLimit(settings?.tvQuotaLimit),
    tvQuotaDays: quotaLimit(settings?.tvQuotaDays),
    tvQuotaPeriod: quotaPeriod(settings?.tvQuotaPeriod),
    tvQuotaBonus: quotaLimit(settings?.tvQuotaBonus),
    watchlistSyncMovies: settings?.watchlistSyncMovies ?? null,
    watchlistSyncTv: settings?.watchlistSyncTv ?? null,
    ...overrides,
  };
}

function quotaBonus(settings, quota, type) {
  const value = quotaLimit(settings?.[`${type}QuotaBonus`])
    ?? quotaLimit(quota?.[type === "movie" ? "movie" : "tv"]?.bonus)
    ?? 0;
  if (value > 10000) throw new Error("request service returned an invalid bonus allowance");
  return value;
}

function supportsQuotaBonus(settings, quota) {
  return Object.hasOwn(settings || {}, "movieQuotaBonus")
    || Object.hasOwn(settings || {}, "tvQuotaBonus")
    || Object.hasOwn(quota?.movie || {}, "bonus")
    || Object.hasOwn(quota?.tv || {}, "bonus");
}

function requestedQuotaLimit(quota, type, amount) {
  const current = quotaLimit(quota?.[type]?.limit);
  if (current === null) throw new Error("request service returned an invalid quota");
  if (current === 0) throw new Error(`${type} requests are already unlimited`);
  const next = current + amount;
  if (!Number.isSafeInteger(next) || next > 10000) throw new Error("request limit adjustment too large");
  return next;
}

export async function applyOverseerrRequestCredits(config, user, { movies = 0, seasons = 0 } = {}, fetcher = fetch) {
  const userId = Number(user?.id);
  if (!Number.isInteger(userId) || userId < 1) throw new Error("request service user not found");
  if (!Number.isSafeInteger(movies) || movies < 0 || !Number.isSafeInteger(seasons) || seasons < 0
    || movies + seasons < 1 || movies + seasons > 100) {
    throw new Error("invalid request limit adjustment");
  }
  const [settings, currentQuota] = await Promise.all([
    overseerrJson(config, `user/${userId}/settings/main`, {}, fetcher),
    overseerrJson(config, `user/${userId}/quota`, {}, fetcher),
  ]);

  // Zima/Seerr exposes explicit bonus allowances for one-off credits. They
  // increase what the member can request this month without permanently
  // changing their normal plan quota.
  if (supportsQuotaBonus(settings, currentQuota)) {
    const currentMovieBonus = quotaBonus(settings, currentQuota, "movie");
    const currentTvBonus = quotaBonus(settings, currentQuota, "tv");
    const nextMovieBonus = currentMovieBonus + movies;
    const nextTvBonus = currentTvBonus + seasons;
    if (nextMovieBonus > 10000 || nextTvBonus > 10000) {
      throw new Error("request bonus adjustment too large");
    }
    await overseerrMutation(config, `user/${userId}/settings/main`, settingsPayload(settings, user, {
      movieQuotaBonus: nextMovieBonus,
      tvQuotaBonus: nextTvBonus,
    }), fetcher);

    const savedQuota = await overseerrJson(config, `user/${userId}/quota`, {}, fetcher);
    if ((movies && quotaLimit(savedQuota?.movie?.bonus) !== nextMovieBonus)
      || (seasons && quotaLimit(savedQuota?.tv?.bonus) !== nextTvBonus)) {
      throw new Error("request service did not save the bonus allowance");
    }
    return {
      mode: "monthly_bonus",
      movieValue: nextMovieBonus,
      tvValue: nextTvBonus,
    };
  }

  // Compatibility fallback for older Overseerr builds without bonus quotas.
  const nextMovieLimit = movies
    ? requestedQuotaLimit(currentQuota, "movie", movies) : quotaLimit(settings.movieQuotaLimit);
  const nextTvLimit = seasons
    ? requestedQuotaLimit(currentQuota, "tv", seasons) : quotaLimit(settings.tvQuotaLimit);
  await overseerrMutation(config, `user/${userId}/settings/main`, settingsPayload(settings, user, {
    movieQuotaLimit: nextMovieLimit,
    tvQuotaLimit: nextTvLimit,
  }), fetcher);

  const savedQuota = await overseerrJson(config, `user/${userId}/quota`, {}, fetcher);
  if ((movies && quotaLimit(savedQuota?.movie?.limit) !== nextMovieLimit)
    || (seasons && quotaLimit(savedQuota?.tv?.limit) !== nextTvLimit)) {
    throw new Error("request service did not save the quota adjustment");
  }
  return { mode: "quota_limit", movieValue: nextMovieLimit, tvValue: nextTvLimit };
}

function adminGrantAmount(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 100 ? value : null;
}

export async function adminRequestCreditsResponse(request, env, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "POST") return reply({ message: "Method not allowed." }, 405, { Allow: "POST" });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to continue.");
    if (!isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
    const body = await readBody(request);
    const userId = typeof body.userId === "string" && body.userId.length <= 128
      && !/[\x00-\x1f\x7f]/.test(body.userId) ? body.userId : "";
    const movies = adminGrantAmount(body.movies);
    const seasons = adminGrantAmount(body.seasons);
    if (!userId) throw new AuthError(400, "Select a valid member.");
    if (movies === null || seasons === null || movies + seasons < 1 || movies + seasons > 100) {
      throw new AuthError(400, "Add between 1 and 100 movie or season requests.");
    }
    const account = await env.PORTAL_DB.prepare(`SELECT
      u.id, u.email, p.plex_id, p.username AS plex_username
      FROM users u LEFT JOIN plex_identities p ON p.user_id = u.id
      WHERE u.id = ?`).bind(userId).first();
    if (!account) throw new AuthError(404, "That user account could not be found.");
    const config = configuredOverseerr(env);
    const overseerrUser = await findOverseerrUser(config, account, fetcher);
    if (!overseerrUser || !Number.isInteger(Number(overseerrUser.id))) {
      throw new AuthError(409, "No matching request-service account was found. Ask the member to sign in there once, then retry.");
    }
    const limits = await applyOverseerrRequestCredits(config, overseerrUser, { movies, seasons }, fetcher);
    try {
      await env.PORTAL_DB.prepare(`INSERT INTO audit_events
        (id, actor_id, subject_user_id, action, details_json, created_at)
        VALUES (?, ?, ?, 'admin.requests_granted', ?, ?)`).bind(
        crypto.randomUUID(), current.id, account.id,
        JSON.stringify({ movies, seasons, verifiedMode: limits.mode,
          verifiedMovies: limits.movieValue, verifiedSeasons: limits.tvValue }), Date.now(),
      ).run();
    } catch (error) {
      // The verified external update has already completed. Do not invite a
      // retry that would grant the allowance twice merely because audit storage failed.
      console.error(JSON.stringify({ event: "admin_request_credit_audit_failed", errorType: error instanceof Error ? error.name : typeof error }));
    }
    return reply({
      granted: { movies, seasons },
      verified: { mode: limits.mode, movies: limits.movieValue, seasons: limits.tvValue },
    });
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({
      event: "admin_request_credit_error",
      errorType: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error",
    }));
    return reply({ message: error instanceof AuthError ? error.message : "Request credits could not be added. Please try again later." },
      error instanceof AuthError ? error.status : 502);
  }
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
    const payload = await overseerrJson(config, `user/${Number(overseerrUser.id)}/requests`, { take: 4, skip: 0 }, fetcher);
    const recent = Array.isArray(payload.results) ? payload.results.slice(0, 4) : [];
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
  return db.prepare(`SELECT u.id, u.email, p.plex_id, p.username AS plex_username, ${avatarSelect}
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
