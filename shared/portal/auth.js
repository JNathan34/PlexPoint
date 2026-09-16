const SESSION_SECONDS = 7 * 24 * 60 * 60;
// Workers Web Crypto supports a maximum of 100,000 PBKDF2 iterations.
const ITERATIONS = 100000;
const WINDOW_MS = 15 * 60 * 1000;
const ADMIN_EMAIL = "jacobnathan1718@gmail.com";
const encoder = new TextEncoder();
const hex = (bytes) => Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
const randomHex = (length) => hex(crypto.getRandomValues(new Uint8Array(length)));
const digest = async (value) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

class AuthError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function cookieName(request) {
  return new URL(request.url).protocol === "https:" ? "__Host-plexpoint_session" : "plexpoint_local_session";
}

function sessionCookie(request, token, seconds = SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure}`;
}

function readToken(request) {
  const prefix = `${cookieName(request)}=`;
  const matches = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(prefix));
  const token = matches.length === 1 ? matches[0].slice(prefix.length) : "";
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function reply(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Vary": "Cookie", ...headers,
  } });
}

async function readBody(request) {
  const url = new URL(request.url);
  if (request.headers.get("Origin") !== url.origin || request.headers.get("X-PlexPoint-Request") !== "1"
    || request.headers.get("Sec-Fetch-Site") === "cross-site") {
    throw new AuthError(403, "Please submit this form from My PlexPoint.");
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AuthError(415, "Please send a JSON request.");
  }
  if (Number(request.headers.get("Content-Length")) > 4096) throw new AuthError(413, "The request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError(400, "Please complete the form.");
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new AuthError(413, "The request is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new AuthError(400, "Please complete the form with valid values."); }
}

function credentials(body, registering) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = body.password;
  if (email.length > 254 || !/^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/.test(email)) {
    throw new AuthError(400, "Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < (registering ? 15 : 1) || password.length > 128) {
    throw new AuthError(400, registering ? "Use a password between 15 and 128 characters." : "Enter your email and password.");
  }
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (registering && (!displayName || displayName.length > 100 || /[\x00-\x1f\x7f]/.test(displayName))) {
    throw new AuthError(400, "Enter a display name between 1 and 100 characters.");
  }
  return { email, password, displayName };
}

async function passwordHash(password, salt, iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBytes = Uint8Array.from(salt.match(/../g), (pair) => parseInt(pair, 16));
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256));
}

function equalHash(left, right) {
  let difference = left.length ^ right.length;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ (right.charCodeAt(i) || 0);
  return difference === 0;
}

async function rateLimit(db, request, action, email, now) {
  // Cloudflare supplies this header. Local requests share a development bucket.
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const buckets = [[`${action}:ip:${ip}`, action === "register" ? 10 : 30]];
  if (email !== null) buckets.push([`${action}:email:${email}`, 10]);
  const keys = await Promise.all(buckets.map(async ([key, limit]) => [await digest(key), limit]));
  const results = await db.batch(keys.map(([key]) => db.prepare(`
    INSERT INTO auth_rate_limits(key_hash, attempts, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key_hash) DO UPDATE SET
      attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END,
      expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END
    RETURNING attempts`).bind(key, now + WINDOW_MS, now, now)));
  if (results.some((result, index) => result.results[0].attempts > keys[index][1])) {
    throw new AuthError(429, "Too many attempts. Please try again in 15 minutes.");
  }
}

function isAdminEmail(value) {
  return typeof value === "string" && value.trim().toLowerCase() === ADMIN_EMAIL;
}

function publicUser(row) {
  return { id: row.id, email: row.email, displayName: row.display_name, createdAt: row.created_at,
    ...(isAdminEmail(row.email) ? { isAdmin: true } : {}),
    ...(row.plex_username ? { plex: {
      username: row.plex_username,
      ...(row.plex_avatar_url ? { avatarUrl: row.plex_avatar_url } : {}),
    } } : {}),
  };
}

async function sessionStatements(db, request, userId, now) {
  const token = randomHex(32);
  const statements = [db.prepare("INSERT INTO auth_sessions(token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await digest(token), userId, now, now + SESSION_SECONDS * 1000)];
  const previous = readToken(request);
  if (previous) statements.push(db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await digest(previous)));
  statements.push(db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").bind(now));
  statements.push(db.prepare("DELETE FROM auth_rate_limits WHERE expires_at <= ?").bind(now));
  return { token, statements };
}

async function register(db, request, body, now) {
  const { email, password, displayName } = credentials(body, true);
  await rateLimit(db, request, "register", email, now);
  const salt = randomHex(16);
  const hash = await passwordHash(password, salt);
  const unavailable = () => new AuthError(400, "Unable to create this account. Try signing in, or contact support.");
  if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first()) throw unavailable();
  const id = crypto.randomUUID();
  const session = await sessionStatements(db, request, id, now);
  try {
    await db.batch([
      db.prepare("INSERT INTO users(id, email, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, email, displayName, isAdminEmail(email) ? "admin" : "user", now, now),
      db.prepare("INSERT INTO password_credentials(user_id, salt, password_hash, iterations, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, salt, hash, ITERATIONS, now),
      ...session.statements,
    ]);
  } catch (error) {
    // A simultaneous registration can win the unique email constraint.
    if (await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first()) throw unavailable();
    throw error;
  }
  return reply({ user: publicUser({ id, email, display_name: displayName, created_at: now }) }, 201,
    { "Set-Cookie": sessionCookie(request, session.token) });
}

async function login(db, request, body, now) {
  const { email, password } = credentials(body, false);
  await rateLimit(db, request, "login", email, now);
  const row = await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at, u.account_status,
    c.salt, c.password_hash, c.iterations, p.username AS plex_username, p.avatar_url AS plex_avatar_url FROM users u
    LEFT JOIN password_credentials c ON c.user_id = u.id
    LEFT JOIN plex_identities p ON p.user_id = u.id WHERE u.email = ?`).bind(email).first();
  // Unknown accounts perform the same password derivation as existing accounts.
  const hash = await passwordHash(password, row?.salt || "00".repeat(16), row?.iterations || ITERATIONS);
  if (!equalHash(hash, row?.password_hash || "00".repeat(32)) || row?.account_status !== "enabled") {
    throw new AuthError(401, "Email or password is incorrect.");
  }
  const session = await sessionStatements(db, request, row.id, now);
  await db.batch(session.statements);
  return reply({ user: publicUser(row) }, 200, { "Set-Cookie": sessionCookie(request, session.token) });
}

