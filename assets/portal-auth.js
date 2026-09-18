const byId = (id) => document.getElementById(id);
const profileAvatar = byId("profile-avatar");
const fallbackAvatar = "/plexpoint-logo.png";
const status = byId("auth-status");
let user = null;
let busy = false;
let available = false;
let plexPending = false;
let adminBusy = false;
let requestsBusy = false;
let billingBusy = false;
let adminBillingBusy = false;
let adminBillingData = null;
const returnUrl = new URL(location.href);
let plexReturning = returnUrl.searchParams.get("plex") === "return";
if (plexReturning) {
  returnUrl.searchParams.delete("plex");
  returnUrl.hash = "account";
  history.replaceState(null, "", returnUrl);
}

function message(text, error = false, focus = false) {
  status.textContent = text;
  status.dataset.error = String(error);
  if (focus) status.focus();
}

function controls() {
  byId("auth-logout").disabled = busy || plexPending;
  for (const id of ["auth-retry", "plex-check", "plex-cancel"]) byId(id).disabled = busy;
  byId("plex-sign-in").disabled = busy || !available || plexPending;
  byId("admin-retry").disabled = adminBusy;
  byId("requests-retry").disabled = requestsBusy;
  byId("billing-retry").disabled = billingBusy;
  for (const formId of ["admin-plan-form", "admin-payment-form"]) {
    const editorForm = byId(formId);
    for (const control of editorForm.elements) control.disabled = adminBillingBusy;
    editorForm.setAttribute("aria-busy", String(adminBillingBusy));
  }
  byId("admin-payment-save").disabled = adminBillingBusy || !adminBillingData?.billing?.subscription;
  for (const button of byId("admin-users").querySelectorAll("button")) button.disabled = adminBillingBusy;
  for (const button of byId("admin-billing-payments").querySelectorAll("button")) button.disabled = adminBillingBusy;
  byId("plex-pending").hidden = !plexPending;
}

const tierIconPaths = {
  none: ["m12 3 9 6-9 12L3 9l9-6Z", "M3 9h18M8 9l4 12 4-12"],
  bronze: ["M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z", "M8.5 10.5 12 8l3.5 2.5L14 15h-4l-1.5-4.5Z"],
  silver: ["M8 3h8l-1 6h-6L8 3Z", "M12 9a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z", "m9.5 15 1.6 1.6 3.4-3.4"],
  gold: ["M3 7l4 5 5-8 5 8 4-5-2 12H5L3 7Z", "M6 16h12"],
  diamond: ["m4 8 4-4h8l4 4-8 12L4 8Z", "m4 8 8 3 8-3M8 4l4 7 4-7"],
  ruby: ["m12 3 7 5-2 10-5 3-5-3L5 8l7-5Z", "m5 8 7 3 7-3M8 5l4 6 4-6M7 18l5-7 5 7"],
  platinum: ["m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"],
};

function tierKey(value) {
  const normalized = String(value || "").toLowerCase();
  return Object.keys(tierIconPaths).find((key) => key !== "none" && normalized.includes(key)) || "none";
}

