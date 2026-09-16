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
  }
}

const dateText = (value) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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
    adminCell(row, account.subscription?.tier || "No plan", account.subscription?.status || "");
    const statusCell = document.createElement("td");
    const statusLabel = document.createElement("span");
    statusLabel.className = "pp-account-status";
    statusLabel.dataset.status = account.accountStatus;
    statusLabel.textContent = account.accountStatus;
    statusCell.append(statusLabel);
    row.append(statusCell);
    adminCell(row, dateText(account.createdAt));
    return row;
  });
  if (!rows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No user accounts were found.";
    row.append(cell);
    rows.push(row);
  }
  body.replaceChildren(...rows);
  byId("admin-total").textContent = String(data.summary?.total ?? data.users.length);
  byId("admin-enabled").textContent = String(data.summary?.enabled ?? data.users.filter((account) => account.accountStatus === "enabled").length);
  byId("admin-subscribed").textContent = String(data.summary?.subscribed ?? data.users.filter((account) => account.subscription).length);
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

async function acceptUser(next) {
  renderUser(next);
  if (next?.isAdmin) await loadAdminUsers();
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
    const response = await fetch(`/api/portal/${group}/${action}`, {
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
window.addEventListener("focus", () => void refreshSession());
window.addEventListener("pageshow", (event) => { if (event.persisted) void initializeSession(); });
void initializeSession();
