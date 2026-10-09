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
  await page.route("**/api/portal/admin/referrals", (route) => route.fulfill({ json: { referrals: [{
    id: "referral-1", status: "completed", orderId: "PP-MOVIE-FAN", referralNumber: 1,
    referrer: { name: "Jacob", code: "JACOB-ABC123" }, referred: { id: "member", name: "Movie Fan" },
    tier: "Gold Tier", totalMinor: 500, currency: "GBP", reward: { movies: 2, seasons: 1 },
    createdAt, completedAt: createdAt,
  }] } }));
  await page.goto("/account/#account");
  await expect(page.locator("#admin-panel")).toBeVisible();
  await expect(page.locator("#admin-total")).toHaveText("2");
  await expect(page.locator("#admin-enabled")).toHaveText("1");
  await expect(page.locator("#admin-subscribed")).toHaveText("1");
  await expect(page.locator("#admin-users tr")).toHaveCount(2);
  await expect(page.locator("#admin-users")).toContainText("Movie Fan");
  await expect(page.locator("#admin-users")).toContainText("Gold Tier");
  await expect(page.locator("#admin-referrals")).toHaveAttribute("open", "");
  await expect(page.locator("#admin-referrals-completed")).toHaveText("1");
  await expect(page.locator("#admin-referrals-total")).toHaveText("1");
  await expect(page.locator("#admin-referrals-list tr")).toHaveCount(1);
  await expect(page.locator("#admin-referrals-list")).toContainText("Movie Fan");
  await expect(page.locator("#admin-referrals-list")).toContainText("Gold Tier");
  await expect(page.locator("#admin-referrals-list .pp-admin-user-identity")).toHaveCount(1);
  await expect(page.getByText("Plex connected", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Overseerr", exact: false })).toHaveCount(0);
  const profile = await page.locator(".pp-auth-card").boundingBox();
  const logout = await page.getByRole("button", { name: "Sign out", exact: true }).boundingBox();
  expect(logout.y).toBeLessThan(profile.y + profile.height / 2);
  expect(logout.x + logout.width).toBeLessThanOrEqual(profile.x + profile.width);
  await expect(page.getByRole("link", { name: /Manage membership|Billing history|Plex activity|Request on Overseerr/i })).toHaveCount(0);
});