function tierSvg(value) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, attribute] of Object.entries({
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.6",
    "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true",
  })) svg.setAttribute(key, attribute);
  for (const d of tierIconPaths[tierKey(value)]) {
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

function tierBadge(value, extraClass = "") {
  const badge = document.createElement("span");
  badge.className = `pp-tier-icon${extraClass ? ` ${extraClass}` : ""}`;
  badge.dataset.tier = tierKey(value);
  badge.setAttribute("aria-hidden", "true");
  badge.append(tierSvg(value));
  return badge;
}

function setTierBadge(id, value) {
  const badge = byId(id);
  badge.dataset.tier = tierKey(value);
  badge.replaceChildren(tierSvg(value));
}

function safeAvatarUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const url = new URL(value, location.origin);
    return (url.origin === location.origin || url.protocol === "https:") && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function configureAvatar(image, value, name, holder) {
  const avatarUrl = safeAvatarUrl(value);
  const useFallback = () => {
    holder.classList.remove("has-plex-avatar");
    image.onerror = null;
    image.src = fallbackAvatar;
    image.alt = "";
  };
  if (!avatarUrl) {
    useFallback();
    return;
  }
  holder.classList.add("has-plex-avatar");
  image.referrerPolicy = "no-referrer";
  image.alt = `${name || "Member"}’s Plex profile picture`;
  image.onerror = useFallback;
  image.src = avatarUrl;
}

function renderUser(next) {
  user = next;
  byId("auth-guest").hidden = Boolean(user);
  byId("auth-user").hidden = !user;
  byId("requests-panel").hidden = !user;
  byId("billing-panel").hidden = !user;
  byId("admin-panel").hidden = !user?.isAdmin;
  if (user) {
    byId("auth-user-name").textContent = user.displayName;
    byId("auth-user-email").textContent = user.email;
    configureAvatar(profileAvatar, user.avatarUrl || user.plex?.avatarUrl, user.displayName, profileAvatar.parentElement);
    for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, null);
    byId("profile-plan").textContent = "Loading membership…";
    byId("profile-plan-note").textContent = "Checking your plan and payment details";
    byId("profile-renewal").textContent = "—";
    byId("profile-last-payment").textContent = "—";
    byId("profile-payment-state").textContent = "Checking";
    byId("profile-payment-state").dataset.status = "none";
  } else {
    configureAvatar(profileAvatar, "", "", profileAvatar.parentElement);
    for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, null);
    for (const id of ["auth-user-name", "auth-user-email"]) byId(id).textContent = "";
    byId("admin-users").replaceChildren();
    byId("admin-table-wrap").hidden = true;
    byId("admin-status").textContent = "";
    byId("admin-billing-editor").hidden = true;
    byId("admin-billing-content").hidden = true;
    byId("admin-billing-status").textContent = "";
    adminBillingData = null;
    byId("recent-requests").replaceChildren();
    byId("recent-requests").hidden = true;
    byId("requests-status").textContent = "";
    byId("overview-watch-time").textContent = "Sign in to view";
    byId("overview-watch-time-note").textContent = "Your Plex watch time from the last 7 days.";
    byId("billing-results").hidden = true;
    byId("billing-status").textContent = "";
    byId("billing-payments").replaceChildren();
    byId("overview-plan").textContent = "Sign in to view";
    byId("overview-plan-note").textContent = "Your current plan and access status appear here.";
    byId("overview-renewal").textContent = "Sign in to view";
    byId("overview-renewal-note").textContent = "See when your next payment is due.";
    byId("overview-payment").textContent = "Sign in to view";
    byId("overview-payment-note").textContent = "Your latest confirmed payment appears here.";
    byId("profile-plan").textContent = "Membership";
    byId("profile-plan-note").textContent = "Loading your plan…";
    byId("profile-renewal").textContent = "—";
    byId("profile-last-payment").textContent = "—";
    byId("profile-payment-state").textContent = "Checking";
    byId("profile-payment-state").dataset.status = "none";
  }
}

const requestStatusLabels = {
  added: "Added",
  processing: "Processing",
  partial: "Partially available",
  approved: "Approved",
  pending: "Pending",
  declined: "Declined",
  removed: "Removed",
  unknown: "Requested",
};

function safePosterUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "image.tmdb.org" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function requestedText(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return "Requested recently";
  const elapsedDays = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (elapsedDays === 0) return "Requested today";
  if (elapsedDays === 1) return "Requested yesterday";
  if (elapsedDays < 14) return `Requested ${elapsedDays} days ago`;
  const weeks = Math.floor(elapsedDays / 7);
  if (weeks < 8) return `Requested ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return `Requested ${new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function durationText(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  if (total < 3600) return `${Math.floor(total / 60)}m`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
}

async function loadWatchTime() {
  if (!user) return;
  const userId = user.id;
  try {
    const data = await request("activity?range=7", undefined, "");
    if (user?.id !== userId) return;
    const hasWatchTime = data?.watchTime && Number.isFinite(Number(data.watchTime.seconds));
    byId("overview-watch-time").textContent = hasWatchTime ? durationText(data.watchTime.seconds) : "Not linked";
    byId("overview-watch-time-note").textContent = hasWatchTime
      ? "Last 7 days"
      : "No matching Tautulli user was found.";
  } catch {
    if (user?.id === userId) {
      byId("overview-watch-time").textContent = "Unavailable";
      byId("overview-watch-time-note").textContent = "Seven-day watch time could not be loaded.";
    }
  }
}

function renderRequests(data) {
  if (!Array.isArray(data?.requests)) throw new Error("Recent requests returned an unexpected response.");
  const rows = data.requests.slice(0, 4).map((item) => {
    const row = document.createElement("li");
    row.className = "pp-request-item";
    const posterUrl = safePosterUrl(item.posterUrl);
    if (posterUrl) {
      const poster = document.createElement("img");
      poster.src = posterUrl;
      poster.alt = "";
      poster.loading = "lazy";
      poster.referrerPolicy = "no-referrer";
      row.append(poster);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "pp-request-poster-placeholder";
      placeholder.setAttribute("data-icon", item.type === "tv" ? "play" : "film");
      row.append(placeholder);
    }
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title || (item.type === "tv" ? "TV request" : "Movie request");
    const detail = document.createElement("small");
    detail.textContent = `${item.type === "tv" ? "TV show" : "Movie"}${item.year ? ` · ${item.year}` : ""} · ${requestedText(item.requestedAt)}`;
    copy.append(title, detail);
    const state = document.createElement("span");
    state.className = "pp-billing-state pp-request-state";
    state.dataset.status = item.status || "unknown";
    state.textContent = requestStatusLabels[item.status] || requestStatusLabels.unknown;
    const arrow = document.createElement("span");
    arrow.className = "pp-request-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "›";
    row.append(copy, state, arrow);
    return row;
  });
  if (!rows.length) {
    const empty = document.createElement("li");
    empty.className = "pp-request-empty";
    empty.textContent = "No recent Overseerr requests were found for this Plex account.";
    rows.push(empty);
  }
  byId("recent-requests").replaceChildren(...rows);
  byId("recent-requests").hidden = false;
}

async function loadRequests() {
  if (!user || requestsBusy) return;
  const userId = user.id;
  requestsBusy = true;
  byId("requests-panel").setAttribute("aria-busy", "true");
  byId("requests-status").textContent = "Loading recent requests…";
  byId("requests-status").dataset.error = "false";
  byId("requests-retry").hidden = true;
  controls();
  try {
    const data = await request("requests", undefined, "");
    if (user?.id === userId) {
      renderRequests(data);
      byId("requests-status").textContent = "";
    }
  } catch (error) {
    if (user?.id === userId) {
      byId("recent-requests").hidden = true;
      byId("requests-status").textContent = error.message;
      byId("requests-status").dataset.error = "true";
      byId("requests-retry").hidden = false;
    }
  } finally {
    requestsBusy = false;
    byId("requests-panel").setAttribute("aria-busy", "false");
    controls();
  }
}

const dateText = (value) => value == null ? "—" : new Date(value).toLocaleDateString(undefined,
  { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
const dateInput = (value) => value == null ? "" : new Date(value).toISOString().slice(0, 10);
const moneyText = (minor, currency = "GBP") => new Intl.NumberFormat(undefined,
  { style: "currency", currency }).format((Number(minor) || 0) / 100);
const paymentLabels = {
  none: "No plan", paid: "Paid", due_soon: "Due soon", overdue: "Overdue",
  unpaid: "Payment due", partially_paid: "Part paid", awaiting_confirmation: "Awaiting confirmation", void: "Void",
};
const accessLabels = { enabled: "Access enabled", pending: "Access pending", suspended: "Access suspended", cancelled: "Plan cancelled" };
const methodLabels = { bank_transfer: "Bank transfer", cash: "Cash", card: "Card", paypal: "PayPal", other: "Other" };

function tableTextCell(row, text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function renderPaymentRows(target, payments, admin = false) {
  const rows = payments.map((payment) => {
    const row = document.createElement("tr");
    tableTextCell(row, dateText(payment.receivedAt));
    if (admin) {
      tableTextCell(row, moneyText(payment.amountMinor, payment.currency));
      tableTextCell(row, methodLabels[payment.method] || payment.method);
      tableTextCell(row, payment.reference || "—");
    } else {
      tableTextCell(row, payment.tier || "—");
      tableTextCell(row, moneyText(payment.amountMinor, payment.currency));
    }
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "pp-billing-state";
    badge.dataset.status = payment.status;
    badge.textContent = payment.status === "confirmed" ? "Confirmed" : payment.status;
    statusCell.append(badge);
    row.append(statusCell);
    if (admin) {
      const actionCell = document.createElement("td");
      if (payment.status !== "void") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pp-text-link pp-void-payment";
        button.dataset.paymentId = payment.id;
        button.textContent = "Void";
        actionCell.append(button);
      }
      row.append(actionCell);
    }
    return row;
  });
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = admin ? 6 : 4;
    cell.textContent = "No payments have been recorded yet.";
    row.append(cell);
    rows.push(row);
  }
  byId(target).replaceChildren(...rows);
}

function renderBilling(data) {
  const billing = data?.billing;
  if (!billing || !Array.isArray(billing.payments)) throw new Error("Membership details returned an unexpected response.");
  const subscription = billing.subscription;
  const period = billing.currentPeriod;
  const paymentStatus = period?.paymentStatus || "none";
  const paymentLabel = paymentLabels[paymentStatus] || "Payment status unavailable";
  const tier = subscription?.tierId || subscription?.tier;
  for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, tier);
  renderPaymentRows("billing-payments", billing.payments.filter((payment) => payment.status !== "void").slice(0, 4));
  byId("billing-results").hidden = false;

  byId("profile-plan").textContent = subscription?.tier || "No plan assigned";
  byId("profile-plan-note").textContent = subscription
    ? (accessLabels[subscription.accessStatus] || subscription.accessStatus) : "Contact Jacob to choose a plan";
  const days = period ? Math.ceil((period.endsAt - Date.now()) / 86_400_000) : null;
  const renewalSuffix = days == null ? "" : days < 0
    ? ` (${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue)`
    : days === 0 ? " (due today)" : ` (${days} day${days === 1 ? "" : "s"} left)`;
  byId("profile-renewal").textContent = period ? `${dateText(period.endsAt)}${renewalSuffix}` : "Not scheduled";
  byId("profile-last-payment").textContent = billing.lastPayment
    ? `${dateText(billing.lastPayment.receivedAt)} · ${moneyText(billing.lastPayment.amountMinor, billing.lastPayment.currency)}` : "None recorded";
  byId("profile-payment-state").textContent = paymentLabel;
  byId("profile-payment-state").dataset.status = paymentStatus;
  byId("overview-plan").textContent = subscription?.tier || "No plan";
  byId("overview-plan-note").textContent = subscription ? (accessLabels[subscription.accessStatus] || subscription.accessStatus) : "No membership has been assigned yet.";
  if (period) {
    byId("overview-renewal").textContent = days < 0 ? "Overdue" : days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} left`;
    byId("overview-renewal-note").textContent = `Renews ${dateText(period.endsAt)}`;
  } else {
    byId("overview-renewal").textContent = "Not scheduled";
    byId("overview-renewal-note").textContent = "No payment date has been set.";
  }
  byId("overview-payment").textContent = paymentLabel;
  byId("overview-payment-note").textContent = billing.lastPayment
    ? `Last paid ${dateText(billing.lastPayment.receivedAt)} · ${moneyText(billing.lastPayment.amountMinor, billing.lastPayment.currency)}`
    : "No confirmed payment has been recorded.";
}

async function loadBilling() {
  if (!user || billingBusy) return;
  const userId = user.id;
  billingBusy = true;
  byId("billing-panel").setAttribute("aria-busy", "true");
  byId("billing-status").textContent = "Loading membership…";
  byId("billing-status").dataset.error = "false";
  byId("billing-retry").hidden = true;
  controls();
  try {
    const data = await request("billing", undefined, "");
    if (user?.id === userId) {
      renderBilling(data);
      byId("billing-status").textContent = "";
    }
  } catch (error) {
    if (user?.id === userId) {
      byId("billing-results").hidden = true;
      byId("billing-status").textContent = error.message;
      byId("billing-status").dataset.error = "true";
      byId("billing-retry").hidden = false;
      for (const id of ["overview-plan", "overview-renewal", "overview-payment"]) byId(id).textContent = "Unavailable";
      for (const id of ["profile-plan", "profile-renewal", "profile-last-payment"]) byId(id).textContent = "Unavailable";
      byId("profile-plan-note").textContent = "Membership details could not be loaded.";
      byId("profile-payment-state").textContent = "Unavailable";
      byId("profile-payment-state").dataset.status = "none";
    }
  } finally {
    billingBusy = false;
    byId("billing-panel").setAttribute("aria-busy", "false");
    controls();
  }
}

function adminCell(row, primary, secondary = "") {
  const cell = document.createElement("td");
  const strong = document.createElement("strong");
  strong.textContent = primary;
  cell.append(strong);
  if (secondary) {
    const small = document.createElement("small");
    small.textContent = secondary;
    cell.append(small);
  }
  row.append(cell);
  return { cell, strong };
}

function adminUserCell(row, account) {
  const cell = document.createElement("td");
  cell.className = "pp-admin-user-cell";
  const identity = document.createElement("span");
  identity.className = "pp-admin-user-identity";
  const avatar = document.createElement("span");
  avatar.className = "pp-admin-avatar";
  const image = document.createElement("img");
  image.width = 38;
  image.height = 38;
  configureAvatar(image, account.plexAvatarUrl, account.displayName, avatar);
  avatar.append(image);
  const copy = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = account.displayName || "Unnamed account";
  if (account.isAdmin) {
    const badge = document.createElement("span");
    badge.className = "pp-admin-role";
    badge.textContent = "ADMIN";
    strong.append(badge);
  }
  const small = document.createElement("small");
  small.textContent = account.email;
  copy.append(strong, small);
  identity.append(avatar, copy);
  cell.append(identity);
  row.append(cell);
}

function adminTierCell(row, subscription) {
  const cell = document.createElement("td");
  const tier = document.createElement("span");
  tier.className = "pp-admin-tier";
  tier.append(tierBadge(subscription?.tier), document.createElement("span"));
  const copy = tier.lastElementChild;
  const strong = document.createElement("strong");
  strong.textContent = subscription?.tier || "No plan";
  copy.append(strong);
  if (subscription) {
    const small = document.createElement("small");
    small.textContent = accessLabels[subscription.status] || subscription.status;
    copy.append(small);
  }
  cell.append(tier);
  row.append(cell);
}

function renderAdminUsers(data) {
  if (!Array.isArray(data?.users)) throw new Error("The user list returned an unexpected response.");
  const body = byId("admin-users");
  const rows = data.users.map((account) => {
    const row = document.createElement("tr");
    adminUserCell(row, account);
    adminCell(row, account.signInMethods?.join(" + ") || "Not linked", account.plexUsername ? `Plex: ${account.plexUsername}` : "");
    adminTierCell(row, account.subscription);
    const billingLabel = paymentLabels[account.billing?.status || "none"] || "Unknown";
    const billingCell = adminCell(row, billingLabel, account.billing
      ? `${moneyText(account.billing.outstandingMinor, account.billing.currency)} due · ${dateText(account.billing.nextDueAt)}` : "Not scheduled");
    billingCell.cell.classList.add("pp-admin-payment-cell");
    billingCell.cell.dataset.status = account.billing?.status || "none";
    const statusCell = document.createElement("td");
    const statusLabel = document.createElement("span");
    statusLabel.className = "pp-account-status";
    statusLabel.dataset.status = account.accountStatus;
    statusLabel.textContent = account.accountStatus;
    statusCell.append(statusLabel);
    row.append(statusCell);
    const manageCell = document.createElement("td");
    const manage = document.createElement("button");
    manage.type = "button";
    manage.className = "pp-button pp-admin-manage";
    manage.dataset.userId = account.id;
    manage.textContent = "Manage";
    manageCell.append(manage);
    row.append(manageCell);
    return row;
  });
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No user accounts were found.";
    row.append(cell);
    rows.push(row);
  }
  body.replaceChildren(...rows);
  byId("admin-total").textContent = String(data.summary?.total ?? data.users.length);
  byId("admin-enabled").textContent = String(data.summary?.enabled ?? data.users.filter((account) => account.accountStatus === "enabled").length);
  byId("admin-subscribed").textContent = String(data.summary?.subscribed ?? data.users.filter((account) => account.subscription).length);
  byId("admin-overdue").textContent = String(data.summary?.overdue ?? data.users.filter((account) => account.billing?.status === "overdue").length);
  byId("admin-table-wrap").hidden = false;
}

async function loadAdminUsers() {
  if (!user?.isAdmin || adminBusy) return;
  adminBusy = true;
  byId("admin-status").textContent = "Loading user accounts…";
  byId("admin-status").dataset.error = "false";
  byId("admin-retry").hidden = true;
  controls();
  try {
    renderAdminUsers(await request("users", undefined, "admin"));
    byId("admin-status").textContent = "";
  } catch (error) {
    byId("admin-table-wrap").hidden = true;
    byId("admin-status").textContent = error.message;
    byId("admin-status").dataset.error = "true";
    byId("admin-retry").hidden = false;
  } finally {
    adminBusy = false;
    controls();
  }
}

function nextMonthDate(value = new Date()) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

function adminBillingMessage(text, error = false) {
  byId("admin-billing-status").textContent = text;
  byId("admin-billing-status").dataset.error = String(error);
}

function renderAdminBilling(data) {
  if (!data?.account || !Array.isArray(data.tiers) || !data.billing || !Array.isArray(data.billing.payments)) {
    throw new Error("Billing details returned an unexpected response.");
  }
  adminBillingData = data;
  const subscription = data.billing.subscription;
  const period = data.billing.currentPeriod;
  byId("admin-billing-account").textContent = `${data.account.displayName} · ${data.account.email}`;
  const tierSelect = byId("admin-plan-tier");
  tierSelect.replaceChildren(...data.tiers.map((tier) => {
    const option = document.createElement("option");
    option.value = tier.id;
    option.textContent = `${tier.name} · ${moneyText(tier.monthlyPriceMinor, tier.currency)}/month`;
    option.dataset.priceMinor = String(tier.monthlyPriceMinor);
    option.dataset.currency = tier.currency;
    return option;
  }));
  if (subscription && data.tiers.some((tier) => tier.id === subscription.tierId)) tierSelect.value = subscription.tierId;
  byId("admin-plan-access").value = subscription?.accessStatus || "pending";
  const today = new Date();
  const todayText = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
  byId("admin-plan-start").value = dateInput(subscription?.startsAt) || todayText;
  byId("admin-plan-due").value = dateInput(subscription?.endsAt) || nextMonthDate(new Date(`${todayText}T00:00:00Z`));
  byId("admin-payment-date").value = todayText;
  const suggested = period?.outstandingMinor > 0 ? period.outstandingMinor : subscription?.monthlyPriceMinor || Number(tierSelect.selectedOptions[0]?.dataset.priceMinor || 0);
  byId("admin-payment-amount").value = suggested ? (suggested / 100).toFixed(2) : "";
  byId("admin-payment-reference").value = "";
  renderPaymentRows("admin-billing-payments", data.billing.payments, true);
  byId("admin-billing-content").hidden = false;
  byId("admin-billing-editor").hidden = false;
  controls();
}

async function openAdminBilling(userId) {
  if (!user?.isAdmin || adminBillingBusy) return;
  adminBillingBusy = true;
  byId("admin-billing-editor").hidden = false;
  byId("admin-billing-content").hidden = true;
  adminBillingMessage("Loading billing details…");
  controls();
  try {
    const data = await request(`billing?userId=${encodeURIComponent(userId)}`, undefined, "admin");
    renderAdminBilling(data);
    adminBillingMessage("");
    byId("admin-billing-heading").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    adminBillingMessage(error.message, true);
  } finally {
    adminBillingBusy = false;
    controls();
  }
}

async function updateAdminBilling(body, progress, success) {
  if (!user?.isAdmin || adminBillingBusy || !adminBillingData?.account?.id) return;
  adminBillingBusy = true;
  adminBillingMessage(progress);
  controls();
  try {
    const data = await request("billing", { ...body, userId: adminBillingData.account.id }, "admin");
    renderAdminBilling(data);
    adminBillingMessage(success);
    if (user.id === data.account.id) renderBilling({ billing: data.billing });
    await loadAdminUsers();
  } catch (error) {
    adminBillingMessage(error.message, true);
  } finally {
    adminBillingBusy = false;
    controls();
  }
}

async function acceptUser(next) {
  renderUser(next);
  if (next) await Promise.all([loadBilling(), loadWatchTime(), loadRequests(), next.isAdmin ? loadAdminUsers() : Promise.resolve()]);
}

async function request(action, body, group = "auth") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const route = group ? `/api/portal/${group}/${action}` : `/api/portal/${action}`;
    const response = await fetch(route, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin", cache: "no-store", signal: controller.signal,
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json", "X-PlexPoint-Request": "1" }, body: JSON.stringify(body) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Account services are temporarily unavailable.");
    if (group !== "auth") return data;
    if (!("user" in data)) throw new Error("Account services returned an unexpected response.");
    return data.user;
  } catch (error) {
    if (error.name === "AbortError" || error instanceof TypeError || error instanceof SyntaxError) {
      throw new Error("Could not reach account services. Check your connection and try again.");
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

async function refreshSession() {
  if (busy || plexPending) return;
  busy = true;
  controls();
  try {
    const next = await request("session");
    const expired = user && !next;
    available = true;
    await acceptUser(next);
    byId("auth-retry").hidden = true;
    message(expired ? "Your session has ended. Please sign in again." : "");
  } catch (error) {
    available = false;
    renderUser(null);
    message(error.message, true);
    byId("auth-retry").hidden = false;
  } finally { busy = false; controls(); }
}

byId("auth-logout").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  controls();
  try {
    await request("logout", {});
    renderUser(null);
    message("You have signed out.", false, true);
    channel?.postMessage("session-changed");
  } catch (error) { message(error.message, true, true); }
  finally { busy = false; controls(); }
});
async function startPlex() {
  if (busy || !available || plexPending) return;
  busy = true;
  controls();
  message("Opening Plex sign-in…");
  try {
    const data = await request("start", {}, "plex");
    const url = new URL(data.authorizationUrl);
    if (url.origin !== "https://app.plex.tv" || url.pathname !== "/auth" || url.username || url.password) {
      throw new Error("Plex returned an unexpected sign-in address.");
    }
    // Same-tab authorization also works on mobile and with popup blockers enabled.
    location.assign(url.href);
  } catch (error) { message(error.message, true, true); }
  finally { busy = false; controls(); }
}

async function completePlex() {
  if (busy || !available) return;
  busy = true;
  plexReturning = false;
  controls();
  message("Checking your Plex sign-in…");
  try {
    const data = await request("complete", {}, "plex");
    plexPending = Boolean(data.pending);
    if (plexPending) message("Waiting for Plex approval. Check again after you finish signing in.");
    else if (data.user) {
      await acceptUser(data.user);
      message("You are signed in with Plex.", false, true);
      channel?.postMessage("session-changed");
    } else throw new Error("Plex sign-in returned an unexpected response. Please start again.");
  } catch (error) {
    plexPending = false;
    message(error.message, true, true);
  } finally { busy = false; controls(); }
}

byId("plex-sign-in").addEventListener("click", () => void startPlex());
byId("plex-check").addEventListener("click", () => void completePlex());
byId("plex-cancel").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  controls();
  try {
    await request("cancel", {}, "plex");
    plexPending = false;
    message("Plex sign-in cancelled. You can start again whenever you are ready.", false, true);
  } catch (error) { message(error.message, true, true); }
  finally { busy = false; controls(); }
});

const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("plexpoint-account") : null;
if (channel) channel.onmessage = () => void refreshSession();
async function initializeSession() {
  await refreshSession();
  if (plexReturning && available) await completePlex();
}
byId("auth-retry").addEventListener("click", () => void initializeSession());
byId("admin-retry").addEventListener("click", () => void loadAdminUsers());
byId("billing-retry").addEventListener("click", () => void loadBilling());
byId("requests-retry").addEventListener("click", () => void loadRequests());
byId("admin-users").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-user-id]");
  if (button) void openAdminBilling(button.dataset.userId);
});
byId("admin-billing-close").addEventListener("click", () => {
  byId("admin-billing-editor").hidden = true;
  byId("admin-billing-content").hidden = true;
  adminBillingData = null;
  adminBillingMessage("");
  controls();
});
byId("admin-plan-tier").addEventListener("change", () => {
  if (adminBillingData?.billing?.currentPeriod?.outstandingMinor > 0) return;
  const price = Number(byId("admin-plan-tier").selectedOptions[0]?.dataset.priceMinor || 0);
  byId("admin-payment-amount").value = price ? (price / 100).toFixed(2) : "";
});
byId("admin-plan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  void updateAdminBilling({
    action: "save_plan",
    tierId: byId("admin-plan-tier").value,
    accessStatus: byId("admin-plan-access").value,
    startsOn: byId("admin-plan-start").value,
    nextDueOn: byId("admin-plan-due").value,
  }, "Saving plan and billing dates…", "Plan and billing dates saved.");
});
byId("admin-payment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const amountMinor = Math.round(Number(byId("admin-payment-amount").value) * 100);
  void updateAdminBilling({
    action: "record_payment", amountMinor,
    receivedOn: byId("admin-payment-date").value,
    method: byId("admin-payment-method").value,
    reference: byId("admin-payment-reference").value,
  }, "Recording payment…", "Payment recorded and the member’s balance has been updated.");
});
byId("admin-billing-payments").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-payment-id]");
  if (!button || !window.confirm("Void this payment? It will remain in the history but will no longer count toward the balance.")) return;
  void updateAdminBilling({ action: "void_payment", paymentId: button.dataset.paymentId },
    "Voiding payment…", "Payment voided. The outstanding balance has been recalculated.");
});
window.addEventListener("focus", () => void refreshSession());
window.addEventListener("pageshow", (event) => { if (event.persisted) void initializeSession(); });
void initializeSession();
