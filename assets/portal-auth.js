const byId = (id) => document.getElementById(id);
const form = byId("auth-form");
const password = byId("auth-password");
const confirm = byId("auth-confirm");
const status = byId("auth-status");
let mode = "login";
let user = null;
let busy = false;
let available = false;
let plexPending = false;
let adminBusy = false;
let activityBusy = false;
let billingBusy = false;
let adminBillingBusy = false;
let adminBillingData = null;
let activityRange = "7";
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
  byId("auth-fields").disabled = busy || !available || plexPending;
  for (const id of ["auth-login-mode", "auth-register-mode", "auth-logout"]) byId(id).disabled = busy || plexPending;
  for (const id of ["auth-retry", "plex-check", "plex-cancel"]) byId(id).disabled = busy;
  byId("plex-sign-in").disabled = busy || !available || plexPending;
  byId("admin-retry").disabled = adminBusy;
  byId("activity-retry").disabled = activityBusy;
  byId("billing-retry").disabled = billingBusy;
  for (const formId of ["admin-plan-form", "admin-payment-form"]) {
    const editorForm = byId(formId);
    for (const control of editorForm.elements) control.disabled = adminBillingBusy;
    editorForm.setAttribute("aria-busy", String(adminBillingBusy));
  }
  byId("admin-payment-save").disabled = adminBillingBusy || !adminBillingData?.billing?.subscription;
  for (const button of byId("admin-users").querySelectorAll("button")) button.disabled = adminBillingBusy;
  for (const button of byId("admin-billing-payments").querySelectorAll("button")) button.disabled = adminBillingBusy;
  for (const button of byId("activity-range").querySelectorAll("button")) button.disabled = activityBusy || !user;
  byId("plex-pending").hidden = !plexPending;
  form.setAttribute("aria-busy", String(busy));
  byId("auth-submit").textContent = busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in";
}

function clearPasswords() {
  password.value = "";
  confirm.value = "";
  confirm.setCustomValidity("");
  password.type = confirm.type = "password";
  byId("auth-show-password").textContent = "Show password";
  byId("auth-show-password").setAttribute("aria-pressed", "false");
}

