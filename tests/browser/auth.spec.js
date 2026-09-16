import { test, expect } from "@playwright/test";

const password = "A long local testing passphrase";
const email = () => `browser-${crypto.randomUUID()}@example.test`;

test("register, reload, sign out, and sign in against the real Pages worker and D1", async ({ page, context }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const address = email();
  await page.goto("/account/#account");
  await page.locator("#email-option > summary").click();
  await expect(page.locator("#auth-submit")).toBeEnabled();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await page.getByLabel("Display name", { exact: true }).fill("Local Movie Fan");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-user-name")).toHaveText("Local Movie Fan");
  await expect(page.locator("#auth-status")).toContainText("Your account is ready");
  const cookies = await context.cookies();
  const session = cookies.find((cookie) => cookie.name === "plexpoint_local_session");
  expect(session.httpOnly).toBe(true);
  expect(session.sameSite).toBe("Lax");
  expect(await page.evaluate(() => document.cookie)).not.toContain(session.value);
  const oldSession = session.value;
  await page.reload();
  await expect(page.locator("#auth-user-email")).toHaveText(address);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.locator("#auth-user")).toBeHidden();
  await expect(page.locator("#auth-status")).toHaveText("You have signed out.");
  const invalidated = await context.request.get("/api/portal/auth/session", { headers: { Cookie: `plexpoint_local_session=${oldSession}` } });
  expect((await invalidated.json()).user).toBeNull();
  await page.locator("#email-option > summary").click();
  await page.getByLabel("Email address", { exact: true }).fill(address.toUpperCase());
  await page.getByLabel("Password", { exact: true }).fill("the wrong password");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-status")).toHaveText("Email or password is incorrect.");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-user-email")).toHaveText(address);
  expect(errors).toEqual([]);
});

test("confirmation validation and keyboard password visibility work without submitting", async ({ page }) => {
  let submissions = 0;
  page.on("request", (req) => { if (req.url().endsWith("/auth/register")) submissions++; });
  await page.goto("/account/#account");
  await expect(page.locator("#auth-submit")).toBeEnabled();
  await page.locator("#email-option > summary").click();
  await page.locator("#auth-register-mode").click();
  await page.getByLabel("Display name", { exact: true }).fill("Test");
  await page.getByLabel("Email address", { exact: true }).fill(email());
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill("A different long passphrase");
  await page.locator("#auth-submit").click();
  expect(await page.locator("#auth-confirm").evaluate((input) => input.validationMessage)).toBe("Passwords do not match.");
  expect(submissions).toBe(0);
  await page.locator("#auth-show-password").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#auth-password")).toHaveAttribute("type", "text");
  await expect(page.locator("#auth-confirm")).toHaveAttribute("type", "text");
  await page.locator("#auth-login-mode").click();
  await expect(page.locator("#auth-password")).toHaveAttribute("type", "password");
  await expect(page.locator("#auth-password")).toHaveValue("");
  await expect(page.locator("#auth-confirm-field")).toBeHidden();
});

test("unavailable service offers retry and leaves public guides usable", async ({ page }) => {
  let unavailable = true;
  await page.route("**/api/portal/auth/session", (route) => unavailable
    ? route.fulfill({ status: 503, json: { message: "Account services are temporarily unavailable." } })
    : route.continue());
  await page.goto("/account/#account");
  await expect(page.locator("#auth-status")).toContainText("temporarily unavailable");
  await expect(page.locator("#auth-submit")).toBeDisabled();
  await page.locator("#help").scrollIntoViewIfNeeded();
  await expect(page.locator("#help-articles details")).toHaveCount(6);
  unavailable = false;
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.locator("#auth-submit")).toBeEnabled();
});

test("session refresh handles expiry and renders profile text without HTML", async ({ page }) => {
  let user = { id: "test", email: "test@example.test", displayName: '<img src=x onerror="alert(1)">', createdAt: Date.now() };
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user } }));
  await page.goto("/account/#account");
  await expect(page.locator("#auth-user-name")).toHaveText(user.displayName);
  await expect(page.locator("#auth-user-name img")).toHaveCount(0);
  user = null;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator("#auth-user")).toBeHidden();
  await expect(page.locator("#auth-status")).toContainText("Your session has ended");
  await expect(page.locator("#auth-user-email")).toHaveText("");
});

test("failed logout keeps the user informed instead of claiming success", async ({ page }) => {
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: { id: "test", email: "test@example.test", displayName: "Test", createdAt: Date.now() } } }));
  await page.route("**/api/portal/auth/logout", (route) => route.fulfill({ status: 503, json: { message: "Account services are temporarily unavailable." } }));
  await page.goto("/account/#account");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.locator("#auth-status")).toContainText("temporarily unavailable");
  await expect(page.locator("#auth-user")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeEnabled();
});

