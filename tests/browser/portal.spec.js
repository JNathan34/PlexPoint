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

test('overview distinguishes portal accounts from Plex access and links to real services', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/account/#overview');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your PlexPoint, in one place.');
  await expect(page.getByText('Sign in with Plex. Keep your existing library access.', { exact: true })).toBeVisible();
  await expect(page.locator('.pp-metric > strong')).toHaveText(['Not available', 'Not available', 'Not available', 'Sign in to view']);
  await expect(page.locator('#quick-links > a')).toHaveCount(3);
  await expect(page.locator('#quick-links > a').first()).toHaveAttribute('href', 'https://app.plex.tv/');
  await expect(page.locator('#quick-links > a').first()).toHaveAttribute('rel', 'noopener noreferrer');
  expect(errors).toEqual([]);
});

test('services navigation, deep links and back navigation work', async ({ page }) => {
  await page.goto('/account/');
  await page.getByRole('navigation', { name: 'Portal navigation' }).getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page.locator('#service-links > a')).toHaveCount(5);
  await expect(page.locator('[data-panel="overview"]')).toBeHidden();
  await expect(page.locator('[data-view="services"]')).toHaveAttribute('aria-current', 'page');
  await page.goto('/account/#help/request-content');
  await expect(page.locator('#guide-request-content')).toHaveAttribute('open', '');
  await page.getByRole('link', { name: 'Contact support', exact: true }).click();
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
  expect(text).toBe('http://127.0.0.1:8791/account/#help/install-plex');
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
  await page.goto('/account/#help/not-a-guide');
  await expect(page.locator('#help-count')).toContainText('That guide is not available.');
});

test('server-managed empty content stays empty', async ({ page }) => {
  await page.route('**/api/portal/content', (route) => route.fulfill({ json: { links: [], articles: [] } }));
  await page.goto('/account/#services');
  await expect(page.locator('#service-links')).toHaveText('No services are currently listed.');
  await page.getByRole('link', { name: 'Help centre', exact: true }).click();
  await expect(page.locator('#help-empty')).toBeVisible();
});

for (const width of [360, 768, 1440]) {
  test(`portal has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/account/');
    for (const view of ['overview', 'account', 'services', 'help', 'support']) {
      if (width < 768) await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.locator(`[data-view="${view}"]`).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator('h1')).toBeVisible();
    }
  });
}

test('the main website exposes the additive portal link', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('navigation', { name: 'Customer portal' }).getByRole('link');
  await expect(link).toHaveAttribute('href', '/account/');
  await link.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to My PlexPoint.');
});

test('public content is served by the actual Pages worker', async ({ request }) => {
  const response = await request.get('/api/portal/content');
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.source).toBe('database');
  expect(data.articles).toHaveLength(6);
});
