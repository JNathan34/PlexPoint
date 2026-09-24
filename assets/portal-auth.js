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
let referralBusy = false;
let referralData = null;
let referralStep = 1;
let referralOrder = null;
let referralWhatsAppUrl = "";
let adminReferralsBusy = false;
let adminBillingData = null;
let memberPayments = [];
let memberPaymentsExpanded = false;
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
  for (const id of ["referral-copy", "referral-share", "referral-order-back", "referral-order-next", "referral-order-submit"]) {
    byId(id).disabled = referralBusy;
  }
  for (const formId of ["admin-plan-form", "admin-payment-form", "admin-addons-form"]) {
    const editorForm = byId(formId);
    for (const control of editorForm.elements) control.disabled = adminBillingBusy;
    editorForm.setAttribute("aria-busy", String(adminBillingBusy));
  }
  const selectedPrice = Number(byId("admin-plan-tier").selectedOptions[0]?.dataset.priceMinor);
  const paymentUnavailable = adminBillingBusy || !adminBillingData?.billing?.subscription || selectedPrice === 0;
  for (const control of byId("admin-payment-form").elements) control.disabled = paymentUnavailable;
  for (const item of byId("admin-addons-list").querySelectorAll(".pp-admin-addon-option")) {
    const checkbox = item.querySelector('input[type="checkbox"]');
    for (const control of item.querySelectorAll("[data-addon-control]")) {
      control.disabled = adminBillingBusy || !checkbox?.checked;
    }
  }
  for (const button of byId("admin-users").querySelectorAll("button")) button.disabled = adminBillingBusy;
  for (const button of byId("admin-billing-payments").querySelectorAll("button")) button.disabled = adminBillingBusy;
  byId("plex-pending").hidden = !plexPending;
}

const tierIconPaths = {
  none: ["m12 3 9 6-9 12L3 9l9-6Z", "M3 9h18M8 9l4 12 4-12"],
  bronze: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"],
  silver: ["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", "m9 12 2 2 4-4"],
  gold: ["M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z", "M5 21h14"],
  diamond: ["M6 3h12l4 6-10 13L2 9Z", "M11 3 8 9l4 13 4-13-3-6", "M2 9h20"],
  ruby: ["M6 3h12l4 6-10 13L2 9Z", "M11 3 8 9l4 13 4-13-3-6", "M2 9h20"],
  platinum: ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"],
  vip: ["m12 3 2.5 5.07 5.6.81-4.05 3.95.96 5.58L12 15.8l-5.01 2.63.96-5.58L3.9 8.88l5.6-.81L12 3Z"],
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
  const key = tierKey(value);
  badge.dataset.tier = key;
  if (id === "overview-tier-icon") badge.closest(".pp-metric")?.setAttribute("data-tier", key);
  badge.replaceChildren(tierSvg(value));
}

function setProfileTier(value) {
  byId("auth-user").dataset.tier = tierKey(value);
}

function setPlanNote(id, text) {
  const note = byId(id);
  note.textContent = text;
  note.hidden = !text;
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
  byId("referral-panel").hidden = !user;
  if (user) {
    byId("auth-user-name").textContent = user.displayName;
    byId("auth-user-email").textContent = user.email;
    configureAvatar(profileAvatar, user.avatarUrl || user.plex?.avatarUrl, user.displayName, profileAvatar.parentElement);
    for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, null);
    setProfileTier(null);
    byId("profile-plan").textContent = "Loading membership…";
    setPlanNote("profile-plan-note", "Checking your plan and payment details");
    byId("profile-renewal").textContent = "—";
    byId("profile-last-payment").textContent = "—";
    byId("profile-payment-state").textContent = "Checking";
    byId("profile-payment-state").dataset.status = "none";
    byId("profile-addons").hidden = true;
    byId("profile-addon-list").replaceChildren();
  } else {
    configureAvatar(profileAvatar, "", "", profileAvatar.parentElement);
    for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, null);
    setProfileTier(null);
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
    byId("billing-view-all").hidden = true;
    memberPayments = [];
    memberPaymentsExpanded = false;
    referralData = null;
    referralOrder = null;
    referralWhatsAppUrl = "";
    byId("referral-panel").hidden = true;
    byId("referral-content").hidden = true;
    byId("referral-order").hidden = true;
    byId("referral-welcome").hidden = true;
    byId("overview-plan").textContent = "Sign in to view";
    setPlanNote("overview-plan-note", "Your current plan and access status appear here.");
    byId("overview-renewal").textContent = "Sign in to view";
    byId("overview-renewal-note").textContent = "See when your next payment is due.";
    byId("overview-payment").textContent = "Sign in to view";
    byId("overview-payment-note").textContent = "Your latest confirmed payment appears here.";
    byId("profile-plan").textContent = "Membership";
    setPlanNote("profile-plan-note", "Loading your plan…");
    byId("profile-renewal").textContent = "—";
    byId("profile-last-payment").textContent = "—";
    byId("profile-payment-state").textContent = "Checking";
    byId("profile-payment-state").dataset.status = "none";
    byId("profile-addons").hidden = true;
    byId("profile-addon-list").replaceChildren();
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