test("the full account dashboard stays compact and scroll-free on a phone", async ({ page }) => {
  const createdAt = Date.UTC(2026, 8, 16);
  const due = createdAt + 30 * 86400000;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "owner", email: "jacobnathan1718@gmail.com", displayName: "Jacob", createdAt, isAdmin: true,
    plex: { username: "JNathan34" },
  } } }));
  await page.route("**/api/portal/billing", (route) => route.fulfill({ json: { billing: {
    subscription: { id: "sub", tierId: "platinum", tier: "Platinum Tier", accessStatus: "enabled", startsAt: createdAt, endsAt: due, monthlyPriceMinor: 500, currency: "GBP" },
    currentPeriod: { id: "period", tierId: "platinum", tier: "Platinum Tier", startsAt: createdAt, endsAt: due, amountDueMinor: 500, currency: "GBP", status: "open", confirmedMinor: 500, pendingMinor: 0, outstandingMinor: 0, creditMinor: 0, paymentStatus: "paid" },
    lastPayment: { id: "payment", tier: "Platinum Tier", amountMinor: 500, currency: "GBP", status: "confirmed", method: "bank_transfer", receivedAt: createdAt, coverageStartsAt: createdAt, coverageEndsAt: due },
    payments: [{ id: "payment", tier: "Platinum Tier", amountMinor: 500, currency: "GBP", status: "confirmed", method: "bank_transfer", receivedAt: createdAt, coverageStartsAt: createdAt, coverageEndsAt: due }],
    addons: [],
  } } }));
  await page.route("**/api/portal/activity?**", (route) => route.fulfill({ json: {
    range: "7", periodLabel: "Last 7 days", popularMovies: [], popularShows: [], watchTime: { seconds: 0, plays: 0 },
  } }));
  await page.route("**/api/portal/requests", (route) => route.fulfill({ json: { requests: [{
    id: 1, title: "A Recent Request", type: "movie", year: 2026, requestedAt: createdAt,
    status: "added", posterUrl: null,
  }] } }));
  await page.route("**/api/portal/referrals", (route) => route.fulfill({ json: {
    landing: null,
    dashboard: { code: "JACOB-ABC123", link: "https://plexpoint.uk/join/JACOB-ABC123", completed: 1, maximum: 5,
      totals: { seasons: 1, movies: 2 }, available: { seasons: 1, movies: 2 }, currentMonth: "2026-09",
      nextReward: { number: 2, seasons: 1, movies: 2 },
      rewards: Array.from({ length: 5 }, (_, index) => ({ number: index + 1, seasons: 1, movies: 2 })), referrals: [] },
    inbound: null, plans: [], addons: [],
  } }));
  await page.route("**/api/portal/admin/users", (route) => route.fulfill({ json: {
    summary: { total: 2, enabled: 2, subscribed: 1, overdue: 0 },
    users: [
      { id: "owner", displayName: "Jacob", email: "jacobnathan1718@gmail.com", isAdmin: true, accountStatus: "enabled", createdAt, updatedAt: createdAt, signInMethods: ["Plex"], plexUsername: "JNathan34", subscription: { tier: "Platinum Tier", status: "enabled" }, billing: { status: "paid", outstandingMinor: 0, currency: "GBP", nextDueAt: due } },
      { id: "member", displayName: "Movie Fan", email: "fan@example.test", isAdmin: false, accountStatus: "enabled", createdAt, updatedAt: createdAt, signInMethods: ["Plex"], subscription: null, billing: null },
    ],
  } }));
  await page.route("**/api/portal/admin/referrals", (route) => route.fulfill({ json: { referrals: [] } }));

  await page.goto("/account/#account");
  await expect(page.locator("#admin-users tr")).toHaveCount(2);
  await expect(page.locator("#billing-payments tr")).toHaveCount(1);
  await expect(page.locator("#referral-content")).toBeVisible();
  await expect(page.locator("#overview-watch-time")).toHaveText("0m");
  await expect(page.locator(".pp-metric-watch .pp-metric-period")).toHaveText("Last 7 days");
  await expect(page.locator(".pp-metric-watch .pp-metric-period")).toBeVisible();
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    tableOverflow: [...document.querySelectorAll(".pp-admin-table-wrap")]
      .filter((element) => !element.closest("[hidden]"))
      .map((element) => element.scrollWidth - element.clientWidth),
    metricRects: [...document.querySelectorAll(".pp-metric")].map((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
    avatarWidth: document.querySelector(".pp-profile-avatar").getBoundingClientRect().width,
    watchPeriod: (() => {
      const card = document.querySelector(".pp-metric-watch").getBoundingClientRect();
      const badge = document.querySelector(".pp-metric-watch .pp-metric-period").getBoundingClientRect();
      return { cardRight: card.right, badgeRight: badge.right, cardTop: card.top, badgeTop: badge.top };
    })(),
  }));
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.tableOverflow.every((overflow) => overflow <= 1)).toBe(true);
  expect(layout.metricRects).toHaveLength(4);
  expect(Math.abs(layout.metricRects[0].y - layout.metricRects[1].y)).toBeLessThan(1);
  expect(layout.metricRects[2].y).toBeGreaterThan(layout.metricRects[0].y);
  expect(layout.metricRects.every((rect) => rect.width < 190 && rect.height < 110)).toBe(true);
  expect(layout.avatarWidth).toBeLessThanOrEqual(56);
  expect(layout.watchPeriod.cardRight - layout.watchPeriod.badgeRight).toBeLessThanOrEqual(12);
  expect(layout.watchPeriod.badgeTop - layout.watchPeriod.cardTop).toBeLessThanOrEqual(12);
  await expect(page.locator("#billing-history .pp-admin-table")).toHaveCSS("min-width", "0px");
  await expect(page.locator("#admin-table-wrap .pp-admin-table")).toHaveCSS("min-width", "0px");
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

