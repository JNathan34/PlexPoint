import { test, expect } from "@playwright/test";

test("Plex is the only guest sign-in method", async ({ page }) => {
  await page.goto("/account/#account");
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeEnabled();
  await expect(page.locator("#email-option, #auth-form, #auth-email, #auth-password")).toHaveCount(0);
  await expect(page.locator(".pp-account-shortcuts")).toHaveCount(0);
  const footer = page.getByTestId("footer");
  await expect(footer).toContainText("Private streaming, cleanly managed.");
  await expect(footer).toContainText("Explore");
  await expect(footer).toContainText("Support");
  await expect(footer).toContainText("Independent private server. Not affiliated with Plex Inc.");
  await expect(footer.getByText("PlexPoint", { exact: true })).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.getByTestId("footer-free-trial-link")).toHaveAttribute("href", "https://wizarr.plexpoint.uk/j/FREE%20TRIAL");
});

test("unavailable account service offers retry while the main navigation stays usable", async ({ page }) => {
  let unavailable = true;
  await page.route("**/api/portal/auth/session", (route) => unavailable
    ? route.fulfill({ status: 503, json: { message: "Account services are temporarily unavailable." } })
    : route.continue());
  await page.goto("/account/#account");
  await expect(page.locator("#auth-status")).toContainText("temporarily unavailable");
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeDisabled();
  await expect(page.getByRole("navigation", { name: "Main website navigation" })).toBeVisible();
  unavailable = false;
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeEnabled();
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

test("the owner account sees the user dashboard with compact profile actions", async ({ page }) => {
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
  await expect(page.getByRole("link", { name: "Open Overseerr", exact: false })).toHaveCount(0);
  const profile = await page.locator(".pp-auth-card").boundingBox();
  const logout = await page.getByRole("button", { name: "Sign out", exact: true }).boundingBox();
  expect(logout.y).toBeLessThan(profile.y + profile.height / 2);
  expect(logout.x + logout.width).toBeLessThanOrEqual(profile.x + profile.width);
  await expect(page.getByRole("link", { name: /Manage membership|Billing history|Plex activity|Request on Overseerr/i })).toHaveCount(0);
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
  const start = Date.now() - 6 * 86400000;
  const due = Date.now() + 24 * 86400000;
  const payments = Array.from({ length: 5 }, (_, index) => ({
    id: `payment-${index}`, tierId: "gold", tier: "Gold Tier", amountMinor: 200, currency: "GBP",
    status: index === 1 ? "pending" : "confirmed", method: "bank_transfer", receivedAt: start + (5 - index) * 3600000,
    reference: null, periodStartsAt: start, periodEndsAt: due,
  }));
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "member", email: "member@example.test", displayName: "Member", createdAt: start,
  } } }));
  await page.route("**/api/portal/billing", (route) => route.fulfill({ json: { billing: {
    subscription: { id: "sub", tierId: "gold", tier: "Gold Tier", accessStatus: "enabled", startsAt: start, endsAt: due, monthlyPriceMinor: 500, currency: "GBP" },
    currentPeriod: { id: "period", tierId: "gold", tier: "Gold Tier", startsAt: start, endsAt: due, amountDueMinor: 500, currency: "GBP", status: "open", confirmedMinor: 200, pendingMinor: 0, outstandingMinor: 300, creditMinor: 0, paymentStatus: "overdue" },
    lastPayment: payments[0],
    payments,
    addons: [{ id: "extra-movie", name: "Extra Movie Request", description: "Adds 1 extra movie request.", quantity: 2 }],
  } } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/account/#account");
  await expect(page.locator("#billing-panel")).toBeVisible();
  await expect(page.locator("#billing-heading")).toHaveText("Recent payments");
  await expect(page.locator("#billing-panel")).not.toContainText("Your plan and payments");
  await expect(page.locator("#billing-summary, #billing-plan, #billing-state, #billing-balance")).toHaveCount(0);
  expect(await page.locator("#billing-history th").allTextContents()).toEqual(["Date", "Plan", "Amount", "Status"]);
  await expect(page.locator("#billing-payments tr")).toHaveCount(4);
  await expect(page.locator("#billing-view-all")).toBeVisible();
  await expect(page.locator("#billing-view-all")).toHaveText("View all →");
  await expect(page.locator("#billing-payments tr").first()).toContainText("Gold Tier");
  await expect(page.locator("#billing-payments tr").first()).toContainText("£2.00");
  await expect(page.locator("#billing-payments tr").first()).toContainText("Paid");
  await expect(page.locator("#billing-payments tr").nth(1)).toContainText("Not paid");
  await expect(page.locator("#billing-payments")).not.toContainText("Confirmed");
  await expect(page.locator("#overview-plan")).toHaveText("Gold Tier");
  await expect(page.locator("#overview-payment")).toHaveText("Overdue");
  await expect(page.locator("#profile-plan")).toHaveText("Gold Tier");
  await expect(page.locator("#profile-renewal")).toContainText("24 days left");
  await expect(page.locator("#profile-payment-state")).toHaveText("Overdue");
  await expect(page.locator("#profile-addons")).toBeVisible();
  await expect(page.locator("#profile-addon-list")).toHaveText("Extra Movie Request ×2");
  const columnOffsets = await page.locator("#billing-history").evaluate((history) => {
    const headings = [...history.querySelectorAll("th")];
    const cells = [...history.querySelectorAll("tbody tr:first-child td")];
    return headings.map((heading, index) => Math.abs(heading.getBoundingClientRect().left - cells[index].getBoundingClientRect().left));
  });
  expect(columnOffsets.every((offset) => offset < 1)).toBe(true);
  const tableStyle = await page.locator("#billing-history .pp-admin-table-wrap").evaluate((wrapper) => {
    const style = getComputedStyle(wrapper);
    return { borderTopWidth: style.borderTopWidth, borderRadius: style.borderRadius };
  });
  expect(tableStyle).toEqual({ borderTopWidth: "0px", borderRadius: "0px" });
  const planAlignment = await page.locator("#billing-history").evaluate((history) => ({
    heading: getComputedStyle(history.querySelector("th:nth-child(2)")).textAlign,
    value: getComputedStyle(history.querySelector("tbody td:nth-child(2)")).textAlign,
  }));
  expect(planAlignment).toEqual({ heading: "left", value: "left" });
  await expect(page.locator("#billing-history th").first()).toHaveCSS("border-top-left-radius", "10px");
  await expect(page.locator("#billing-history th").last()).toHaveCSS("border-top-right-radius", "10px");
  const panelHeights = await page.locator(".pp-dashboard-detail-grid").evaluate((grid) => ({
    payments: grid.querySelector("#billing-panel").getBoundingClientRect().height,
    requests: grid.querySelector("#requests-panel").getBoundingClientRect().height,
  }));
  expect(Math.abs(panelHeights.payments - panelHeights.requests)).toBeLessThan(1);
  await page.locator("#billing-view-all").click();
  await expect(page.locator("#billing-payments tr")).toHaveCount(5);
  await expect(page.locator("#billing-view-all")).toHaveText("Show latest 4 ↑");
  await page.locator("#billing-view-all").click();
  await expect(page.locator("#billing-payments tr")).toHaveCount(4);
  const iconStyles = await page.locator(".pp-metric > span svg").evaluateAll((icons) => icons.map((icon) => ({
    color: getComputedStyle(icon).color,
    strokeWidth: Number.parseFloat(getComputedStyle(icon).strokeWidth),
  })));
  expect(iconStyles.map((style) => style.color)).toEqual([
    "rgb(253, 224, 71)",
    "rgb(249, 115, 22)",
    "rgb(34, 197, 94)",
    "rgb(168, 85, 247)",
  ]);
  expect(iconStyles.every((style) => style.strokeWidth >= 2.2)).toBe(true);
  const cardAccents = await page.locator(".pp-metric").evaluateAll((cards) => cards.map((card) => {
    const style = getComputedStyle(card);
    return { border: style.borderTopColor, background: style.backgroundImage };
  }));
  expect(new Set(cardAccents.map((style) => style.border)).size).toBe(4);
  expect(new Set(cardAccents.map((style) => style.background)).size).toBe(4);
  await expect(page.locator(".pp-metric-plan")).toHaveAttribute("data-tier", "gold");
  await expect(page.locator("#profile-access, #auth-user-since")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Overseerr", exact: false })).toHaveCount(0);
});

test("profile styling and plan icons follow the member's current tier", async ({ page }) => {
  const start = Date.now() - 6 * 86400000;
  const due = Date.now() + 24 * 86400000;
  await page.goto("/");
  const membershipTierColor = await page.locator('[data-testid="membership-tier-platinum-tier"] svg').first()
    .evaluate((icon) => getComputedStyle(icon).color);

  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "platinum-member", email: "member@example.test", displayName: "Platinum Member", createdAt: start,
  } } }));
  await page.route("**/api/portal/billing", (route) => route.fulfill({ json: { billing: {
    subscription: { id: "sub", tierId: "platinum", tier: "Platinum Tier", accessStatus: "enabled", startsAt: start, endsAt: due, monthlyPriceMinor: 1500, currency: "GBP" },
    currentPeriod: { id: "period", tierId: "platinum", tier: "Platinum Tier", startsAt: start, endsAt: due, amountDueMinor: 1500, currency: "GBP", status: "open", confirmedMinor: 1500, pendingMinor: 0, outstandingMinor: 0, creditMinor: 0, paymentStatus: "paid" },
    lastPayment: null, payments: [], addons: [],
  } } }));
  await page.goto("/account/#account");
  await expect(page.locator("#profile-plan")).toHaveText("Platinum Tier");
  await expect(page.locator("#auth-user")).toHaveAttribute("data-tier", "platinum");
  await expect(page.locator("#profile-tier-icon")).toHaveAttribute("data-tier", "platinum");
  await expect(page.locator("#overview-tier-icon")).toHaveAttribute("data-tier", "platinum");
  await expect(page.locator("#profile-plan-note")).toBeHidden();
  await expect(page.locator("#overview-plan-note")).toBeHidden();
  await expect(page.locator("#auth-user")).not.toContainText("Access enabled");

  const tierPresentation = await page.evaluate(() => {
    const profileIcon = document.querySelector("#profile-tier-icon");
    const overviewIcon = document.querySelector("#overview-tier-icon");
    const profileBox = profileIcon.getBoundingClientRect();
    const overviewBox = overviewIcon.getBoundingClientRect();
    const avatarStyle = getComputedStyle(document.querySelector(".pp-profile-avatar"));
    const membershipStyle = getComputedStyle(document.querySelector(".pp-profile-membership"));
    return {
      profileIconColor: getComputedStyle(profileIcon).color,
      overviewIconColor: getComputedStyle(overviewIcon).color,
      profileIconPath: profileIcon.querySelector("path").getAttribute("d"),
      profileIconSize: [profileBox.width, profileBox.height],
      overviewIconSize: [overviewBox.width, overviewBox.height],
      avatarBorder: avatarStyle.borderTopColor,
      membershipBorder: membershipStyle.borderTopColor,
      membershipBackground: membershipStyle.backgroundImage,
    };
  });
  expect(tierPresentation.profileIconColor).toBe(membershipTierColor);
  expect(tierPresentation.overviewIconColor).toBe(membershipTierColor);
  expect(tierPresentation.profileIconPath).toBe("M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z");
  expect(tierPresentation.profileIconSize).toEqual([42, 42]);
  expect(tierPresentation.overviewIconSize).toEqual([30, 30]);
  expect(tierPresentation.avatarBorder).toContain("196, 181, 253");
  expect(tierPresentation.membershipBorder).toContain("196, 181, 253");
  expect(tierPresentation.membershipBackground).toContain("196, 181, 253");
});