const referralStatusLabels = {
  registered: "Account created", awaiting_payment: "Awaiting payment", completed: "Completed", cancelled: "Cancelled",
};

function setReferralStep(step) {
  referralStep = Math.max(1, Math.min(3, step));
  for (const panel of document.querySelectorAll("[data-referral-step]")) panel.hidden = Number(panel.dataset.referralStep) !== referralStep;
  for (const dot of document.querySelectorAll("[data-referral-step-dot]")) {
    const number = Number(dot.dataset.referralStepDot);
    dot.classList.toggle("is-active", number === referralStep);
    dot.classList.toggle("is-complete", number < referralStep);
  }
  byId("referral-order-step-label").textContent = `Step ${referralStep} of 3`;
  byId("referral-order-back").hidden = referralStep === 1;
  byId("referral-order-next").hidden = referralStep === 3;
  byId("referral-order-submit").hidden = referralStep !== 3;
  byId("referral-order-next").textContent = referralStep === 1 ? "Choose extras" : "Review order";
  if (referralStep === 3) renderReferralReview();
}

function selectedReferralAddons() {
  return [...byId("referral-extras").querySelectorAll("input[data-addon-id]")]
    .map((input) => ({ id: input.dataset.addonId, quantity: Number(input.value || 0) }))
    .filter((item) => Number.isSafeInteger(item.quantity) && item.quantity > 0);
}

function renderReferralReview() {
  const plan = referralData?.plans?.find((item) => item.id === byId("referral-plan").value);
  if (!plan) return;
  const addonMap = new Map((referralData.addons || []).map((addon) => [addon.id, addon]));
  const addons = selectedReferralAddons().map((item) => ({ ...addonMap.get(item.id), ...item }));
  const total = Number(plan.monthlyPriceMinor) + addons.reduce((sum, addon) => sum + Number(addon.priceMinor) * addon.quantity, 0);
  const rows = [["Plex username", user?.plex?.username || user?.displayName || "Your account"],
    ["Plan", `${plan.name} · ${moneyText(plan.monthlyPriceMinor, plan.currency)}/month`],
    ["Extras", addons.length ? addons.map((addon) => `${addon.quantity}× ${addon.name}`).join(", ") : "None"],
    ["Total", `${moneyText(total, plan.currency)}${addons.some((addon) => addon.billingLabel === "per month") ? " first month" : ""}`],
    ["Referred by", referralData?.inbound?.referredBy?.code || "—"],
    ["Order ID", referralOrder?.id || referralData?.inbound?.order?.id || "Preparing…"]];
  byId("referral-review").replaceChildren(...rows.map(([label, value], index) => {
    const row = document.createElement("div");
    if (index === 3) row.className = "is-total";
    const key = document.createElement("span"); key.textContent = label;
    const copy = document.createElement("strong"); copy.textContent = value;
    row.append(key, copy); return row;
  }));
}

function renderReferralHistory(referrals) {
  byId("referral-history-summary").textContent = referrals.length
    ? `${referrals.length} friend${referrals.length === 1 ? "" : "s"}` : "No referrals yet";
  byId("referral-history-list").replaceChildren(...referrals.map((referral) => {
    const row = document.createElement("div");
    const copy = document.createElement("span");
    const name = document.createElement("strong"); name.textContent = referral.member;
    const detail = document.createElement("small"); detail.textContent = referral.completedAt
      ? `Completed ${dateText(referral.completedAt)}` : `Joined ${dateText(referral.createdAt)}`;
    copy.append(name, detail);
    const state = document.createElement("span"); state.className = "pp-billing-state"; state.dataset.status = referral.status;
    state.textContent = referralStatusLabels[referral.status] || referral.status;
    row.append(copy, state); return row;
  }));
}

