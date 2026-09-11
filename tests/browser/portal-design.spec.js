import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") return route.abort();
    if (url.pathname.startsWith("/api/plex/")) return route.fulfill({ json: url.pathname.endsWith("/counts") ? { movies: 0, shows: 0 } : [] });
    if (url.pathname.endsWith("/auth/session")) return route.fulfill({ json: { user: null } });
    return route.continue();
  });
});

for (const width of [390, 768, 1024, 1440, 1920]) {
  test(`rendered account typography and container alignment match home at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const reference = await page.evaluate(() => {
      const h = getComputedStyle(document.querySelector("h1"));
      const container = document.querySelector("#home .container").getBoundingClientRect();
      return { font: h.fontFamily, size: h.fontSize, weight: h.fontWeight, line: h.lineHeight, tracking: h.letterSpacing, color: h.color, x: container.x, width: container.width };
    });
    await page.goto("/account/");
    await expect(page.locator("#plex-sign-in")).toBeEnabled();
    const actual = await page.evaluate(() => {
      const h = getComputedStyle(document.querySelector("h1"));
      const container = document.querySelector(".pp-account-container").getBoundingClientRect();
      return { font: h.fontFamily, size: h.fontSize, weight: h.fontWeight, line: h.lineHeight, tracking: h.letterSpacing, color: h.color, x: container.x, width: container.width };
    });
    expect(actual).toEqual(reference);
    await expect(page.locator("h1")).toHaveCount(1);
    const action = await page.locator("#plex-sign-in").boundingBox();
    expect(action.y).toBeGreaterThan(68);
    expect(action.y + action.height).toBeLessThan(900);
    expect(action.height).toBe(48);
    const headerControlsFit = await page.locator('.pp-site-header a, .pp-site-header button').evaluateAll((nodes) => nodes.every((node) => {
      const rect = node.getBoundingClientRect();
      return !rect.width || !rect.height || (rect.left >= 0 && rect.right <= innerWidth);
    }));
    expect(headerControlsFit).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("desktop hero reuses the actual home-page backdrop and all three device previews", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const previews = await page.locator(".hero-device-showcase img").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  const backdrop = await page.locator(".hero-backdrop img").getAttribute("src");
  await page.goto("/account/");
  await expect(page.locator(".pp-account-art")).toBeVisible();
  expect(await page.locator(".pp-account-art img").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")))).toEqual(previews);
  await expect(page.locator(".pp-account-backdrop img")).toHaveAttribute("src", backdrop);
  await expect.poll(() => page.locator(".pp-account-art img").evaluateAll((nodes) => nodes.every((node) => node.complete && node.naturalWidth > 0))).toBe(true);
  const intro = await page.locator(".pp-auth-intro").boundingBox();
  const artwork = await page.locator(".pp-account-art").boundingBox();
  expect(intro.x + intro.width).toBeLessThan(artwork.x);
});

for (const width of [320, 390]) {
  test(`mobile sign-in is on the first screen at ${width}px and email expands accessibly`, async ({ page }) => {
    await page.setViewportSize({ width, height: 667 });
    await page.goto("/account/");
    await expect(page.locator("#plex-sign-in")).toBeEnabled();
    const action = await page.locator("#plex-sign-in").boundingBox();
    expect(action.y + action.height).toBeLessThan(667);
    expect((await page.locator(".pp-site-header").boundingBox()).height).toBeLessThanOrEqual(70);
    await expect(page.locator(".pp-account-art")).toBeHidden();
    await expect(page.locator("#auth-email")).toBeHidden();
    await page.locator("#email-option > summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#auth-email")).toBeVisible();
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.getByLabel("Display name", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("mobile navigation supports keyboard opening, Escape, route changes and resizing", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/account/");
  const toggle = page.locator("#portal-menu-toggle");
  await expect(page.locator("#portal-navigation")).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#portal-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.locator('[data-view="help"]').click();
  await expect(page.locator("#portal-navigation")).toBeHidden();
  await expect(page.locator("h1")).toHaveText("A little help goes a long way.");
  await expect(page.locator("h1")).toBeFocused();
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(page.locator("#portal-navigation")).toBeVisible();
  await page.locator('[data-view="account"]').click();
  await expect(page.locator("#account-heading-slot h1")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#portal-navigation")).toBeHidden();
});

test("content failure notices stay below the header when switching between landing and help", async ({ page }) => {
  await page.route("**/api/portal/content", (route) => route.fulfill({ status: 503, json: { message: "Unavailable" } }));
  await page.goto("/account/");
  await expect(page.locator(".pp-account-container > #content-notice")).toBeVisible();
  await expect(page.locator("#plex-sign-in")).toBeEnabled();
  await page.locator('[data-view="help"]').click();
  await expect(page.locator("#page-heading-slot > #content-notice")).toBeVisible();
  const notice = await page.locator("#content-notice").boundingBox();
  const header = await page.locator(".pp-site-header").boundingBox();
  expect(notice.y).toBeGreaterThanOrEqual(header.y + header.height);
  await expect(page.locator("#help-articles details")).toHaveCount(6);
});

test("reduced-motion preference disables portal transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/account/");
  expect(await page.locator("#plex-sign-in").evaluate((node) => getComputedStyle(node).transitionDuration)).toBe("0s");
});