test("members can share a referral and review a referred friend order in three clear steps", async ({ page }) => {
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: {
    id: "friend", email: "friend@example.test", displayName: "New Friend", createdAt: Date.now(),
    plex: { username: "NewFriendPlex" },
  } } }));
  const referralFixture = {
    landing: null,
    dashboard: { code: "NEWFRIEND-123ABC", link: "https://plexpoint.uk/join/NEWFRIEND-123ABC",
      completed: 2, maximum: 5, totals: { seasons: 2, movies: 4 },
      available: { seasons: 2, movies: 4 }, currentMonth: "2026-09",
      nextReward: { number: 3, seasons: 2, movies: 2 },
      rewards: [{ number: 1, seasons: 1, movies: 2 }, { number: 2, seasons: 1, movies: 2 },
        { number: 3, seasons: 2, movies: 2 }, { number: 4, seasons: 1, movies: 2 }, { number: 5, seasons: 2, movies: 2 }],
      referrals: [{ id: "r1", status: "completed", member: "First Friend", createdAt: Date.now(), completedAt: Date.now(), referralNumber: 1, reward: { seasons: 1, movies: 2 }, orderId: "PP-FIRST" }],
    },
    inbound: { id: "inbound", status: "awaiting_payment", referredBy: { code: "JACOB-ABC123", displayName: "Jacob" },
      order: null, qualified: false, rewardIssued: false, referralNumber: null, reward: { seasons: 0, movies: 0 } },
    plans: [{ id: "gold", name: "Gold Tier", monthlyPriceMinor: 500, currency: "GBP" }],
    addons: [{ id: "extra-season", name: "Extra Season Request", description: "Adds a season request.", priceMinor: 100, currency: "GBP", billingLabel: "one-off" }],
  };
  let redeemedBody = null;
  await page.route("**/api/portal/referrals", (route) => {
    if (route.request().method() !== "POST") return route.fulfill({ json: referralFixture });
    const body = route.request().postDataJSON();
    if (body.action === "redeem_reward") {
      redeemedBody = body;
      return route.fulfill({ json: { ...referralFixture,
        dashboard: { ...referralFixture.dashboard, available: { movies: 1, seasons: 1 } },
        redeemed: { movies: 3, seasons: 1, month: "2026-09" },
      } });
    }
    return route.fulfill({ json: { ...referralFixture,
      inbound: { ...referralFixture.inbound, order: { id: "PP-REVIEW", tierId: "gold",
        addons: [{ id: "extra-season", name: "Extra Season Request", quantity: 2 }] } },
      order: { id: "PP-REVIEW" }, whatsappUrl: "https://wa.me/447481861478?text=review",
    } });
  });
  await page.goto("/account/#account");
  await expect(page.locator("#referral-panel")).toBeVisible();
  await expect(page.locator("#referral-link")).toHaveValue("https://plexpoint.uk/join/NEWFRIEND-123ABC");
  await expect(page.locator("#referral-progress-count")).toHaveText("2/5");
  await expect(page.locator("#referral-progress-track")).toHaveAttribute("aria-valuenow", "2");
  const referralProgressWidth = await page.locator("#referral-progress-track").evaluate((track) => {
    const fill = track.querySelector("span");
    return fill.getBoundingClientRect().width / track.getBoundingClientRect().width;
  });
  expect(referralProgressWidth).toBeCloseTo(.4, 2);
  await expect(page.locator("#referral-season-total")).toHaveText("2");
  await expect(page.locator("#referral-movie-total")).toHaveText("4");
  await expect(page.locator("#referral-movie-available")).toHaveText("4 available");
  await expect(page.locator("#referral-season-available")).toHaveText("2 available");
  await expect(page.locator("#referral-redeem-status")).toContainText("added directly");
  await expect(page.locator("#referral-heading")).toHaveText("Invite friends to PlexPoint");
  await expect(page.locator("#referral-how-heading")).toHaveCount(0);
  await expect(page.locator(".pp-referral-share .pp-referral-how")).toHaveCount(1);
  await expect(page.locator(".pp-referral-how li")).toHaveCount(4);
  const referralIconEffects = await page.locator(".pp-referral-icon, .pp-referral-heading-icon, .pp-referral-stat-icon").evaluateAll((icons) => icons.map((icon) => {
    const style = getComputedStyle(icon);
    const glyphStyle = getComputedStyle(icon.querySelector(".pp-icon"));
    return {
      boxShadow: style.boxShadow, filter: style.filter, textShadow: style.textShadow, glyphFilter: glyphStyle.filter,
      borderTopWidth: style.borderTopWidth, backgroundImage: style.backgroundImage, backgroundColor: style.backgroundColor,
    };
  }));
  expect(referralIconEffects.every((effect) => effect.boxShadow === "none" && effect.filter === "none"
    && effect.textShadow === "none" && effect.glyphFilter === "none" && effect.borderTopWidth === "0px"
    && effect.backgroundImage === "none" && effect.backgroundColor === "rgba(0, 0, 0, 0)")).toBe(true);
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(page.locator("#referral-copy")).toHaveCSS("box-shadow", "none");
  await page.locator("#referral-copy").hover();
  await expect(page.locator("#referral-copy")).toHaveCSS("box-shadow", "none");
  await expect(page.locator("#referral-history-heading")).toHaveText("Recent invites");
  await expect(page.locator(".pp-referral-invite")).toHaveCount(1);
  await expect(page.locator(".pp-referral-invite")).toContainText("First Friend");
  await expect(page.locator(".pp-referral-invite")).toContainText("Completed");
  await expect(page.locator(".pp-referral-invite")).toContainText("+1 season · +2 movies");
  await page.setViewportSize({ width: 390, height: 844 });
  const referralMobile = await page.locator("#referral-panel").evaluate((panel) => ({
    overflows: panel.scrollWidth > panel.clientWidth,
    copyButtonHeight: panel.querySelector("#referral-copy").getBoundingClientRect().height,
    inviteWidth: panel.querySelector(".pp-referral-invite").getBoundingClientRect().width,
  }));
  expect(referralMobile.overflows).toBe(false);
  expect(referralMobile.copyButtonHeight).toBeGreaterThanOrEqual(44);
  expect(referralMobile.inviteWidth).toBeLessThanOrEqual(360);
  await page.setViewportSize({ width: 1280, height: 720 });
  const referralPolish = await page.locator("#referral-panel").evaluate((panel) => ({
    smallestHelperText: Math.min(...[
      ".pp-referral-reward-stats article span:not(.pp-referral-stat-icon)",
      ".pp-referral-redemption-body > p", ".pp-referral-redemption-controls label small",
      ".pp-referral-history-heading > small",
    ].map((selector) => Number.parseFloat(getComputedStyle(panel.querySelector(selector)).fontSize))),
    overviewColumns: getComputedStyle(panel.querySelector(".pp-referral-overview")).gridTemplateColumns.split(" ").length,
    howColumns: getComputedStyle(panel.querySelector(".pp-referral-how ol")).gridTemplateColumns.split(" ").length,
    overviewCardHeights: [".pp-referral-share", ".pp-referral-rewards"].map((selector) => panel.querySelector(selector).getBoundingClientRect().height),
    headingSize: Number.parseFloat(getComputedStyle(panel.querySelector(".pp-referral-heading h2")).fontSize),
    headingWeight: getComputedStyle(panel.querySelector(".pp-referral-heading h2")).fontWeight,
    copyColor: getComputedStyle(panel.querySelector("#referral-copy")).color,
    iconWidth: panel.querySelector(".pp-referral-icon").getBoundingClientRect().width,
    headingIconWidth: panel.querySelector(".pp-referral-heading-icon").getBoundingClientRect().width,
  }));
  expect(referralPolish.smallestHelperText).toBeGreaterThanOrEqual(10);
  expect(referralPolish.overviewColumns).toBe(2);
  expect(referralPolish.howColumns).toBe(4);
  expect(Math.abs(referralPolish.overviewCardHeights[0] - referralPolish.overviewCardHeights[1])).toBeLessThan(1);
  expect(referralPolish.headingSize).toBeLessThanOrEqual(34);
  expect(referralPolish.headingWeight).toBe("700");
  expect(referralPolish.copyColor).toBe("rgb(255, 255, 255)");
  expect(referralPolish.iconWidth).toBe(34);
  expect(referralPolish.headingIconWidth).toBe(24);
  await page.locator("#referral-redemption summary").click();
  await page.locator("#referral-redeem-movies").fill("3");
  await page.locator("#referral-redeem-seasons").fill("1");
  await page.getByRole("button", { name: "Add to account" }).click();
  await expect(page.locator("#referral-redeem-status")).toContainText("added to your request-service account");
  await expect(page.locator("#referral-movie-available")).toHaveText("1 available");
  await expect(page.locator("#referral-season-available")).toHaveText("1 available");
  expect(redeemedBody).toEqual({ action: "redeem_reward", movies: 3, seasons: 1 });
  await expect(page.locator("#referral-order-by")).toContainText("JACOB-ABC123");
  await page.getByRole("button", { name: "Choose extras" }).click();
  await expect(page.locator('[data-referral-step="2"]')).toBeVisible();
  await page.locator('#referral-extras input[data-addon-id="extra-season"]').fill("2");
  await page.getByRole("button", { name: "Review order" }).click();
  await expect(page.locator("#referral-review")).toContainText("NewFriendPlex");
  await expect(page.locator("#referral-review")).toContainText("Gold Tier");
  await expect(page.locator("#referral-review")).toContainText("2× Extra Season Request");
  await expect(page.locator("#referral-review")).toContainText("£7.00");
  await expect(page.locator("#referral-review")).toContainText("PP-REVIEW");
  await expect(page.getByRole("button", { name: "Continue on WhatsApp" })).toBeVisible();
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
  let grantedRequestsBody = null;
  let grantShouldReturnInvalid = false;
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
  await page.route("**/api/portal/admin/request-credits", async (route) => {
    if (grantShouldReturnInvalid) return route.fulfill({
      status: 502, contentType: "text/html", body: "<h1>Temporary upstream error</h1>",
    });
    grantedRequestsBody = route.request().postDataJSON();
    return route.fulfill({ json: {
      granted: { movies: grantedRequestsBody.movies, seasons: grantedRequestsBody.seasons },
      verified: { mode: "monthly_bonus", movies: 4, seasons: 2 },
    } });
  });
  await page.goto("/account/#account");
  await page.getByRole("button", { name: "Manage" }).click();
  await expect(page.locator("#admin-billing-editor")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Grant request credits" })).toBeVisible();
  await page.getByLabel("Movies", { exact: true }).fill("2");
  await page.getByLabel("Seasons", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Grant requests" }).click();
  await expect(page.locator("#admin-request-credits-status")).toHaveText("Added 2 movie and 1 season requests. Monthly bonus now: 4 movie requests and 2 season requests.");
  expect(grantedRequestsBody).toEqual({ userId: "member", movies: 2, seasons: 1 });
  grantShouldReturnInvalid = true;
  await page.getByLabel("Movies", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Grant requests" }).click();
  await expect(page.locator("#admin-request-credits-status")).toContainText("invalid 502 response");
  await expect(page.locator("#admin-request-credits-status")).not.toContainText("Check your connection");
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
  await page.setViewportSize({ width: 390, height: 844 });
  const requestGrantMobileLayout = await page.locator("#admin-request-credits-form").evaluate((form) => ({
    formOverflow: form.scrollWidth - form.clientWidth,
    pageOverflow: document.documentElement.scrollWidth - innerWidth,
    helperFontSize: Number.parseFloat(getComputedStyle(form.querySelector("div > p")).fontSize),
    controls: [...form.querySelectorAll("input, button")].map((control) => control.getBoundingClientRect().width),
  }));
  expect(requestGrantMobileLayout.formOverflow).toBeLessThanOrEqual(1);
  expect(requestGrantMobileLayout.pageOverflow).toBeLessThanOrEqual(0);
  expect(requestGrantMobileLayout.helperFontSize).toBeGreaterThanOrEqual(12);
  expect(requestGrantMobileLayout.controls.every((width) => width > 100)).toBe(true);
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