function renderReferralOrder(data) {
  const inbound = data.inbound;
  const canOrder = inbound && ["registered", "awaiting_payment"].includes(inbound.status);
  byId("referral-order").hidden = !canOrder;
  if (!canOrder) return;
  byId("referral-order-by").textContent = `Referred by ${inbound.referredBy.code} ✓`;
  byId("referral-plan").replaceChildren(...data.plans.map((plan) => {
    const option = document.createElement("option"); option.value = plan.id;
    option.textContent = `${plan.name} — ${moneyText(plan.monthlyPriceMinor, plan.currency)}/month`;
    return option;
  }));
  if (inbound.order?.tierId && data.plans.some((plan) => plan.id === inbound.order.tierId)) byId("referral-plan").value = inbound.order.tierId;
  const assigned = new Map((inbound.order?.addons || []).map((addon) => [addon.id, addon.quantity]));
  referralOrder = inbound.order || null;
  byId("referral-extras").replaceChildren(...data.addons.map((addon) => {
    const row = document.createElement("label");
    const copy = document.createElement("span");
    const name = document.createElement("strong"); name.textContent = addon.name;
    const price = document.createElement("small"); price.textContent = `${moneyText(addon.priceMinor, addon.currency)} ${addon.billingLabel}`;
    copy.append(name, price);
    const input = document.createElement("input"); input.type = "number"; input.min = "0"; input.max = "10"; input.step = "1";
    input.value = String(assigned.get(addon.id) || 0); input.dataset.addonId = addon.id;
    input.setAttribute("aria-label", `${addon.name} quantity`);
    row.append(copy, input); return row;
  }));
  setReferralStep(1);
}

function renderReferrals(data) {
  referralData = data;
  const landing = data?.landing;
  byId("referral-welcome").hidden = !landing || Boolean(user);
  if (landing) {
    byId("referral-welcome-title").textContent = `Referred by ${landing.code} ✓`;
    byId("referral-welcome-copy").textContent = `Continue with Plex to create your account${landing.displayName ? ` through ${landing.displayName}` : ""}.`;
  }
  if (!user || !data?.dashboard) return;
  byId("referral-panel").hidden = false;
  byId("referral-content").hidden = false;
  byId("referral-status").textContent = "";
  byId("referral-link").value = data.dashboard.link;
  byId("referral-progress-count").textContent = `${data.dashboard.completed}/${data.dashboard.maximum}`;
  byId("referral-season-total").textContent = String(data.dashboard.totals.seasons);
  byId("referral-movie-total").textContent = String(data.dashboard.totals.movies);
  byId("referral-next").textContent = data.dashboard.nextReward
    ? `Next friend: +${data.dashboard.nextReward.seasons} season and +${data.dashboard.nextReward.movies} movie requests.`
    : "You’ve unlocked every referral reward — thank you!";
  byId("referral-milestones").replaceChildren(...data.dashboard.rewards.map((reward) => {
    const item = document.createElement("span");
    const complete = reward.number <= data.dashboard.completed;
    item.className = complete ? "is-complete" : "";
    item.textContent = complete ? "✓" : String(reward.number);
    item.title = `Friend ${reward.number}: +${reward.seasons} season, +${reward.movies} movie requests`;
    return item;
  }));
  renderReferralHistory(data.dashboard.referrals || []);
  renderReferralOrder(data);
}

async function loadReferrals() {
  if (referralBusy) return;
  referralBusy = true;
  if (user) byId("referral-status").textContent = "Loading your referral rewards…";
  controls();
  try { renderReferrals(await request("referrals", undefined, "")); }
  catch (error) {
    if (user) {
      byId("referral-panel").hidden = false;
      byId("referral-status").textContent = error.message;
      byId("referral-status").dataset.error = "true";
    }
  } finally { referralBusy = false; controls(); }
}

