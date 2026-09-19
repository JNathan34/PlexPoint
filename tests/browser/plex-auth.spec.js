import { test, expect } from "@playwright/test";

const localUser = { id: "local-test", email: "fan@example.test", displayName: "Movie Fan", createdAt: Date.now() };
const plexUser = { ...localUser, plex: { username: "PlexMovieFan" } };
const authorizationUrl = "https://app.plex.tv/auth#?clientID=browser-test&code=mock-pin&forwardUrl=http%3A%2F%2F127.0.0.1%3A8791%2Faccount%2F%3Fplex%3Dreturn%23account";

test.beforeEach(async ({ page }) => {
  // Provider responses are mocked: never open a real Plex account or use real credentials.
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "app.plex.tv") return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Mock Plex authorization</title><p>Mock Plex authorization</p>" });
    if (url.hostname !== "127.0.0.1") return route.abort();
    if (url.pathname.startsWith("/api/plex/")) return route.fulfill({ json: url.pathname.endsWith("/counts") ? { movies: 0, shows: 0 } : [] });
    return route.continue();
  });
});

test("the actual Pages worker exposes Plex auth and rejects unbound completion", async ({ request }) => {
  const get = await request.get("/api/portal/plex/start");
  expect(get.status()).toBe(405);
  expect(get.headers().allow).toBe("POST");
  const complete = await request.post("/api/portal/plex/complete", {
    headers: { Origin: "http://127.0.0.1:8791", "X-PlexPoint-Request": "1" }, data: {},
  });
  expect(complete.status()).toBe(410);
  expect(complete.headers()["cache-control"]).toBe("no-store");
});

test("the account landing page offers Plex first and redirects in the same tab", async ({ page }) => {
  let posted = null;
  await page.route("**/api/portal/plex/start", (route) => {
    posted = route.request().postDataJSON();
    expect(route.request().headers()["x-plexpoint-request"]).toBe("1");
    return route.fulfill({ json: { authorizationUrl, expiresAt: Date.now() + 600000 } });
  });
  await page.goto("/account/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Account");
  const plex = page.getByRole("button", { name: "Continue with Plex" });
  await expect(plex).toBeEnabled();
  await expect(page.locator("#email-option, #auth-form")).toHaveCount(0);
  await plex.click();
  await expect(page).toHaveURL(authorizationUrl);
  expect(posted).toEqual({});
});

test("return from Plex completes sign-in, cleans the URL, and survives reload", async ({ page }) => {
  let user = null;
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user } }));
  await page.route("**/api/portal/plex/complete", (route) => {
    user = plexUser;
    return route.fulfill({ json: { user } });
  });
  await page.goto("/account/?plex=return#account");
  await expect(page.locator("#auth-status")).toHaveText("You are signed in with Plex.");
  await expect(page.locator("#auth-user-name")).toHaveText(plexUser.displayName);
  await expect(page.getByText("Plex connected", { exact: false })).toHaveCount(0);
  await expect(page).toHaveURL("http://127.0.0.1:8791/account/#account");
  await page.reload();
  await expect(page.locator("#auth-user-email")).toHaveText(plexUser.email);
  await expect(page.locator("#auth-user")).toBeVisible();
});

test("pending approval can be checked again or cancelled", async ({ page }) => {
  let approved = false;
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: null } }));
  await page.route("**/api/portal/plex/complete", (route) => route.fulfill(approved ? { json: { user: plexUser } } : { status: 202, json: { pending: true } }));
  await page.route("**/api/portal/plex/cancel", (route) => route.fulfill({ json: { cancelled: true } }));
  await page.goto("/account/?plex=return#account");
  await expect(page.locator("#plex-pending")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel Plex sign-in" }).click();
  await expect(page.locator("#plex-pending")).toBeHidden();
  await expect(page.locator("#auth-status")).toContainText("cancelled");
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeEnabled();
  await page.goto("/account/?plex=return#account");
  await expect(page.locator("#plex-pending")).toBeVisible();
  approved = true;
  await page.getByRole("button", { name: "Check approval" }).click();
  await expect(page.locator("#auth-user-name")).toHaveText(plexUser.displayName);
  await expect(page.locator("#plex-pending")).toBeHidden();
});

test("expired attempts and Plex outages show actionable errors and allow Plex retry", async ({ page }) => {
  await page.route("**/api/portal/plex/complete", (route) => route.fulfill({ status: 410, json: { message: "This Plex sign-in has expired or was cancelled. Please start again." } }));
  await page.route("**/api/portal/plex/start", (route) => route.fulfill({ status: 502, json: { message: "Plex is not responding. Please try again shortly." } }));
  await page.goto("/account/?plex=return#account");
  await expect(page.locator("#auth-status")).toContainText("expired");
  await page.getByRole("button", { name: "Continue with Plex" }).click();
  await expect(page.locator("#auth-status")).toContainText("Plex is not responding");
  await expect(page.getByRole("button", { name: "Continue with Plex" })).toBeEnabled();
});

test("signed-in accounts show account actions without Plex connection messaging", async ({ page }) => {
  await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: localUser } }));
  await page.goto("/account/");
  await expect(page.locator("#auth-user-name")).toHaveText(localUser.displayName);
  await expect(page.getByText("Plex connected", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Connect Plex", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Overseerr", exact: false })).toHaveCount(0);
});

test("account page shares the membership section's translucent glass treatment", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".membership-tier").first()).toBeVisible();
  const main = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    font: getComputedStyle(document.body).fontFamily,
    card: getComputedStyle(document.querySelector(".membership-tier")).backgroundImage,
    gradient: getComputedStyle(document.documentElement).getPropertyValue("--gradient-primary"),
  }));
  await page.goto("/account/");
  const portal = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    font: getComputedStyle(document.body).fontFamily,
    card: getComputedStyle(document.querySelector("#billing-panel")).backgroundImage,
    gradient: getComputedStyle(document.documentElement).getPropertyValue("--gradient-primary"),
  }));
  expect(portal).toEqual(main);
  expect(await page.locator(".pp-auth-card").evaluate((card) => getComputedStyle(card).backgroundImage)).toBe(main.card);
  expect(await page.locator(".pp-metric").first().evaluate((card) => getComputedStyle(card).backgroundImage)).toContain("rgba(24, 29, 42, 0.68)");
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect(page.locator(".pp-site-header.navbar-custom")).toBeVisible();
  await expect(page.locator(".pp-sidebar")).toHaveCount(0);
});

for (const width of [320, 768, 1440]) {
  test(`Plex login and long profile names fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/account/");
    await expect(page.locator("#plex-sign-in")).toBeEnabled();
    const card = await page.locator(".pp-auth-card").boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.route("**/api/portal/auth/session", (route) => route.fulfill({ json: { user: { ...plexUser, displayName: "A".repeat(100), plex: { username: "B".repeat(100) } } } }));
    await page.reload();
    await expect(page.locator("#auth-user-name")).toHaveText("A".repeat(100));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