test("VIP is presented as a grey no-payment membership", async ({ page }) => {
  const start = Date.now() - 86400000;
  const due = Date.now() + 365 * 86400000;
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "vip-member", email: "vip@example.test", displayName: "VIP Member", createdAt: start,
  } } }));
  await page.route("**/api/portal/billing", (route) => route.fulfill({ json: { billing: {
    subscription: { id: "sub", tierId: "vip", tier: "VIP", accessStatus: "enabled", startsAt: start, endsAt: due, monthlyPriceMinor: 0, currency: "GBP" },
    currentPeriod: { id: "period", tierId: "vip", tier: "VIP", startsAt: start, endsAt: due, amountDueMinor: 0, currency: "GBP", status: "open", confirmedMinor: 0, pendingMinor: 0, outstandingMinor: 0, creditMinor: 0, paymentStatus: "paid" },
    lastPayment: null, payments: [], addons: [],
  } } }));
  await page.goto("/account/#account");
  await expect(page.locator("#profile-plan")).toHaveText("VIP");
  await expect(page.locator("#profile-payment-state")).toHaveText("No payment required");
  await expect(page.locator("#profile-last-payment")).toHaveText("Not required");
  await expect(page.locator("#overview-payment-note")).toHaveText("VIP access does not require payment.");
  await expect(page.locator("#auth-user")).toHaveAttribute("data-tier", "vip");
  await expect(page.locator("#profile-tier-icon")).toHaveCSS("color", "rgb(148, 163, 184)");
});

