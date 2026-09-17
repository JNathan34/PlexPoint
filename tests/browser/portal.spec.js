import { test, expect } from "@playwright/test";

// Browser checks stay local; opening real Plex services is never part of a test.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") return route.abort();
    if (url.pathname.startsWith("/api/plex/")) {
      return route.fulfill({ json: url.pathname.endsWith("/counts") ? { movies: 0, shows: 0 } : [] });
    }
    return route.continue();
  });
});

test("the account page contains only the account dashboard", async ({ page }) => {
  const errors = [];
  let contentRequests = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/portal/content", (route) => {
    contentRequests += 1;
    return route.abort();
  });
  await page.goto("/account/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Account");
  await expect(page.locator(".pp-metric")).toHaveCount(4);
  await expect(page.locator(".pp-account-shortcuts")).toHaveCount(0);
  for (const id of ["services", "help", "support", "content-notice"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(0);
  }
  expect(contentRequests).toBe(0);
  expect(errors).toEqual([]);
});

for (const width of [360, 768, 1440]) {
  test(`account dashboard has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/account/");
    for (const section of ["account", "dashboard"]) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await expect(page.locator("h1")).toHaveCount(1);
  });
}

test("the main and account headers keep Account attached and the trial visible", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const desktopLink = page.locator('[data-testid="nav-account-link"]');
  await expect(desktopLink).toBeVisible();
  await expect(desktopLink).toHaveAttribute("href", "/account/");
  expect(await desktopLink.evaluate((node) => node.parentElement === document.querySelector('[data-testid="nav-link-tutorials"]')?.parentElement)).toBe(true);
  await expect(page.locator('[data-testid="nav-free-trial-link"]')).toBeVisible();
  await desktopLink.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Account");
  const accountTrial = page.locator('[data-testid="account-trial-link"]');
  await expect(accountTrial).toBeVisible();
  await expect(accountTrial).toHaveAttribute("href", "https://wizarr.plexpoint.uk/j/FREE%20TRIAL");
  await expect(accountTrial).toHaveCSS("color", "rgb(255, 255, 255)");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('[data-testid="mobile-menu-button"]').click();
  const mobileLink = page.locator('[data-testid="mobile-account-link"]');
  await expect(mobileLink).toBeVisible();
  await expect(mobileLink).toHaveAttribute("href", "/account/");
  await mobileLink.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Account");
  await page.locator("#portal-menu-toggle").click();
  const mobileAccountTrial = page.locator('[data-testid="account-mobile-trial-link"]');
  await expect(mobileAccountTrial).toBeVisible();
  await expect(mobileAccountTrial).toHaveAttribute("href", "https://wizarr.plexpoint.uk/j/FREE%20TRIAL");
  await expect(mobileAccountTrial).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("public content remains available to other clients through the Pages worker", async ({ request }) => {
  const response = await request.get("/api/portal/content");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.source).toBe("database");
  expect(data.articles).toHaveLength(6);
});
