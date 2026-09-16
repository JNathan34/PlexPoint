import { AuthError, randomHex, digest, readBody, readToken, reply, rateLimit, publicUser, sessionStatements, sessionCookie, sessionUser, isAdminEmail, plexAvatarColumnAvailable } from "./auth.js";

const MAX_AGE = 600;
function stateName(request) {
  return new URL(request.url).protocol === "https:" ? "__Host-plexpoint_plex" : "plexpoint_local_plex";
}
function stateCookie(request, state, seconds = MAX_AGE) {
  return `${stateName(request)}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
function readState(request) {
  const prefix = `${stateName(request)}=`;
  const values = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(prefix));
  const value = values.length === 1 ? values[0].slice(prefix.length) : "";
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}
function expired() { return new AuthError(410, "This Plex sign-in has expired or was cancelled. Please start again."); }

async function plexRequest(fetcher, path, clientId, { method = "GET", token, body } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    // Fixed host, no redirects, and tokens only in headers; never accept URLs from a browser.
    const response = await fetcher(`https://plex.tv/api/v2/${path}`, {
      // Workers does not implement redirect:"error". Manual mode preserves the
      // no-redirect boundary and lets the status check below reject every 3xx.
      method, redirect: "manual", signal: controller.signal,
      headers: { Accept: "application/json", "X-Plex-Product": "PlexPoint", "X-Plex-Version": "1.0",
        "X-Plex-Client-Identifier": clientId, ...(token ? { "X-Plex-Token": token } : {}),
        ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      }, ...(body ? { body } : {}),
    });
    if (response.status === 404 || response.status === 410) throw expired();
    if (!response.ok) throw new AuthError(502, "Plex could not complete sign-in. Please try again shortly.");
    return await response.json();
  } catch (error) {
    if (error instanceof AuthError) throw error;
    // Keep enough signal for Workers logs without recording a PIN, token, or provider URL.
    console.error(JSON.stringify({ event: "plex_auth_upstream_error",
      errorType: error instanceof Error ? error.name : typeof error,
      causeCode: typeof error?.cause?.code === "string" ? error.cause.code : undefined }));
    throw new AuthError(502, "Plex is not responding. Please try again shortly.");
  } finally { clearTimeout(timeout); }
}