test("the owner can edit a member plan and record a payment", async ({ page }) => {
  const createdAt = Date.UTC(2026, 8, 16);
  let planSaved = false;
  let paymentRecorded = false;
  let recordedPaymentBody = null;
  let addonsSaved = false;
  const billing = {
    subscription: null, currentPeriod: null, lastPayment: null, payments: [], addons: [],
  };
  const detail = () => ({
    account: { id: "member", displayName: "Movie Fan", email: "fan@example.test", accountStatus: "enabled" },
    tiers: [{ id: "gold", name: "Gold Tier", monthlyPriceMinor: 500, currency: "GBP" }],
    availableAddons: [{ id: "extra-movie", name: "Extra Movie Request", description: "Adds 1 extra movie request." }],
    billing,
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
      recordedPaymentBody = body;
      billing.currentPeriod.outstandingMinor = 0;
      billing.currentPeriod.confirmedMinor = body.amountMinor;
      billing.currentPeriod.paymentStatus = "paid";
      billing.payments = [{ id: "pay", tierId: "gold", tier: "Gold Tier", amountMinor: body.amountMinor, currency: "GBP", status: "confirmed", method: body.method, receivedAt: Date.parse(`${body.receivedOn}T00:00:00Z`), reference: body.reference || null, note: body.note || null, coverageMonths: body.coverageMonths, coverageStartsAt: billing.subscription.startsAt, coverageEndsAt: billing.subscription.endsAt, periodStartsAt: billing.subscription.startsAt, periodEndsAt: billing.subscription.endsAt }];
      billing.lastPayment = billing.payments[0];
    } else if (body.action === "save_addons") {
      addonsSaved = true;
      billing.addons = body.addons.map((addon) => ({ ...addon, name: "Extra Movie Request", description: "Adds 1 extra movie request." }));
    }
    return route.fulfill({ json: detail() });
  });
  await page.goto("/account/#account");
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.locator("#admin-billing-editor")).toBeVisible();
  await page.locator("#admin-plan-access").selectOption("enabled");
  await page.locator("#admin-plan-start").fill("2026-09-01");
  await page.locator("#admin-plan-due").fill("2026-10-01");
  await page.getByRole("button", { name: "Save membership settings" }).click();
  await expect(page.locator("#admin-billing-status")).toHaveText("Plan and billing dates saved.");
  expect(planSaved).toBe(true);
  await expect(page.locator("#admin-plan-settings")).not.toHaveAttribute("open", "");
  await page.locator("#admin-payment-amount").fill("5.00");
  await page.locator("#admin-payment-details > summary").click();
  await page.locator("#admin-payment-date").fill("2026-09-16");
  await page.locator("#admin-payment-months").selectOption("3");
  await page.locator("#admin-payment-amount").fill("15.00");
  await page.locator("#admin-payment-note").fill("Three months paid together");
  await page.locator("#admin-payment-save").click();
  await expect(page.locator("#admin-billing-status")).toContainText("Payment recorded");
  expect(paymentRecorded).toBe(true);
  expect(recordedPaymentBody.coverageMonths).toBe(3);
  expect(recordedPaymentBody.note).toBe("Three months paid together");
  await page.locator("#admin-payment-history > summary").click();
  await expect(page.locator("#admin-billing-payments")).toContainText("£15.00");
  await expect(page.locator("#admin-billing-payments")).toContainText("3 months");
  await page.locator("#admin-addons-settings > summary").click();
  await page.locator('#admin-addons-list input[type="checkbox"]').check();
  await page.getByLabel("Extra Movie Request quantity").fill("3");
  await page.getByLabel("Extra Movie Request duration").selectOption("2");
  await page.getByRole("button", { name: "Save add-ons" }).click();
  await expect(page.locator("#admin-billing-status")).toHaveText("Account add-ons saved.");
  expect(addonsSaved).toBe(true);
  await expect(page.getByLabel("Extra Movie Request quantity")).toHaveValue("3");
});