function tableTextCell(row, text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function tableDetailCell(row, primary, secondary = "", className = "") {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  const strong = document.createElement("strong");
  strong.textContent = primary;
  cell.append(strong);
  if (secondary) {
    const small = document.createElement("small");
    small.textContent = secondary;
    cell.append(small);
  }
  row.append(cell);
  return cell;
}

function paymentCoverageText(payment) {
  if (payment.coverageStartsAt == null || payment.coverageEndsAt == null) return "Coverage not recorded";
  return `${dateText(payment.coverageStartsAt)} – ${dateText(payment.coverageEndsAt)}`;
}

function renderPaymentRows(target, payments, admin = false) {
  const rows = payments.map((payment) => {
    const row = document.createElement("tr");
    tableTextCell(row, dateText(payment.receivedAt));
    if (admin) {
      tableDetailCell(row, moneyText(payment.amountMinor, payment.currency), methodLabels[payment.method] || payment.method);
      tableDetailCell(row, payment.coverageMonths ? `${payment.coverageMonths} month${payment.coverageMonths === 1 ? "" : "s"}` : "Not specified",
        paymentCoverageText(payment));
      tableDetailCell(row, payment.note || "No note", payment.reference ? `Ref: ${payment.reference}` : "");
    } else {
      tableDetailCell(row, payment.tier || "—", paymentCoverageText(payment));
      tableTextCell(row, moneyText(payment.amountMinor, payment.currency));
    }
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "pp-billing-state";
    badge.dataset.status = payment.status;
    badge.textContent = admin
      ? (payment.status === "confirmed" ? "Confirmed" : payment.status)
      : (payment.status === "confirmed" ? "Paid" : "Not paid");
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

function renderMemberPayments() {
  renderPaymentRows("billing-payments", memberPaymentsExpanded ? memberPayments : memberPayments.slice(0, 4));
  const toggle = byId("billing-view-all");
  toggle.hidden = memberPayments.length <= 4;
  toggle.textContent = memberPaymentsExpanded ? "Show latest 4 ↑" : "View all →";
  toggle.setAttribute("aria-expanded", String(memberPaymentsExpanded));
}

function renderBilling(data) {
  const billing = data?.billing;
  if (!billing || !Array.isArray(billing.payments)) throw new Error("Membership details returned an unexpected response.");
  const subscription = billing.subscription;
  const period = billing.currentPeriod;
  const paymentStatus = period?.paymentStatus || "none";
  const noPaymentRequired = Boolean(subscription && Number(subscription.monthlyPriceMinor) === 0);
  const paymentLabel = noPaymentRequired ? "No payment required" : paymentLabels[paymentStatus] || "Payment status unavailable";
  const tier = subscription?.tierId || subscription?.tier;
  for (const id of ["overview-tier-icon", "profile-tier-icon"]) setTierBadge(id, tier);
  setProfileTier(tier);
  memberPayments = billing.payments.filter((payment) => payment.status !== "void");
  memberPaymentsExpanded = false;
  renderMemberPayments();
  byId("billing-results").hidden = false;

  byId("profile-plan").textContent = subscription?.tier || "No plan assigned";
  setPlanNote("profile-plan-note", subscription ? "" : "Contact Jacob to choose a plan");
  const addons = Array.isArray(billing.addons) ? billing.addons : [];
  const addonList = byId("profile-addon-list");
  addonList.replaceChildren(...addons.map((addon) => {
    const chip = document.createElement("span");
    const timing = addon.endsAt ? ` · until ${dateText(addon.endsAt)}` : addon.startsAt ? " · ongoing" : "";
    chip.textContent = `${addon.name}${addon.quantity > 1 ? ` ×${addon.quantity}` : ""}${timing}`;
    if (addon.description) chip.title = addon.description;
    return chip;
  }));
  byId("profile-addons").hidden = addons.length === 0;
  const days = period ? Math.ceil((period.endsAt - Date.now()) / 86_400_000) : null;
  const renewalSuffix = days == null ? "" : days < 0
    ? ` (${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue)`
    : days === 0 ? " (due today)" : ` (${days} day${days === 1 ? "" : "s"} left)`;
  byId("profile-renewal").textContent = period ? `${dateText(period.endsAt)}${renewalSuffix}` : "Not scheduled";
  byId("profile-last-payment").textContent = billing.lastPayment
    ? `${dateText(billing.lastPayment.receivedAt)} · ${moneyText(billing.lastPayment.amountMinor, billing.lastPayment.currency)}`
    : noPaymentRequired ? "Not required" : "None recorded";
  byId("profile-payment-state").textContent = paymentLabel;
  byId("profile-payment-state").dataset.status = paymentStatus;
  byId("overview-plan").textContent = subscription?.tier || "No plan";
  setPlanNote("overview-plan-note", subscription ? "" : "No membership has been assigned yet.");
  if (period) {
    byId("overview-renewal").textContent = days < 0 ? "Overdue" : days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} left`;
    byId("overview-renewal-note").textContent = `Renews ${dateText(period.endsAt)}`;
  } else {
    byId("overview-renewal").textContent = "Not scheduled";
    byId("overview-renewal-note").textContent = "No payment date has been set.";
  }
  byId("overview-payment").textContent = paymentLabel;
  byId("overview-payment-note").textContent = noPaymentRequired
    ? "VIP access does not require payment."
    : billing.lastPayment
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
      setPlanNote("profile-plan-note", "Membership details could not be loaded.");
      byId("profile-payment-state").textContent = "Unavailable";
      byId("profile-payment-state").dataset.status = "none";
      byId("profile-addons").hidden = true;
      byId("profile-addon-list").replaceChildren();
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
    adminCell(row, account.signInMethods?.join(" + ") || "Not linked", [
      account.plexUsername ? `Plex: ${account.plexUsername}` : "",
      account.referredBy ? `Referred by ${account.referredBy.code}` : "",
    ].filter(Boolean).join(" · "));
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

function renderAdminReferrals(data) {
  if (!Array.isArray(data?.referrals)) throw new Error("The referral list returned an unexpected response.");
  byId("admin-referrals").hidden = false;
  byId("admin-referrals-summary").textContent = data.referrals.length
    ? `${data.referrals.filter((item) => item.status === "completed").length} completed · ${data.referrals.length} total`
    : "No referrals yet";
  const rows = data.referrals.map((referral) => {
    const row = document.createElement("tr");
    adminCell(row, referral.referred.name, referral.orderId || "No order yet");
    adminCell(row, referral.referrer.name, referral.referrer.code);
    adminCell(row, referral.tier || "Not chosen", referral.totalMinor == null ? "—" : moneyText(referral.totalMinor, referral.currency));
    const stateCell = document.createElement("td");
    const state = document.createElement("span"); state.className = "pp-billing-state"; state.dataset.status = referral.status;
    state.textContent = referralStatusLabels[referral.status] || referral.status; stateCell.append(state); row.append(stateCell);
    adminCell(row, referral.referralNumber ? `Reward #${referral.referralNumber}` : "Not issued",
      referral.referralNumber ? `+${referral.reward.seasons} season · +${referral.reward.movies} movie` : "Payment must be confirmed");
    const actionCell = document.createElement("td");
    const button = document.createElement("button"); button.type = "button"; button.className = "pp-button pp-admin-manage";
    button.dataset.userId = referral.referred.id; button.textContent = "Manage"; actionCell.append(button); row.append(actionCell);
    return row;
  });
  if (!rows.length) {
    const row = document.createElement("tr"); const cell = document.createElement("td"); cell.colSpan = 6;
    cell.textContent = "No friend referrals have been started."; row.append(cell); rows.push(row);
  }
  byId("admin-referrals-list").replaceChildren(...rows);
  byId("admin-referrals-status").textContent = "";
}

async function loadAdminReferrals() {
  if (!user?.isAdmin || adminReferralsBusy) return;
  adminReferralsBusy = true;
  byId("admin-referrals").hidden = false;
  byId("admin-referrals-status").textContent = "Loading referrals…";
  try { renderAdminReferrals(await request("referrals", undefined, "admin")); }
  catch (error) { byId("admin-referrals-status").textContent = error.message; byId("admin-referrals-status").dataset.error = "true"; }
  finally { adminReferralsBusy = false; }
}

function addCalendarMonths(value, months = 1) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}

