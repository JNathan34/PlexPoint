const state = { users: [], selectedId: null, detail: null };

const $ = (selector) => document.querySelector(selector);
const today = () => new Date().toISOString().slice(0, 10);
const dateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : "";
const money = (minor, currency = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(Number(minor || 0) / 100);
const dateText = (value) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value)) : "—";

function message(text, error = false) {
  const notice = $("#notice");
  notice.textContent = text;
  notice.classList.toggle("error", error);
}

async function request(path, body) {
  const response = await fetch(`/api/portal/admin/${path}`, {
    method: body ? "POST" : "GET", credentials: "same-origin", cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json", "X-PlexPoint-Request": "1" }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || "PlexPoint billing is unavailable."), { status: response.status });
  return data;
}

function renderSummary(summary = {}) {
  $("#totalUsers").textContent = String(summary.total || 0);
  $("#subscribedUsers").textContent = String(summary.subscribed || 0);
  $("#overdueUsers").textContent = String(summary.overdue || 0);
}

function renderUsers() {
  const filter = $("#search").value.trim().toLowerCase();
  const list = $("#userList");
  const users = state.users.filter((user) => [user.displayName, user.email, user.plexUsername].filter(Boolean)
    .some((value) => value.toLowerCase().includes(filter)));
  list.replaceChildren(...users.map((user) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `user${user.id === state.selectedId ? " selected" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(user.displayName)}</strong><span>${escapeHtml(user.plexUsername || user.email)} · ${escapeHtml(user.subscription?.tier || "No plan")}</span>`;
    button.addEventListener("click", () => selectUser(user.id));
    return button;
  }));
  if (!users.length) list.innerHTML = "<p>No users found.</p>";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function renderDetail() {
  const detail = state.detail;
  $("#emptyDetail").classList.toggle("hidden", Boolean(detail));
  $("#userDetail").classList.toggle("hidden", !detail);
  if (!detail) return;
  const { account, billing, tiers } = detail;
  const subscription = billing.subscription;
  const period = billing.currentPeriod;
  $("#detailName").textContent = account.displayName;
  $("#detailEmail").textContent = account.email;
  $("#detailStatus").textContent = period?.paymentStatus || subscription?.accessStatus || "No plan";
  $("#currentPlan").textContent = subscription ? `${subscription.tier} · ${money(subscription.monthlyPriceMinor, subscription.currency)} / month` : "Not assigned";
  $("#currentDue").textContent = subscription?.endsAt ? `Due ${dateText(subscription.endsAt)}` : "No payment date set";
  $("#tier").replaceChildren(...tiers.map((tier) => {
    const option = document.createElement("option");
    option.value = tier.id;
    option.textContent = `${tier.name} — ${money(tier.monthlyPriceMinor, tier.currency)} / month`;
    option.selected = tier.id === subscription?.tierId;
    return option;
  }));
  $("#access").value = subscription?.accessStatus || "enabled";
  $("#startsOn").value = dateInput(subscription?.startsAt) || today();
  $("#nextDueOn").value = dateInput(subscription?.endsAt) || today();
  const history = $("#paymentHistory");
  history.replaceChildren(...(billing.payments || []).filter((payment) => payment.status !== "void").slice(0, 8).map((payment) => {
    const row = document.createElement("div");
    row.className = "payment";
    row.innerHTML = `<div><strong>${escapeHtml(payment.tier || subscription?.tier || "Payment")}</strong><br><small>${dateText(payment.receivedAt)} · ${escapeHtml(payment.method || "manual")}</small></div><strong>${money(payment.amountMinor, payment.currency)}</strong>`;
    return row;
  }));
  if (!history.children.length) history.innerHTML = "<p>No payments recorded yet.</p>";
}

async function selectUser(id) {
  state.selectedId = id;
  state.detail = null;
  renderUsers(); renderDetail(); message("Loading customer billing…");
  try {
    state.detail = await request(`billing?userId=${encodeURIComponent(id)}`);
    message(""); renderDetail();
  } catch (error) { message(error.message, true); }
}

async function loadUsers() {
  message("Loading PlexPoint users…");
  try {
    const data = await request("users");
    state.users = data.users || [];
    renderSummary(data.summary); renderUsers();
    $("#signedOut").classList.add("hidden"); $("#manager").classList.remove("hidden"); message("");
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      $("#signedOut").classList.remove("hidden"); $("#manager").classList.add("hidden"); return;
    }
    message(error.message, true);
  }
}

async function submitPlan(event) {
  event.preventDefault();
  if (!state.detail) return;
  message("Saving membership…");
  try {
    state.detail = await request("billing", { action: "save_plan", userId: state.detail.account.id,
      tierId: $("#tier").value, accessStatus: $("#access").value, startsOn: $("#startsOn").value, nextDueOn: $("#nextDueOn").value });
    await loadUsers(); renderDetail(); message("Membership saved.");
  } catch (error) { message(error.message, true); }
}

async function submitPayment(event) {
  event.preventDefault();
  if (!state.detail) return;
  message("Recording payment…");
  try {
    state.detail = await request("billing", { action: "record_payment", userId: state.detail.account.id,
      amountMinor: Math.round(Number($("#amount").value) * 100), coverageMonths: Number($("#months").value), method: $("#method").value,
      receivedOn: $("#receivedOn").value, reference: $("#reference").value.trim() });
    $("#paymentForm").reset(); $("#receivedOn").value = today();
    await loadUsers(); renderDetail(); message("Payment recorded.");
  } catch (error) { message(error.message, true); }
}

$("#search").addEventListener("input", renderUsers);
$("#refresh").addEventListener("click", loadUsers);
$("#planForm").addEventListener("submit", submitPlan);
$("#paymentForm").addEventListener("submit", submitPayment);
$("#receivedOn").value = today();
loadUsers();
