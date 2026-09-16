import { AuthError, isAdminEmail, reply, sessionUser } from "./auth.js";
import { paymentState } from "./billing.js";

function adminUser(row, now) {
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
    ...(row.plex_avatar_url ? { plexAvatarUrl: row.plex_avatar_url } : {}),
    subscription: row.tier_name ? {
      tier: row.tier_name,
      status: row.subscription_status,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
    } : null,
    billing: row.billing_period_id ? (() => {
      const amountDueMinor = Number(row.amount_due_minor);
      const confirmedMinor = Number(row.confirmed_minor || 0);
      const period = {
        status: "open",
        endsAt: Number(row.billing_ends_at),
        outstandingMinor: Math.max(0, amountDueMinor - confirmedMinor),
        confirmedMinor,
        pendingMinor: Number(row.pending_minor || 0),
      };
      return {
        status: paymentState(period, now),
        nextDueAt: period.endsAt,
        amountDueMinor,
        outstandingMinor: period.outstandingMinor,
        currency: row.billing_currency,
      };
    })() : null,
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
      p.username AS plex_username, p.avatar_url AS plex_avatar_url,
      s.access_status AS subscription_status, s.starts_at, s.ends_at,
      t.name AS tier_name,
      bp.id AS billing_period_id, bp.ends_at AS billing_ends_at,
      bp.amount_due_minor, bp.currency AS billing_currency,
      COALESCE(pt.confirmed_minor, 0) AS confirmed_minor,
      COALESCE(pt.pending_minor, 0) AS pending_minor
      FROM users u
      LEFT JOIN password_credentials c ON c.user_id = u.id
      LEFT JOIN plex_identities p ON p.user_id = u.id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      LEFT JOIN subscription_tiers t ON t.id = s.tier_id
      LEFT JOIN billing_periods bp ON bp.subscription_id = s.id AND bp.status = 'open'
        AND bp.starts_at = s.starts_at AND bp.ends_at = s.ends_at
      LEFT JOIN (
        SELECT billing_period_id,
          SUM(CASE WHEN status = 'confirmed' THEN amount_minor ELSE 0 END) AS confirmed_minor,
          SUM(CASE WHEN status = 'pending' THEN amount_minor ELSE 0 END) AS pending_minor
        FROM payments GROUP BY billing_period_id
      ) pt ON pt.billing_period_id = bp.id
      ORDER BY u.created_at DESC, u.email ASC`).all();
    const now = Date.now();
    const users = (result.results || []).map((row) => adminUser(row, now));
    return reply({
      users,
      summary: {
        total: users.length,
        enabled: users.filter((user) => user.accountStatus === "enabled").length,
        disabled: users.filter((user) => user.accountStatus === "disabled").length,
        subscribed: users.filter((user) => user.subscription).length,
        overdue: users.filter((user) => user.billing?.status === "overdue").length,
      },
    });
  } catch (error) {
    return reply({ message: error instanceof AuthError ? error.message : "Account services are temporarily unavailable. Please try again later." },
      error instanceof AuthError ? error.status : 503);
  }
}