function nextMonthDate(value = new Date()) {
  const date = addCalendarMonths(value, 1);
  return date.toISOString().slice(0, 10);
}

function refreshPaymentAction() {
  const button = byId("admin-payment-save");
  const subscription = adminBillingData?.billing?.subscription;
  const monthlyPrice = Number(subscription?.monthlyPriceMinor ?? 0);
  const amountMinor = Math.round(Number(byId("admin-payment-amount").value || 0) * 100);
  if (!subscription) button.textContent = "Assign a plan first";
  else if (monthlyPrice === 0) button.textContent = "No payment needed";
  else button.textContent = amountMinor > 0 ? `Save ${moneyText(amountMinor, subscription.currency)} payment` : "Save payment";
}

function refreshPaymentDetailsSummary() {
  const date = byId("admin-payment-date").value;
  const method = byId("admin-payment-method").selectedOptions[0]?.textContent || "Payment";
  const hasExtra = byId("admin-payment-reference").value.trim() || byId("admin-payment-note").value.trim();
  byId("admin-payment-details-summary").textContent = [
    date ? dateText(new Date(`${date}T00:00:00Z`)) : "No date",
    method,
    hasExtra ? "Includes a note" : "No note",
  ].join(" · ");
}

function refreshPaymentCoverage({ resetAmount = true } = {}) {
  const preview = byId("admin-payment-coverage-preview");
  const subscription = adminBillingData?.billing?.subscription;
  const period = adminBillingData?.billing?.currentPeriod;
  const months = Number(byId("admin-payment-months").value || 1);
  const monthlyPrice = Number(period?.monthlyPriceMinor ?? subscription?.monthlyPriceMinor
    ?? byId("admin-plan-tier").selectedOptions[0]?.dataset.priceMinor ?? 0);
  if (!subscription || !period || monthlyPrice === 0) {
    preview.querySelector("strong").textContent = subscription && monthlyPrice === 0 ? "No payment required" : "Choose a plan first";
    preview.querySelector("span").textContent = subscription && monthlyPrice === 0
      ? "This membership has no monthly charge."
      : "The exact dates will appear here.";
    if (resetAmount) byId("admin-payment-amount").value = "";
    refreshPaymentAction();
    return;
  }
  const catchingUp = period.outstandingMinor > 0;
  const coverageStart = new Date(catchingUp ? period.startsAt : period.endsAt);
  const coverageEnd = addCalendarMonths(coverageStart, months);
  preview.querySelector("strong").textContent = `${dateText(coverageStart)} – ${dateText(coverageEnd)}`;
  preview.querySelector("span").textContent = catchingUp
    ? `Catches up ${months} month${months === 1 ? "" : "s"} from the unpaid period.`
    : `Adds ${months} month${months === 1 ? "" : "s"} after the current paid-through date.`;
  if (resetAmount) {
    const suggested = catchingUp
      ? Number(period.outstandingMinor) + Math.max(0, monthlyPrice * months - Number(period.amountDueMinor))
      : monthlyPrice * months;
    byId("admin-payment-amount").value = suggested ? (suggested / 100).toFixed(2) : "";
  }
  refreshPaymentAction();
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
    option.textContent = tier.monthlyPriceMinor === 0
      ? `${tier.name} · No payment`
      : `${tier.name} · ${moneyText(tier.monthlyPriceMinor, tier.currency)}/month`;
    option.dataset.priceMinor = String(tier.monthlyPriceMinor);
    option.dataset.currency = tier.currency;
    return option;
  }));
  if (subscription && data.tiers.some((tier) => tier.id === subscription.tierId)) tierSelect.value = subscription.tierId;
  else if (data.referral?.order?.tierId && data.tiers.some((tier) => tier.id === data.referral.order.tierId)) tierSelect.value = data.referral.order.tierId;
  byId("admin-plan-access").value = subscription?.accessStatus || "pending";
  const today = new Date();
  const todayText = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
  byId("admin-plan-start").value = dateInput(subscription?.startsAt) || todayText;
  byId("admin-plan-due").value = dateInput(subscription?.endsAt) || nextMonthDate(new Date(`${todayText}T00:00:00Z`));
  byId("admin-plan-settings").open = !subscription;
  byId("admin-billing-plan-summary").textContent = subscription?.tier || "Not assigned";
  byId("admin-billing-due-summary").textContent = subscription?.endsAt ? dateText(subscription.endsAt) : "Not set";
  byId("admin-billing-balance-summary").textContent = subscription && Number(subscription.monthlyPriceMinor) === 0
    ? "No payment"
    : period ? moneyText(period.outstandingMinor, period.currency) : "Not set";
  const referral = data.referral;
  byId("admin-referral-order").hidden = !referral;
  if (referral) {
    const order = referral.order;
    byId("admin-referral-order-title").textContent = order
      ? `${order.id} · ${order.tier} · ${moneyText(order.totalMinor, order.currency)}`
      : `Referred by ${referral.referredBy.code}`;
    byId("admin-referral-order-copy").textContent = order
      ? `Referred by ${referral.referredBy.code} · ${order.addons.length ? order.addons.map((addon) => `${addon.quantity}× ${addon.name}`).join(", ") : "No extras"}`
      : "The member has created an account but has not submitted an order.";
    const state = byId("admin-referral-order-state");
    state.dataset.status = referral.status;
    state.textContent = referral.qualified
      ? `✓ Reward #${referral.referralNumber || "—"} issued`
      : referralStatusLabels[referral.status] || referral.status;
    const checks = [
      ["Account", true], ["Plan chosen", Boolean(order)], ["Plan activated", subscription?.accessStatus === "enabled"],
      ["Payment confirmed", referral.qualified], ["Reward issued", referral.rewardIssued],
    ];
    byId("admin-referral-checklist").replaceChildren(...checks.map(([label, complete]) => {
      const item = document.createElement("span"); item.className = complete ? "is-complete" : "";
      item.textContent = `${complete ? "✓" : "○"} ${label}`; return item;
    }));
  }
  byId("admin-payment-date").value = todayText;
  byId("admin-payment-months").value = "1";
  byId("admin-payment-reference").value = "";
  byId("admin-payment-note").value = "";
  const assignedAddons = new Map((Array.isArray(data.billing.addons) ? data.billing.addons : [])
    .map((addon) => [addon.id, addon]));
  byId("admin-addons-summary").textContent = assignedAddons.size
    ? `${assignedAddons.size} assigned`
    : "None assigned";
  const availableAddons = Array.isArray(data.availableAddons) ? data.availableAddons : [];
  byId("admin-addons-list").replaceChildren(...availableAddons.map((addon, index) => {
    const assigned = assignedAddons.get(addon.id);
    const row = document.createElement("div");
    row.className = "pp-admin-addon-option";
    row.classList.toggle("is-selected", Boolean(assigned));
    row.setAttribute("role", "group");
    row.setAttribute("aria-labelledby", `admin-addon-name-${index}`);
    const header = document.createElement("label");
    header.className = "pp-admin-addon-heading";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = addon.id;
    checkbox.checked = Boolean(assigned);
    checkbox.dataset.addonId = addon.id;
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    name.id = `admin-addon-name-${index}`;
    name.textContent = addon.name;
    const description = document.createElement("small");
    description.textContent = addon.description;
    copy.append(name, description);
    header.append(checkbox, copy);
    const fields = document.createElement("div");
    fields.className = "pp-admin-addon-fields";
    const quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = "1";
    quantity.max = "99";
    quantity.step = "1";
    quantity.value = String(assigned?.quantity || 1);
    quantity.dataset.addonQuantity = addon.id;
    quantity.dataset.addonControl = "";
    quantity.setAttribute("aria-label", `${addon.name} quantity`);
    quantity.id = `admin-addon-quantity-${index}`;
    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Quantity";
    quantityLabel.append(quantity);
    const starts = document.createElement("input");
    starts.type = "date";
    starts.required = true;
    starts.value = dateInput(assigned?.startsAt) || todayText;
    starts.dataset.addonStarts = addon.id;
    starts.dataset.addonControl = "";
    starts.setAttribute("aria-label", `${addon.name} start date`);
    const startsLabel = document.createElement("label");
    startsLabel.textContent = "Starts";
    startsLabel.append(starts);
    const duration = document.createElement("select");
    duration.dataset.addonDuration = addon.id;
    duration.dataset.addonControl = "";
    duration.setAttribute("aria-label", `${addon.name} duration`);
    duration.replaceChildren(...Array.from({ length: 13 }, (_, months) => {
      const option = document.createElement("option");
      option.value = String(months);
      option.textContent = months === 0 ? "Ongoing" : `${months} month${months === 1 ? "" : "s"}`;
      return option;
    }));
    duration.value = String(assigned?.durationMonths ?? 0);
    const durationLabel = document.createElement("label");
    durationLabel.textContent = "Duration";
    durationLabel.append(duration);
    fields.append(quantityLabel, startsLabel, durationLabel);
    row.append(header, fields);
    return row;
  }));
  byId("admin-addons-form").hidden = availableAddons.length === 0;
  const noPaymentRequired = Number(tierSelect.selectedOptions[0]?.dataset.priceMinor) === 0;
  byId("admin-payment-description").textContent = noPaymentRequired
    ? "VIP access does not require a payment record."
    : "Choose the number of months paid. Everything else is optional.";
  refreshPaymentCoverage();
  refreshPaymentDetailsSummary();
  renderPaymentRows("admin-billing-payments", data.billing.payments, true);
  const paymentCount = data.billing.payments.filter((payment) => payment.status !== "void").length;
  byId("admin-payment-history-summary").textContent = paymentCount
    ? `${paymentCount} payment${paymentCount === 1 ? "" : "s"}`
    : "No payments recorded";
  byId("admin-billing-content").hidden = false;
  byId("admin-billing-editor").hidden = false;
  controls();
}

