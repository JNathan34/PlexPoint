const REFERRAL_COOKIE_SECONDS = 30 * 24 * 60 * 60;

export function referralCookieName(request) {
  return new URL(request.url).protocol === "https:" ? "__Host-plexpoint_referral" : "plexpoint_local_referral";
}

export function referralCookie(request, code, seconds = REFERRAL_COOKIE_SECONDS) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${referralCookieName(request)}=${code}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure}`;
}

export function readReferralCode(request) {
  const prefix = `${referralCookieName(request)}=`;
  const values = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim())
    .filter((part) => part.startsWith(prefix));
  const code = values.length === 1 ? values[0].slice(prefix.length).toUpperCase() : "";
  return /^[A-Z0-9-]{6,32}$/.test(code) ? code : null;
}

export function memberReferralCode(displayName, userId) {
  const name = String(displayName || "MEMBER").normalize("NFKD").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12) || "MEMBER";
  const suffix = String(userId).replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(-6).padStart(6, "0");
  return `${name}-${suffix}`.slice(0, 32);
}

export async function newAccountReferralStatements(db, request, user, now) {
  const statements = [db.prepare(`INSERT OR IGNORE INTO referral_codes(user_id, code, created_at)
    VALUES (?, ?, ?)`).bind(user.id, memberReferralCode(user.displayName, user.id), now)];
  const code = readReferralCode(request);
  if (!code) return statements;
  const referrer = await db.prepare("SELECT user_id FROM referral_codes WHERE code = ?").bind(code).first();
  if (!referrer || referrer.user_id === user.id) return statements;
  statements.push(db.prepare(`INSERT OR IGNORE INTO referrals
    (id, referrer_user_id, referred_user_id, status, created_at, updated_at)
    VALUES (?, ?, ?, 'registered', ?, ?)`)
    .bind(crypto.randomUUID(), referrer.user_id, user.id, now, now));
  return statements;
}