test("the owner account sees the user dashboard and Overseerr shortcuts", async ({ page }) => {
  const createdAt = Date.UTC(2026, 8, 16);
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "owner", email: "jacobnathan1718@gmail.com", displayName: "Jacob", createdAt, isAdmin: true,
  } } }));
  await page.route("**/api/portal/admin/users", (route) => route.fulfill({ json: {
    summary: { total: 2, enabled: 1, disabled: 1, subscribed: 1 },
    users: [
      { id: "owner", displayName: "Jacob", email: "jacobnathan1718@gmail.com", isAdmin: true, accountStatus: "enabled", createdAt, updatedAt: createdAt, signInMethods: ["Plex"], plexUsername: "JNathan34", subscription: null },
      { id: "member", displayName: "Movie Fan", email: "fan@example.test", isAdmin: false, accountStatus: "disabled", createdAt, updatedAt: createdAt, signInMethods: ["Email"], subscription: { tier: "Gold Tier", status: "enabled", startsAt: createdAt, endsAt: createdAt + 86400000 } },
    ],
  } }));
  await page.goto("/account/#account");
  await expect(page.locator("#admin-panel")).toBeVisible();
  await expect(page.locator("#admin-total")).toHaveText("2");
  await expect(page.locator("#admin-enabled")).toHaveText("1");
  await expect(page.locator("#admin-subscribed")).toHaveText("1");
  await expect(page.locator("#admin-users tr")).toHaveCount(2);
  await expect(page.locator("#admin-users")).toContainText("Movie Fan");
  await expect(page.locator("#admin-users")).toContainText("Gold Tier");
  await expect(page.getByText("Plex connected", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Request on Overseerr", exact: false })).toHaveAttribute("href", "https://request.plexpoint.uk/");
});

test("ordinary accounts never request or reveal the admin dashboard", async ({ page }) => {
  let adminRequests = 0;
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "member", email: "member@example.test", displayName: "Member", createdAt: Date.now(),
  } } }));
  await page.route("**/api/portal/admin/users", (route) => { adminRequests++; return route.abort(); });
  await page.goto("/account/#account");
  await expect(page.locator("#auth-user-name")).toHaveText("Member");
  await expect(page.locator("#admin-panel")).toBeHidden();
  expect(adminRequests).toBe(0);
});

test("members can see their plan, payment due state and confirmed payment history", async ({ page }) => {
  const start = Date.UTC(2026, 7, 1);
  const due = Date.UTC(2026, 8, 1);
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "member", email: "member@example.test", displayName: "Member", createdAt: start,
  } } }));
  await page.route("**/api/portal/billing", (route) => route.fulfill({ json: { billing: {
    subscription: { id: "sub", tierId: "gold", tier: "Gold Tier", accessStatus: "enabled", startsAt: start, endsAt: due, monthlyPriceMinor: 500, currency: "GBP" },
    currentPeriod: { id: "period", tierId: "gold", tier: "Gold Tier", startsAt: start, endsAt: due, amountDueMinor: 500, currency: "GBP", status: "open", confirmedMinor: 200, pendingMinor: 0, outstandingMinor: 300, creditMinor: 0, paymentStatus: "overdue" },
    lastPayment: { id: "payment", amountMinor: 200, currency: "GBP", status: "confirmed", method: "bank_transfer", receivedAt: start + 86400000, reference: null, periodStartsAt: start, periodEndsAt: due },
    payments: [{ id: "payment", amountMinor: 200, currency: "GBP", status: "confirmed", method: "bank_transfer", receivedAt: start + 86400000, reference: null, periodStartsAt: start, periodEndsAt: due }],
  } } }));
  await page.goto("/account/#account");
  await expect(page.locator("#billing-panel")).toBeVisible();
  await expect(page.locator("#billing-plan")).toHaveText("Gold Tier");
  await expect(page.locator("#billing-state")).toHaveText("Overdue");
  await expect(page.locator("#billing-balance")).toContainText("£3.00 outstanding");
  await expect(page.locator("#billing-payments tr")).toHaveCount(1);
  await expect(page.locator("#overview-plan")).toHaveText("Gold Tier");
  await expect(page.locator("#overview-payment")).toHaveText("Overdue");
  await expect(page.locator("#profile-plan")).toHaveText("Gold Tier");
  await expect(page.locator("#profile-payment-state")).toHaveText("Overdue");
  await expect(page.locator("#profile-access")).toHaveText("Enabled");
});

