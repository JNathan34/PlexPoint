import { test, expect } from "@playwright/test";
import { defaultLinks, defaultArticles } from "../../assets/portal-content.js";

// Browser checks stay local; opening real Plex/support services is never part of a test.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') return route.abort();
    if (url.pathname.startsWith('/api/plex/')) return route.fulfill({ json: url.pathname.endsWith('/counts') ? { movies: 0, shows: 0 } : [] });
    return route.continue();
  });
});

test('the account, membership and services share one continuous page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/account/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Account');
  await expect(page.getByText('Sign in with Plex. Keep your existing library access.', { exact: true })).toBeVisible();
  await expect(page.locator('.pp-metric > strong')).toHaveText(['Sign in to view', 'Sign in to view', 'Sign in to view', 'Sign in to view']);
  await expect(page.locator('#service-links > a')).toHaveCount(5);
  await expect(page.locator('#service-links > a').first()).toHaveAttribute('href', 'https://app.plex.tv/');
  await expect(page.locator('#service-links > a').first()).toHaveAttribute('rel', 'noopener noreferrer');
  for (const id of ['account', 'dashboard', 'services', 'help', 'support']) await expect(page.locator(`#${id}`)).toBeVisible();
  expect(errors).toEqual([]);
});

test('main-site navigation, legacy guide links and back navigation work', async ({ page }) => {
  await page.goto('/account/');
  const navigation = page.getByRole('navigation', { name: 'Main website navigation' });
  await expect(navigation.getByRole('link', { name: 'Account', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('link', { name: 'Membership', exact: true })).toHaveAttribute('href', '/#membership');
  await page.goto('/account/#help/request-content');
  await expect(page.locator('#guide-request-content')).toHaveAttribute('open', '');
  await page.locator('a[href="#support"]').last().click();
  await expect(page.locator('#support-form')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#guide-request-content')).toHaveAttribute('open', '');
});

test('guide search, category filtering and reset work', async ({ page }) => {
  await page.goto('/account/#help');
  await expect(page.locator('#help-articles details')).toHaveCount(6);
  await page.getByRole('button', { name: 'Troubleshooting', exact: true }).click();
  await expect(page.locator('#help-articles details')).toHaveCount(2);
  await page.getByRole('searchbox').fill('buffering');
  await expect(page.locator('#help-articles details')).toHaveCount(1);
  await page.getByRole('searchbox').fill('something-unfindable');
  await expect(page.getByRole('heading', { name: 'No matching guides', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('#help-articles details')).toHaveCount(6);
  await expect(page.getByRole('searchbox')).toBeFocused();
});

test('guide accordions work with the keyboard and guide links copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/account/#help');
  const first = page.locator('#help-articles summary').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#help-articles details').first()).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Copy guide link' }).first().click();
  await expect(page.getByText('Guide link copied.', { exact: true })).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe('http://127.0.0.1:8791/account/#guide-install-plex');
});

test('support prepares an email without sending anything, and clears stale drafts', async ({ page }) => {
  await page.goto('/account/#support');
  await page.getByLabel('Device', { exact: false }).fill('Living room TV');
  await page.getByLabel('What is happening?').fill('The same episode buffers after a few minutes.');
  await page.getByRole('button', { name: 'Prepare email' }).click();
  const href = await page.locator('#prepared-email-link').getAttribute('href');
  expect(href).toContain('mailto:jacobnathan1718@gmail.com?');
  expect(decodeURIComponent(href)).toContain('Device: Living room TV');
  await expect(page.getByText('Message prepared. Nothing has been sent.')).toBeVisible();
  await page.getByLabel('What is happening?').fill('Changed details for the same problem.');
  await expect(page.locator('#prepared-email')).toBeHidden();
  await expect(page.locator('#prepared-email-link')).not.toHaveAttribute('href');
});

test('support rejects a blank description and can copy a valid message', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/account/#support');
  await page.getByRole('button', { name: 'Copy message' }).click();
  await expect(page.locator('#prepared-email')).toBeHidden();
  await page.getByLabel('What is happening?').fill('Please help me find the library on my TV.');
  await page.getByRole('button', { name: 'Copy message' }).click();
  await expect(page.locator('#support-status')).toContainText('Message copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Please help me find the library');
});

test('content failure keeps built-in guides available and supports retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/portal/content', (route) => {
    attempts += 1;
    return route.fulfill(attempts === 1 ? { status: 503, json: { message: 'Unavailable' } }
      : { json: { links: defaultLinks, articles: defaultArticles } });
  });
  await page.goto('/account/#help');
  await expect(page.locator('#content-notice')).toBeVisible();
  await expect(page.locator('#help-articles details')).toHaveCount(6);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('#content-notice')).toBeHidden();
  expect(attempts).toBe(2);
});

test('a missing shared guide gives a clear message', async ({ page }) => {
  await page.goto('/account/#guide-not-a-guide');
  await expect(page.locator('#help-count')).toContainText('That guide is not available.');
});

test('server-managed empty content stays empty', async ({ page }) => {
  await page.route('**/api/portal/content', (route) => route.fulfill({ json: { links: [], articles: [] } }));
  await page.goto('/account/#services');
  await expect(page.locator('#service-links')).toHaveText('No services are currently listed.');
  await page.locator('#help').scrollIntoViewIfNeeded();
  await expect(page.locator('#help-empty')).toBeVisible();
});

for (const width of [360, 768, 1440]) {
  test(`portal has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/account/');
    for (const section of ['account', 'dashboard', 'services', 'help', 'support']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('the main and account headers keep Account attached and the trial visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const desktopLink = page.locator('[data-testid="nav-account-link"]');
  await expect(desktopLink).toBeVisible();
  await expect(desktopLink).toHaveAttribute('href', '/account/');
  expect(await desktopLink.evaluate((node) => node.parentElement === document.querySelector('[data-testid="nav-link-tutorials"]')?.parentElement)).toBe(true);
  await expect(page.locator('[data-testid="nav-free-trial-link"]')).toBeVisible();
  await desktopLink.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Account');
  const accountTrial = page.locator('[data-testid="account-trial-link"]');
  await expect(accountTrial).toBeVisible();
  await expect(accountTrial).toHaveAttribute('href', 'https://wizarr.plexpoint.uk/j/FREE%20TRIAL');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-testid="mobile-menu-button"]').click();
  const mobileLink = page.locator('[data-testid="mobile-account-link"]');
  await expect(mobileLink).toBeVisible();
  await expect(mobileLink).toHaveAttribute('href', '/account/');
  expect(await mobileLink.evaluate((node) => node.parentElement === document.querySelector('[data-testid="mobile-nav-link-tutorials"]')?.parentElement)).toBe(true);
  await mobileLink.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Account');
  await expect(page.locator('.pp-site-header')).toHaveAttribute('data-menu-open', 'false');
  await page.locator('#portal-menu-toggle').click();
  const mobileAccountTrial = page.locator('[data-testid="account-mobile-trial-link"]');
  await expect(mobileAccountTrial).toBeVisible();
  await expect(mobileAccountTrial).toHaveAttribute('href', 'https://wizarr.plexpoint.uk/j/FREE%20TRIAL');
});

test('public content is served by the actual Pages worker', async ({ request }) => {
  const response = await request.get('/api/portal/content');
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.source).toBe('database');
  expect(data.articles).toHaveLength(6);
});