async function start(request, db, fetcher) {
  const now = Date.now();
  await rateLimit(db, request, "plex-start", null, now);
  const current = await sessionUser(db, request, now);
  const clientId = crypto.randomUUID();
  const pin = await plexRequest(fetcher, "pins", clientId, { method: "POST", body: "strong=true" });
  if (!Number.isSafeInteger(pin.id) || pin.id < 1 || typeof pin.code !== "string" || !/^[a-zA-Z0-9_-]{4,128}$/.test(pin.code)
    || !Number.isFinite(pin.expiresIn) || pin.expiresIn <= 0) {
    throw new AuthError(502, "Plex returned an invalid sign-in request. Please try again.");
  }
  const seconds = Math.max(1, Math.min(MAX_AGE, Math.floor(pin.expiresIn)));
  const expiresAt = now + seconds * 1000;
  const state = randomHex(32);
  const previous = readState(request);
  await db.batch([
    db.prepare("DELETE FROM plex_login_attempts WHERE expires_at <= ? OR state_hash = ?").bind(now, previous ? await digest(previous) : ""),
    db.prepare(`INSERT INTO plex_login_attempts(state_hash, pin_id, pin_code, client_id, user_id, session_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(await digest(state), pin.id, pin.code, clientId, current?.id || null,
      current ? await digest(readToken(request)) : null, expiresAt),
  ]);
  const forward = new URL("/account/?plex=return#account", request.url);
  const query = new URLSearchParams({ clientID: clientId, code: pin.code, "context[device][product]": "PlexPoint", forwardUrl: forward.href });
  return reply({ authorizationUrl: `https://app.plex.tv/auth#?${query}`, expiresAt }, 200,
    { "Set-Cookie": stateCookie(request, state, seconds) });
}

function profileIdentity(profile) {
  const id = String(profile.id ?? "");
  const username = typeof profile.username === "string" ? profile.username.trim() : "";
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (!/^[1-9][0-9]{0,19}$/.test(id) || !username || username.length > 100 || /[\x00-\x1f\x7f]/.test(username)) {
    throw new AuthError(502, "Plex did not return a valid account identity.");
  }
  let avatarUrl = "";
  if (typeof profile.thumb === "string" && profile.thumb.length <= 2048) {
    try {
      const candidate = new URL(profile.thumb);
      if (candidate.protocol === "https:" && !candidate.username && !candidate.password) avatarUrl = candidate.href;
    } catch {}
  }
  return { id, username, email, avatarUrl };
}

async function complete(request, db, fetcher) {
  const state = readState(request);
  if (!state) throw expired();
  const stateHash = await digest(state);
  const now = Date.now();
  const attempt = await db.prepare("SELECT * FROM plex_login_attempts WHERE state_hash = ? AND expires_at > ?").bind(stateHash, now).first();
  if (!attempt) throw expired();
  const current = await sessionUser(db, request, now);
  if (attempt.user_id ? (!current || current.id !== attempt.user_id || await digest(readToken(request)) !== attempt.session_hash) : Boolean(current)) {
    throw new AuthError(409, "Your portal session changed during Plex sign-in. Please start again.");
  }
  // Atomically bound the polling rate before making any upstream requests.
  const poll = await db.prepare("UPDATE plex_login_attempts SET last_poll_at = ? WHERE state_hash = ? AND last_poll_at <= ? RETURNING state_hash")
    .bind(now, stateHash, now - 2000).first();
  if (!poll) return reply({ pending: true }, 202, { "Retry-After": "2" });
  const pin = await plexRequest(fetcher, `pins/${attempt.pin_id}?code=${encodeURIComponent(attempt.pin_code)}`, attempt.client_id);
  if (pin.id !== attempt.pin_id || pin.code !== attempt.pin_code) throw new AuthError(502, "Plex returned a different sign-in request. Please start again.");
  if (!pin.authToken) return reply({ pending: true }, 202, { "Retry-After": "2" });
  if (typeof pin.authToken !== "string" || pin.authToken.length > 2048) throw new AuthError(502, "Plex returned an invalid authorization.");
  const profile = profileIdentity(await plexRequest(fetcher, "user", attempt.client_id, { token: pin.authToken }));
  // Always resolve by the Plex ID verified by Plex, never by a submitted ID or matching email.
  const linked = await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at, u.account_status
    FROM plex_identities p JOIN users u ON u.id = p.user_id WHERE p.plex_id = ?`).bind(profile.id).first();
  if (linked?.account_status === "disabled") throw new AuthError(403, "This portal account is disabled. Please contact support.");
  if (current && linked && current.id !== linked.id) throw new AuthError(409, "That Plex account is already connected to another portal account.");
  const existingIdentity = current ? await db.prepare("SELECT plex_id FROM plex_identities WHERE user_id = ?").bind(current.id).first() : null;
  if (existingIdentity && existingIdentity.plex_id !== profile.id) throw new AuthError(409, "Your portal account already has a different Plex account connected.");
  if (!current && !linked) {
    if (profile.email.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(profile.email)) {
      throw new AuthError(400, "Add an email address to your Plex account before signing in here.");
    }
    if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(profile.email).first()) {
      throw new AuthError(409, "A portal account already uses this email. Sign in with your portal password, then choose Connect Plex.");
    }
  }
  // A flow is single-use. Concurrent completions/cancellations cannot both create a session.
  const consumed = await db.prepare("DELETE FROM plex_login_attempts WHERE state_hash = ? AND expires_at > ? RETURNING state_hash")
    .bind(stateHash, Date.now()).first();
  if (!consumed) throw expired();
  const row = current || linked || { id: crypto.randomUUID(), email: profile.email, display_name: profile.username, created_at: now };
  const session = await sessionStatements(db, request, row.id, now);
  const avatarSupported = await plexAvatarColumnAvailable(db);
  const statements = [];
  if (!current && !linked) statements.push(db.prepare("INSERT INTO users(id, email, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.email, row.display_name, isAdminEmail(row.email) ? "admin" : "user", now, now));
  if (!linked) statements.push(avatarSupported
    ? db.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at, avatar_url) VALUES (?, ?, ?, ?, ?)")
      .bind(profile.id, row.id, profile.username, now, profile.avatarUrl || null)
    : db.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
      .bind(profile.id, row.id, profile.username, now));
  else statements.push(avatarSupported
    ? db.prepare("UPDATE plex_identities SET username = ?, avatar_url = ? WHERE plex_id = ?")
      .bind(profile.username, profile.avatarUrl || null, profile.id)
    : db.prepare("UPDATE plex_identities SET username = ? WHERE plex_id = ?")
      .bind(profile.username, profile.id));
  try { await db.batch([...statements, ...session.statements]); }
  catch { throw new AuthError(409, "The account could not be connected. Please start sign-in again or contact support."); }
  const response = reply({ user: publicUser({ ...row, plex_username: profile.username, plex_avatar_url: profile.avatarUrl }) }, 200,
    { "Set-Cookie": sessionCookie(request, session.token) });
  response.headers.append("Set-Cookie", stateCookie(request, "", 0));
  return response;
}

export async function plexAuthResponse(request, env, action, fetcher = fetch) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new AuthError(400, "Account access requires HTTPS.");
    if (!["start", "complete", "cancel"].includes(action)) throw new AuthError(404, "Not found.");
    if (request.method !== "POST") return reply({ message: "Method not allowed." }, 405, { Allow: "POST" });
    await readBody(request);
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    if (action === "start") return await start(request, env.PORTAL_DB, fetcher);
    if (action === "complete") return await complete(request, env.PORTAL_DB, fetcher);
    const state = readState(request);
    if (state) await env.PORTAL_DB.prepare("DELETE FROM plex_login_attempts WHERE state_hash = ?").bind(await digest(state)).run();
    return reply({ cancelled: true }, 200, { "Set-Cookie": stateCookie(request, "", 0) });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Plex sign-in is temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503, error.status === 429 ? { "Retry-After": "900" } : {});
  }
}