async function openAdminBilling(userId) {
  if (!user?.isAdmin || adminBillingBusy) return;
  adminBillingBusy = true;
  for (const id of ["admin-payment-details", "admin-plan-settings", "admin-addons-settings", "admin-payment-history"]) {
    byId(id).open = false;
  }
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
    await Promise.all([loadAdminUsers(), loadAdminReferrals()]);
  } catch (error) {
    adminBillingMessage(error.message, true);
  } finally {
    adminBillingBusy = false;
    controls();
  }
}

async function acceptUser(next) {
  renderUser(next);
  if (next) await Promise.all([loadBilling(), loadWatchTime(), loadRequests(), loadReferrals(),
    next.isAdmin ? loadAdminUsers() : Promise.resolve(), next.isAdmin ? loadAdminReferrals() : Promise.resolve()]);
  else await loadReferrals();
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
byId("billing-view-all").addEventListener("click", () => {
  memberPaymentsExpanded = !memberPaymentsExpanded;
  renderMemberPayments();
});
byId("referral-copy").addEventListener("click", async () => {
  const link = byId("referral-link").value;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(link);
    else { byId("referral-link").select(); document.execCommand("copy"); }
    byId("referral-copy").textContent = "Copied ✓";
    setTimeout(() => { byId("referral-copy").textContent = "Copy link"; }, 1800);
  } catch { byId("referral-status").textContent = "Could not copy automatically. Select the link and copy it manually."; }
});
byId("referral-share").addEventListener("click", async () => {
  const link = byId("referral-link").value;
  if (navigator.share) {
    try { await navigator.share({ title: "Join me on PlexPoint", text: "Use my PlexPoint referral link:", url: link }); }
    catch (error) { if (error.name !== "AbortError") byId("referral-status").textContent = "Sharing was unavailable. Copy the link instead."; }
  } else byId("referral-copy").click();
});
byId("referral-order-next").addEventListener("click", async () => {
  if (referralStep === 1 && !byId("referral-plan").reportValidity()) return;
  if (referralStep === 2 && !byId("referral-order-form").reportValidity()) return;
  if (referralStep === 1) { setReferralStep(2); return; }
  referralBusy = true;
  byId("referral-order-status").textContent = "Saving your order for review…";
  controls();
  try {
    const data = await request("referrals", { action: "save_order", tierId: byId("referral-plan").value,
      addons: selectedReferralAddons() }, "");
    renderReferrals(data);
    referralOrder = data.order;
    referralWhatsAppUrl = data.whatsappUrl;
    byId("referral-order-status").textContent = "Order saved. Check the details, then continue on WhatsApp.";
    setReferralStep(3);
  } catch (error) {
    byId("referral-order-status").textContent = error.message;
    byId("referral-order-status").dataset.error = "true";
  } finally { referralBusy = false; controls(); }
});
byId("referral-order-back").addEventListener("click", () => setReferralStep(referralStep - 1));
byId("referral-order-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (referralBusy || !event.currentTarget.reportValidity() || !referralWhatsAppUrl) return;
  window.open(referralWhatsAppUrl, "_blank", "noopener,noreferrer");
});
byId("requests-retry").addEventListener("click", () => void loadRequests());
byId("admin-users").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-user-id]");
  if (button) void openAdminBilling(button.dataset.userId);
});
byId("admin-referrals-list").addEventListener("click", (event) => {
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
  const price = Number(byId("admin-plan-tier").selectedOptions[0]?.dataset.priceMinor || 0);
  byId("admin-payment-description").textContent = price === 0
    ? "VIP access does not require a payment record."
    : "Choose the number of months paid. Everything else is optional.";
  controls();
});
byId("admin-payment-months").addEventListener("change", () => refreshPaymentCoverage());
byId("admin-payment-amount").addEventListener("input", refreshPaymentAction);
for (const id of ["admin-payment-date", "admin-payment-method", "admin-payment-reference", "admin-payment-note"]) {
  byId(id).addEventListener("input", refreshPaymentDetailsSummary);
  byId(id).addEventListener("change", refreshPaymentDetailsSummary);
}
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
    coverageMonths: Number(byId("admin-payment-months").value),
    receivedOn: byId("admin-payment-date").value,
    method: byId("admin-payment-method").value,
    reference: byId("admin-payment-reference").value,
    note: byId("admin-payment-note").value,
  }, "Recording payment and updating coverage…", "Payment recorded. The balance and next payment date have been updated.");
});
byId("admin-addons-list").addEventListener("change", (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  event.target.closest(".pp-admin-addon-option")?.classList.toggle("is-selected", event.target.checked);
  controls();
});
byId("admin-addons-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const addons = [...byId("admin-addons-list").querySelectorAll('input[type="checkbox"]:checked')].map((checkbox) => ({
    id: checkbox.dataset.addonId,
    quantity: Number(byId("admin-addons-list").querySelector(`[data-addon-quantity="${CSS.escape(checkbox.dataset.addonId)}"]`).value),
    startsOn: byId("admin-addons-list").querySelector(`[data-addon-starts="${CSS.escape(checkbox.dataset.addonId)}"]`).value,
    durationMonths: Number(byId("admin-addons-list").querySelector(`[data-addon-duration="${CSS.escape(checkbox.dataset.addonId)}"]`).value),
  }));
  void updateAdminBilling({ action: "save_addons", addons },
    "Saving account add-ons…", "Account add-ons saved.");
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