test("the viewing panel stays removed while the summary shows seven-day watch time", async ({ page }) => {
  let activityRequests = 0;
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "viewer", email: "viewer@example.test", displayName: "Viewer", createdAt: Date.now(),
  } } }));
  await page.route("**/api/portal/activity?**", (route) => {
    activityRequests++;
    return route.fulfill({ json: {
      range: "7", periodLabel: "Last 7 days", popularMovies: [], popularShows: [], watchTime: { seconds: 7384, plays: 4 },
    } });
  });
  await page.route("**/api/portal/requests", (route) => route.fulfill({ json: { requests: [] } }));
  await page.goto("/account/#account");
  await expect(page.locator("#activity-panel, #activity-range")).toHaveCount(0);
  await expect(page.getByText("What everyone’s watching", { exact: true })).toHaveCount(0);
  await expect(page.locator("#requests-panel")).toBeVisible();
  await expect(page.locator("#overview-watch-time")).toHaveText("2h 3m");
  await expect(page.locator("#overview-watch-time-note")).toHaveText("Last 7 days");
  await expect(page.locator("#overview-watch-time-note")).not.toContainText("plays");
  expect(activityRequests).toBe(1);
});

test("members can see recent Overseerr requests", async ({ page }) => {
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "viewer", email: "viewer@example.test", displayName: "Viewer", createdAt: Date.now(), avatarUrl: "/api/portal/avatar",
  } } }));
  const requests = Array.from({ length: 5 }, (_, index) => ({
    id: 12 + index, title: index === 0 ? "The Weekly Film" : `Request ${index + 1}`,
    type: "movie", year: 2026, requestedAt: Date.now() - index * 86400000,
    status: "processing", posterUrl: null,
  }));
  await page.route("**/api/portal/requests", (route) => route.fulfill({ json: { requests } }));
  await page.route("**/api/portal/activity?**", (route) => route.fulfill({ json: {
    range: "7", periodLabel: "Last 7 days", popularMovies: [], popularShows: [], watchTime: null,
  } }));
  await page.goto("/account/#account");
  await expect(page.locator("#requests-panel")).toBeVisible();
  await expect(page.locator("#recent-requests")).toContainText("The Weekly Film");
  await expect(page.locator("#recent-requests")).toContainText("Processing");
  await expect(page.locator("#recent-requests")).toContainText("Requested today");
  await expect(page.locator("#recent-requests .pp-request-item")).toHaveCount(4);
  await expect(page.locator("#recent-requests")).not.toContainText("Request 5");
  const requestStatus = page.locator(".pp-request-state").first();
  await expect(requestStatus).toHaveClass(/pp-billing-state/);
  const requestShape = await requestStatus.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      padding: style.padding,
      borderRadius: style.borderRadius,
      borderWidth: style.borderWidth,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      marker: getComputedStyle(element, "::before").content,
    };
  });
  expect(requestShape).toEqual({
    padding: "5px 10px", borderRadius: "999px", borderWidth: "1px",
    fontSize: "11px", fontWeight: "600", marker: "none",
  });
});
