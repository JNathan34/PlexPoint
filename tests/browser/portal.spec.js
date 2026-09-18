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
  const homeLogo = page.locator('[data-testid="logo-button"] img');
  const homeLogoDetails = await homeLogo.evaluate((image) => {
    const style = getComputedStyle(image);
    const box = image.getBoundingClientRect();
    return { src: image.getAttribute("src"), width: box.width, height: box.height, borderRadius: style.borderRadius, objectFit: style.objectFit };
  });
  const desktopLink = page.locator('[data-testid="nav-account-link"]');
  await expect(desktopLink).toBeVisible();
  await expect(desktopLink).toHaveAttribute("href", "/account/");
  expect(await desktopLink.evaluate((node) => node.parentElement === document.querySelector('[data-testid="nav-link-tutorials"]')?.parentElement)).toBe(true);
  await expect(page.locator('[data-testid="nav-free-trial-link"]')).toBeVisible();
  await desktopLink.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Account");
  const accountBrand = page.locator('[data-testid="account-logo-link"]');
  await expect(accountBrand).toContainText("PlexPoint");
  await expect(accountBrand.locator(".pp-brand-glow")).toHaveCount(1);
  await expect(accountBrand.locator("img")).toHaveAttribute("alt", "PlexPoint Logo");
  const accountLogoDetails = await accountBrand.locator("img").evaluate((image) => {
    const style = getComputedStyle(image);
    const box = image.getBoundingClientRect();
    return { src: image.getAttribute("src"), width: box.width, height: box.height, borderRadius: style.borderRadius, objectFit: style.objectFit };
  });
  expect(accountLogoDetails).toEqual(homeLogoDetails);
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

test("account section links keep the main navigation visible during the return to the homepage", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/account/");
  await expect(page.locator(".pp-site-header")).toHaveCSS("view-transition-name", "plexpoint-navigation");
  await page.locator('#portal-navigation a[href="/#membership"]').click();
  await page.waitForURL(/\/#membership$/);
  const navigation = page.locator('[data-testid="navigation"]');
  await expect(navigation).toBeVisible();
  await expect(navigation).toHaveCSS("opacity", "1");
  await expect(navigation).toHaveCSS("view-transition-name", "plexpoint-navigation");
  const continuity = await page.evaluate(() => ({
    fromAccount: document.documentElement.classList.contains("pp-from-account-navigation"),
    pendingMarker: sessionStorage.getItem("plexpoint:account-navigation"),
    transform: getComputedStyle(document.querySelector('[data-testid="navigation"]')).transform,
  }));
  expect(continuity).toEqual({ fromAccount: true, pendingMarker: null, transform: "matrix(1, 0, 0, 1, 0, 0)" });
});

test("public content remains available to other clients through the Pages worker", async ({ request }) => {
  const response = await request.get("/api/portal/content");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.source).toBe("database");
  expect(data.articles).toHaveLength(6);
});