function renderUser(next) {
  if (user?.id !== next?.id) clearPasswords();
  user = next;
  if (user) byId("email-option").open = false;
  byId("auth-guest").hidden = Boolean(user);
  byId("auth-user").hidden = !user;
  byId("account-link").textContent = user ? "My account" : "Sign in";
  byId("activity-panel").hidden = !user;
  byId("billing-panel").hidden = !user;
  byId("admin-panel").hidden = !user?.isAdmin;
  if (user) {
    byId("auth-user-name").textContent = user.displayName;
    byId("auth-user-email").textContent = user.email;
    byId("auth-user-since").textContent = `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
  } else {
    for (const id of ["auth-user-name", "auth-user-email", "auth-user-since"]) byId(id).textContent = "";
    byId("admin-users").replaceChildren();
    byId("admin-table-wrap").hidden = true;
    byId("admin-status").textContent = "";
    byId("admin-billing-editor").hidden = true;
    byId("admin-billing-content").hidden = true;
    byId("admin-billing-status").textContent = "";
    adminBillingData = null;
    byId("activity-results").hidden = true;
    byId("activity-status").textContent = "";
    byId("popular-movies").replaceChildren();
    byId("popular-shows").replaceChildren();
    byId("overview-watch-time").textContent = "Sign in to view";
    byId("overview-watch-time-note").textContent = "Your selected activity period appears here.";
    byId("billing-results").hidden = true;
    byId("billing-status").textContent = "";
    byId("billing-payments").replaceChildren();
    byId("billing-state").textContent = "No plan";
    byId("billing-state").dataset.status = "none";
    byId("overview-plan").textContent = "Sign in to view";
    byId("overview-plan-note").textContent = "Your current plan and access status appear here.";
    byId("overview-renewal").textContent = "Sign in to view";
    byId("overview-renewal-note").textContent = "See when your next payment is due.";
    byId("overview-payment").textContent = "Sign in to view";
    byId("overview-payment-note").textContent = "Your latest confirmed payment appears here.";
  }
}

function durationText(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  if (total < 3600) return `${Math.floor(total / 60)}m`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
}

function renderPopular(target, items) {
  const rows = items.map((item, index) => {
    const row = document.createElement("li");
    const rank = document.createElement("span");
    rank.className = "pp-popular-rank";
    rank.textContent = String(index + 1).padStart(2, "0");
    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    details.append(title);
    if (item.year) {
      const year = document.createElement("small");
      year.textContent = String(item.year);
      details.append(year);
    }
    const metric = document.createElement("small");
    metric.textContent = item.viewers ? `${item.viewers} viewer${item.viewers === 1 ? "" : "s"}` : `${item.plays} play${item.plays === 1 ? "" : "s"}`;
    row.append(rank, details, metric);
    return row;
  });
  if (!rows.length) {
    const empty = document.createElement("li");
    empty.className = "pp-popular-empty";
    empty.textContent = "Nothing watched in this period yet.";
    rows.push(empty);
  }
  byId(target).replaceChildren(...rows);
}

function renderActivity(data) {
  if (!Array.isArray(data?.popularMovies) || !Array.isArray(data?.popularShows) || typeof data.periodLabel !== "string") {
    throw new Error("Viewing activity returned an unexpected response.");
  }
  renderPopular("popular-movies", data.popularMovies);
  renderPopular("popular-shows", data.popularShows);
  const hasWatchTime = data.watchTime && Number.isFinite(Number(data.watchTime.seconds));
  const watchText = hasWatchTime ? durationText(data.watchTime.seconds) : "Not linked";
  const watchNote = hasWatchTime
    ? `${data.watchTime.plays} play${data.watchTime.plays === 1 ? "" : "s"} · ${data.periodLabel}`
    : "Personal watch time is not linked to this account.";
  byId("activity-watch-time").textContent = watchText;
  byId("activity-watch-count").textContent = watchNote;
  byId("overview-watch-time").textContent = watchText;
  byId("overview-watch-time-note").textContent = hasWatchTime ? data.periodLabel : watchNote;
  byId("activity-status").textContent = hasWatchTime ? "" : watchNote;
  byId("activity-status").dataset.error = "false";
  byId("activity-results").hidden = false;
}

async function loadActivity(range = activityRange) {
  if (!user || activityBusy || !["1", "7", "30", "0"].includes(range)) return;
  activityRange = range;
  for (const button of byId("activity-range").querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.range === activityRange));
  }
  const userId = user.id;
  activityBusy = true;
  byId("activity-panel").setAttribute("aria-busy", "true");
  byId("activity-status").textContent = "Loading viewing activity…";
  byId("activity-status").dataset.error = "false";
  byId("activity-retry").hidden = true;
  controls();
  try {
    const data = await request(`activity?range=${encodeURIComponent(activityRange)}`, undefined, "");
    if (user?.id === userId) renderActivity(data);
  } catch (error) {
    if (user?.id === userId) {
      byId("activity-results").hidden = true;
      byId("activity-status").textContent = error.message;
      byId("activity-status").dataset.error = "true";
      byId("activity-retry").hidden = false;
      byId("overview-watch-time").textContent = "Unavailable";
      byId("overview-watch-time-note").textContent = "Viewing activity could not be loaded.";
    }
  } finally {
    activityBusy = false;
    byId("activity-panel").setAttribute("aria-busy", "false");
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
    tableTextCell(row, moneyText(payment.amountMinor, payment.currency));
    tableTextCell(row, methodLabels[payment.method] || payment.method);
    if (admin) tableTextCell(row, payment.reference || "—");
    else tableTextCell(row, `${dateText(payment.periodStartsAt)} – ${dateText(payment.periodEndsAt)}`);
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
    cell.colSpan = admin ? 6 : 5;
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
  const state = byId("billing-state");
  state.textContent = paymentLabel;
  state.dataset.status = paymentStatus;
  byId("billing-plan").textContent = subscription?.tier || "No plan assigned";
  byId("billing-access").textContent = subscription ? (accessLabels[subscription.accessStatus] || subscription.accessStatus) : "Contact Jacob to choose a plan";
  byId("billing-last-paid").textContent = billing.lastPayment ? dateText(billing.lastPayment.receivedAt) : "No payment recorded";
  byId("billing-last-amount").textContent = billing.lastPayment
    ? `${moneyText(billing.lastPayment.amountMinor, billing.lastPayment.currency)} · ${methodLabels[billing.lastPayment.method] || billing.lastPayment.method}` : "—";
  byId("billing-next-due").textContent = period ? dateText(period.endsAt) : "Not scheduled";
  byId("billing-balance").textContent = period
    ? period.creditMinor > 0 ? `${moneyText(period.creditMinor, period.currency)} credit`
      : `${moneyText(period.outstandingMinor, period.currency)} outstanding` : "No active billing period";
  renderPaymentRows("billing-payments", billing.payments.filter((payment) => payment.status !== "void"));
  byId("billing-results").hidden = false;

  byId("overview-plan").textContent = subscription?.tier || "No plan";
  byId("overview-plan-note").textContent = subscription ? (accessLabels[subscription.accessStatus] || subscription.accessStatus) : "No membership has been assigned yet.";
  byId("overview-renewal").textContent = period ? dateText(period.endsAt) : "Not scheduled";
  if (period) {
    const days = Math.ceil((period.endsAt - Date.now()) / 86_400_000);
    byId("overview-renewal-note").textContent = days < 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} past due`
      : days === 0 ? "Due today" : `Due in ${days} day${days === 1 ? "" : "s"}`;
  } else byId("overview-renewal-note").textContent = "No payment date has been set.";
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

function renderAdminUsers(data) {
  if (!Array.isArray(data?.users)) throw new Error("The user list returned an unexpected response.");
  const body = byId("admin-users");
  const rows = data.users.map((account) => {
    const row = document.createElement("tr");
    const userCell = adminCell(row, account.displayName || "Unnamed account", account.email);
    if (account.isAdmin) {
      const badge = document.createElement("span");
      badge.className = "pp-admin-role";
      badge.textContent = "ADMIN";
      userCell.strong.append(badge);
    }
    adminCell(row, account.signInMethods?.join(" + ") || "Not linked", account.plexUsername ? `Plex: ${account.plexUsername}` : "");
    adminCell(row, account.subscription?.tier || "No plan", account.subscription ? (accessLabels[account.subscription.status] || account.subscription.status) : "");
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
  if (next) await Promise.all([loadBilling(), loadActivity(), next.isAdmin ? loadAdminUsers() : Promise.resolve()]);
}

function setMode(value) {
  mode = value;
  const registering = mode === "register";
  byId("auth-name-field").hidden = !registering;
  byId("auth-confirm-field").hidden = !registering;
  byId("auth-name").required = registering;
  confirm.required = registering;
  password.minLength = registering ? 15 : 1;
  password.autocomplete = registering ? "new-password" : "current-password";
  byId("auth-heading").textContent = registering ? "Your account starts here." : "Welcome back.";
  byId("auth-password-hint").textContent = registering
    ? "Use 15–128 characters. A long, unique passphrase works well."
    : "Enter the password for your My PlexPoint account.";
  byId("auth-login-mode").setAttribute("aria-pressed", String(!registering));
  byId("auth-register-mode").setAttribute("aria-pressed", String(registering));
  clearPasswords();
  if (available) message("");
  controls();
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

byId("auth-login-mode").addEventListener("click", () => setMode("login"));
byId("auth-register-mode").addEventListener("click", () => setMode("register"));
byId("auth-show-password").addEventListener("click", () => {
  const show = password.type === "password";
  password.type = confirm.type = show ? "text" : "password";
  byId("auth-show-password").textContent = show ? "Hide password" : "Show password";
  byId("auth-show-password").setAttribute("aria-pressed", String(show));
});
form.addEventListener("input", () => confirm.setCustomValidity(""));
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !available) return;
  confirm.setCustomValidity(mode === "register" && password.value !== confirm.value ? "Passwords do not match." : "");
  if (!form.reportValidity()) return;
  const body = { email: byId("auth-email").value, password: password.value };
  if (mode === "register") body.displayName = byId("auth-name").value;
  busy = true;
  controls();
  message(mode === "register" ? "Creating your account…" : "Signing in…");
  try {
    await acceptUser(await request(mode, body));
    clearPasswords();
    message(mode === "register" ? "Your account is ready. You are signed in." : "Welcome back. You are signed in.", false, true);
    channel?.postMessage("session-changed");
  } catch (error) {
    clearPasswords();
    message(error.message, true, true);
  } finally { busy = false; controls(); }
});
byId("auth-logout").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  controls();
  try {
    await request("logout", {});
    renderUser(null);
    form.reset();
    setMode("login");
    message("You have signed out.", false, true);
    channel?.postMessage("session-changed");
  } catch (error) { message(error.message, true, true); }
  finally { busy = false; controls(); }
});
async function startPlex() {
  if (busy || !available || plexPending) return;
  busy = true;
  clearPasswords();
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
      clearPasswords();
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
    message("Plex sign-in cancelled. You can start again or use your portal email.", false, true);
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
byId("activity-retry").addEventListener("click", () => void loadActivity());
byId("activity-range").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-range]");
  if (button) void loadActivity(button.dataset.range);
});
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