async function sessionUser(db, request, now = Date.now()) {
  const token = readToken(request);
  return token ? await db.prepare(`SELECT u.id, u.email, u.display_name, u.created_at,
    p.plex_id, p.username AS plex_username, p.avatar_url AS plex_avatar_url, l.tautulli_user_id
    FROM auth_sessions s JOIN users u ON u.id = s.user_id
    LEFT JOIN plex_identities p ON p.user_id = u.id
    LEFT JOIN plex_account_links l ON l.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.account_status = 'enabled'`)
    .bind(await digest(token), now).first() : null;
}

async function currentSession(db, request, now) {
  const row = await sessionUser(db, request, now);
  return reply({ user: row ? publicUser(row) : null }, 200,
    !row && readToken(request) ? { "Set-Cookie": sessionCookie(request, "", 0) } : {});
}

export { ADMIN_EMAIL, AuthError, randomHex, digest, readBody, readToken, reply, rateLimit, publicUser, sessionStatements, sessionCookie, sessionUser, isAdminEmail };

export async function authResponse(request, env, action) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (!["register", "login", "session", "logout"].includes(action)) throw new AuthError(404, "Not found.");
    const method = action === "session" ? "GET" : "POST";
    if (request.method !== method) return reply({ message: "Method not allowed." }, 405, { Allow: method });
    const body = method === "POST" ? await readBody(request) : null;
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const db = env.PORTAL_DB;
    const now = Date.now();
    if (action === "register") return await register(db, request, body, now);
    if (action === "login") return await login(db, request, body, now);
    if (action === "session") return await currentSession(db, request, now);
    const token = readToken(request);
    if (token) await db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(await digest(token)).run();
    return reply({ user: null }, 200, { "Set-Cookie": sessionCookie(request, "", 0) });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Account services are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503, error.status === 429 ? { "Retry-After": "900" } : {});
  }
}
