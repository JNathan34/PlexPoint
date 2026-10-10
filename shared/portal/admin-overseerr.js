import { AuthError, isAdminEmail, managerCorsHeaders, plexAvatarColumnAvailable, readBody, reply, sessionUser } from "./auth.js";
import { configuredOverseerr, overseerrJson } from "./overseerr.js";

const PAGE_SIZE = 100;
const MAX_PAGES = 20;
const emailPattern = /^[^\s@\x00-\x1f\x7f]+@[^\s@\x00-\x1f\x7f]+\.[^\s@\x00-\x1f\x7f]+$/;

function text(value, maximum = 254) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function importableUser(value) {
  const overseerrId = Number(value?.id);
  const plexId = text(value?.plexId, 120);
  const email = text(value?.email).toLowerCase();
  const username = text(value?.plexUsername || value?.username || value?.displayName, 100);
  const displayName = text(value?.displayName || username || email.split("@")[0], 100);
  const avatarUrl = text(value?.avatar || value?.avatarUrl || value?.plexAvatar, 2048);
  return Number.isInteger(overseerrId) && overseerrId > 0 && plexId && emailPattern.test(email) && username && displayName
    ? { overseerrId, plexId, email, username, displayName, avatarUrl: /^https:\/\//i.test(avatarUrl) ? avatarUrl : "" }
    : null;
}

async function allOverseerrUsers(config, fetcher) {
  const entries = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const skip = page * PAGE_SIZE;
    const payload = await overseerrJson(config, "user", { take: PAGE_SIZE, skip, sort: "created" }, fetcher);
    const results = Array.isArray(payload.results) ? payload.results : [];
    entries.push(...results);
    const total = Number(payload?.pageInfo?.results);
    if (results.length < PAGE_SIZE || (Number.isSafeInteger(total) && skip + results.length >= total)) break;
  }
  return entries;
}

async function knownUsers(db, entries) {
  if (!entries.length) return new Map();
  const plexIds = entries.map((entry) => entry.plexId);
  const marks = plexIds.map(() => "?").join(",");
  const result = await db.prepare(`SELECT p.plex_id, u.email FROM plex_identities p JOIN users u ON u.id = p.user_id WHERE p.plex_id IN (${marks})`)
    .bind(...plexIds).all();
  return new Map((result.results || []).map((row) => [String(row.plex_id), { state: "imported", email: row.email }]));
}

async function importList(request, env, fetcher) {
  if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
  const current = await sessionUser(env.PORTAL_DB, request);
  if (!current) throw new AuthError(401, "Please sign in to continue.");
  if (!isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");
  const config = configuredOverseerr(env);
  const users = [...new Map((await allOverseerrUsers(config, fetcher)).map(importableUser).filter(Boolean).map((entry) => [entry.plexId, entry])).values()];
  const known = await knownUsers(env.PORTAL_DB, users);
  return { current, users: users.map((entry) => ({ ...entry, status: known.get(entry.plexId)?.state || "available" })) };
}

export async function adminOverseerrUsersResponse(request, env, fetcher = fetch) {
  const cors = managerCorsHeaders(request);
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new AuthError(400, "Account access requires HTTPS.");
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method === "GET") {
      const data = await importList(request, env, fetcher);
      return reply({ users: data.users }, 200, cors);
    }
    if (request.method !== "POST") return reply({ message: "Method not allowed." }, 405, { Allow: "GET, POST", ...cors });
    const body = await readBody(request, { allowManagerOrigin: true });
    if (body.action !== "import_users" || !Array.isArray(body.userIds) || body.userIds.length < 1 || body.userIds.length > 100
      || body.userIds.some((id) => !Number.isInteger(id) || id < 1)) throw new AuthError(400, "Choose at least one valid Overseerr user.");
    const { current, users } = await importList(request, env, fetcher);
    const wanted = new Set(body.userIds);
    const selected = users.filter((entry) => wanted.has(entry.overseerrId));
    if (!selected.length) throw new AuthError(400, "Those users are no longer available to import.");
    const avatarSupported = await plexAvatarColumnAvailable(env.PORTAL_DB);
    const now = Date.now();
    const imported = [];
    const skipped = [];
    for (const entry of selected) {
      if (entry.status === "imported") { skipped.push({ overseerrId: entry.overseerrId, reason: "Already imported" }); continue; }
      const emailOwner = await env.PORTAL_DB.prepare("SELECT id FROM users WHERE email = ?").bind(entry.email).first();
      if (emailOwner) { skipped.push({ overseerrId: entry.overseerrId, reason: "Email already belongs to a portal account" }); continue; }
      const id = crypto.randomUUID();
      const statements = [
        env.PORTAL_DB.prepare("INSERT INTO users(id, email, display_name, role, account_status, created_at, updated_at) VALUES (?, ?, ?, 'user', 'enabled', ?, ?)")
          .bind(id, entry.email, entry.displayName, now, now),
        avatarSupported
          ? env.PORTAL_DB.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at, avatar_url) VALUES (?, ?, ?, ?, ?)")
            .bind(entry.plexId, id, entry.username, now, entry.avatarUrl || null)
          : env.PORTAL_DB.prepare("INSERT INTO plex_identities(plex_id, user_id, username, linked_at) VALUES (?, ?, ?, ?)")
            .bind(entry.plexId, id, entry.username, now),
        env.PORTAL_DB.prepare("INSERT INTO audit_events(id, actor_id, subject_user_id, action, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(crypto.randomUUID(), current.id, id, "admin.overseerr_user_imported", JSON.stringify({ overseerrId: entry.overseerrId, plexId: entry.plexId }), now),
      ];
      try { await env.PORTAL_DB.batch(statements); imported.push({ overseerrId: entry.overseerrId, id, displayName: entry.displayName }); }
      catch { skipped.push({ overseerrId: entry.overseerrId, reason: "Could not import this user" }); }
    }
    return reply({ imported, skipped }, 200, cors);
  } catch (error) {
    if (!(error instanceof AuthError)) console.error(JSON.stringify({ event: "admin_overseerr_import_error", errorType: error?.name || "UnknownError" }));
    return reply({ message: error instanceof AuthError ? error.message : "Overseerr users are temporarily unavailable. Please try again later." }, error instanceof AuthError ? error.status : 503, cors);
  }
}
