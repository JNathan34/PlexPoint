import { AuthError, isAdminEmail, reply, sessionUser } from "./auth.js";

function adminUser(row) {
  const signInMethods = [];
  if (row.has_password) signInMethods.push("Email");
  if (row.plex_username) signInMethods.push("Plex");
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    isAdmin: isAdminEmail(row.email),
    accountStatus: row.account_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signInMethods,
    ...(row.plex_username ? { plexUsername: row.plex_username } : {}),
    subscription: row.tier_name ? {
      tier: row.tier_name,
      status: row.subscription_status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
    } : null,
  };
}

export async function adminUsersResponse(request, env) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new AuthError(400, "Account access requires HTTPS.");
    }
    if (request.method !== "GET") return reply({ message: "Method not allowed." }, 405, { Allow: "GET" });
    if (!env.PORTAL_DB) throw new AuthError(503, "Account services are not configured yet. Please try again later.");
    const current = await sessionUser(env.PORTAL_DB, request);
    if (!current) throw new AuthError(401, "Please sign in to continue.");
    if (!isAdminEmail(current.email)) throw new AuthError(403, "Administrator access is required.");

    const result = await env.PORTAL_DB.prepare(`SELECT
      u.id, u.email, u.display_name, u.account_status, u.created_at, u.updated_at,
      CASE WHEN c.user_id IS NULL THEN 0 ELSE 1 END AS has_password,
      p.username AS plex_username,
      s.access_status AS subscription_status, s.starts_at, s.ends_at,
      t.name AS tier_name
      FROM users u
      LEFT JOIN password_credentials c ON c.user_id = u.id
      LEFT JOIN plex_identities p ON p.user_id = u.id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      LEFT JOIN subscription_tiers t ON t.id = s.tier_id
      ORDER BY u.created_at DESC, u.email ASC`).all();
    const users = (result.results || []).map(adminUser);
    return reply({
      users,
      summary: {
        total: users.length,
        enabled: users.filter((user) => user.accountStatus === "enabled").length,
        disabled: users.filter((user) => user.accountStatus === "disabled").length,
        subscribed: users.filter((user) => user.subscription).length,
      },
    });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Account services are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503);
  }
}