test("the owner can edit a member plan and record a payment", async ({ page }) => {
  const createdAt = Date.UTC(2026, 8, 16);
  let planSaved = false;
  let paymentRecorded = false;
  const billing = {
    subscription: null, currentPeriod: null, lastPayment: null, payments: [],
  };
  const detail = () => ({
    account: { id: "member", displayName: "Movie Fan", email: "fan@example.test", accountStatus: "enabled" },
    tiers: [{ id: "gold", name: "Gold Tier", monthlyPriceMinor: 500, currency: "GBP" }], billing,
  });
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "owner", email: "jacobnathan1718@gmail.com", displayName: "Jacob", createdAt, isAdmin: true,
  } } }));
  await page.route("**/api/portal/admin/users", (route) => route.fulfill({ json: {
    summary: { total: 1, enabled: 1, disabled: 0, subscribed: planSaved ? 1 : 0 },
    users: [{ id: "member", displayName: "Movie Fan", email: "fan@example.test", accountStatus: "enabled", createdAt, signInMethods: ["Plex"], subscription: planSaved ? { tier: "Gold Tier", status: "enabled", startsAt: createdAt, endsAt: createdAt + 2592000000 } : null, billing: null }],
  } }));
  await page.route("**/api/portal/admin/billing**", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: detail() });
    const body = route.request().postDataJSON();
    if (body.action === "save_plan") {
      planSaved = true;
      billing.subscription = { id: "sub", tierId: "gold", tier: "Gold Tier", accessStatus: "enabled", startsAt: Date.parse(`${body.startsOn}T00:00:00Z`), endsAt: Date.parse(`${body.nextDueOn}T00:00:00Z`), monthlyPriceMinor: 500, currency: "GBP" };
      billing.currentPeriod = { id: "period", ...billing.subscription, amountDueMinor: 500, confirmedMinor: 0, pendingMinor: 0, outstandingMinor: 500, creditMinor: 0, status: "open", paymentStatus: "unpaid" };
    } else if (body.action === "record_payment") {
      paymentRecorded = true;
      billing.currentPeriod.outstandingMinor = 0;
      billing.currentPeriod.confirmedMinor = body.amountMinor;
      billing.currentPeriod.paymentStatus = "paid";
      billing.payments = [{ id: "pay", amountMinor: body.amountMinor, currency: "GBP", status: "confirmed", method: body.method, receivedAt: Date.parse(`${body.receivedOn}T00:00:00Z`), reference: body.reference || null, periodStartsAt: billing.subscription.startsAt, periodEndsAt: billing.subscription.endsAt }];
      billing.lastPayment = billing.payments[0];
    }
    return route.fulfill({ json: detail() });
  });
  await page.goto("/account/#account");
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.locator("#admin-billing-editor")).toBeVisible();
  await page.locator("#admin-plan-access").selectOption("enabled");
  await page.locator("#admin-plan-start").fill("2026-09-01");
  await page.locator("#admin-plan-due").fill("2026-10-01");
  await page.getByRole("button", { name: "Save plan and dates" }).click();
  await expect(page.locator("#admin-billing-status")).toHaveText("Plan and billing dates saved.");
  expect(planSaved).toBe(true);
  await page.locator("#admin-payment-amount").fill("5.00");
  await page.locator("#admin-payment-date").fill("2026-09-16");
  await page.getByRole("button", { name: "Record payment" }).click();
  await expect(page.locator("#admin-billing-status")).toContainText("Payment recorded");
  expect(paymentRecorded).toBe(true);
  await expect(page.locator("#admin-billing-payments")).toContainText("£5.00");
});

test("viewing activity shares one period across popular titles and personal watch time", async ({ page }) => {
  const ranges = [];
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "viewer", email: "viewer@example.test", displayName: "Viewer", createdAt: Date.now(),
  } } }));
  await page.route("**/api/portal/activity?**", (route) => {
    const range = new URL(route.request().url()).searchParams.get("range");
    ranges.push(range);
    const allTime = range === "0";
    return route.fulfill({ json: {
      range,
      periodLabel: allTime ? "All time" : "Last 7 days",
      popularMovies: [{ title: allTime ? "All-time Movie" : "Weekly Movie", year: 2026, plays: 12, viewers: 5 }],
      popularShows: [{ title: allTime ? "All-time Show" : "Weekly Show", year: 2025, plays: 8, viewers: 3 }],
      watchTime: { seconds: allTime ? 90000 : 7384, plays: allTime ? 40 : 4 },
    } });
  });
  await page.goto("/account/#account");
  await expect(page.locator("#activity-panel")).toBeVisible();
  await expect(page.locator("#activity-watch-time")).toHaveText("2h 3m");
  await expect(page.locator("#popular-movies")).toContainText("Weekly Movie");
  await expect(page.locator("#popular-shows")).toContainText("Weekly Show");
  await page.getByRole("button", { name: "All time", exact: true }).click();
  await expect(page.locator("#activity-watch-time")).toHaveText("25h");
  await expect(page.locator("#popular-movies")).toContainText("All-time Movie");
  await expect(page.locator("#popular-shows")).toContainText("All-time Show");
  await expect(page.getByRole("button", { name: "All time", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(ranges).toEqual(["7", "0"]);
});
