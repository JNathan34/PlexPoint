import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { defaultLinks, defaultArticles } from "../assets/portal-content.js";
import { publicHref, normalizeContent, filterArticles, portalRoute, articleBlocks, supportMessage } from "../assets/portal-utils.js";
import { loadPublicContent, publicContentResponse } from "../shared/portal/content.js";

function database(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  for (const migration of ['0001_portal.sql', '0002_public_content.sql']) {
    db.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'));
  }
  return {
    db,
    binding: { prepare: (sql) => ({ all: async () => ({ success: true, results: db.prepare(sql).all() }) }) },
  };
}

test('bundled services and guides form a complete valid directory', () => {
  const result = normalizeContent({ links: defaultLinks, articles: defaultArticles });
  assert.equal(result.links.length, 5);
  assert.equal(result.articles.length, 6);
  assert.deepEqual(result.articles, defaultArticles);
});

test('search matches all words across title, summary, category and body', () => {
  assert.equal(filterArticles(defaultArticles, '  BUFFERING  ').length, 1);
  assert.equal(filterArticles(defaultArticles, 'missing invitation').length, 1);
  assert.equal(filterArticles(defaultArticles, '', 'Troubleshooting').length, 2);
  assert.equal(filterArticles(defaultArticles, 'payment', 'Requests').length, 0);
  assert.equal(filterArticles(defaultArticles, 'definitely-no-such-guide').length, 0);
});

test('routes support shared guides and reject unknown views or malformed slugs', () => {
  assert.deepEqual(portalRoute('#help/install-plex'), { view: 'help', slug: 'install-plex' });
  assert.deepEqual(portalRoute('#support'), { view: 'support', slug: null });
  assert.deepEqual(portalRoute('#unknown'), { view: 'overview', slug: null });
  assert.deepEqual(portalRoute('#help/%broken'), { view: 'help', slug: null });
  assert.deepEqual(portalRoute(''), { view: 'account', slug: null });
  assert.deepEqual(portalRoute('#'), { view: 'account', slug: null });
});

test('service addresses accept HTTPS or local paths', () => {
  assert.equal(publicHref('/#tutorials'), '/#tutorials');
  assert.equal(publicHref('https://app.plex.tv/'), 'https://app.plex.tv/');
  for (const value of [null, '', 'javascript:alert(1)', 'data:text/html,test', '//other.test', '/\\other.test',
    'http://other.test', 'https://user:password@other.test', ' https://other.test', '/line\nbreak']) {
    assert.equal(publicHref(value), null);
  }
});

test('normalization omits invalid rows, duplicate IDs and fields outside the public contract', () => {
  const result = normalizeContent({
    links: [null, { ...defaultLinks[0], extra: 'not-public' }, defaultLinks[0], { ...defaultLinks[1], url: 'invalid' }],
    articles: [null, { ...defaultArticles[0], private_notes: 'not-public' }, defaultArticles[0], { ...defaultArticles[1], slug: '../invalid' }],
  });
  assert.equal(result.links.length, 1);
  assert.equal(result.articles.length, 1);
  assert.equal(result.links[0].extra, undefined);
  assert.equal(result.articles[0].private_notes, undefined);
  assert.throws(() => normalizeContent({ links: [], articles: null }));
});

test('guide formatting groups paragraphs and lists without interpreting raw HTML', () => {
  assert.deepEqual(articleBlocks('## Start\r\n1. First\r\n2. Second\r\n\r\nOne line\nnext line\n\n- Check\n\n<script>example</script>'), [
    { type: 'heading', text: 'Start' }, { type: 'ordered', items: ['First', 'Second'] },
    { type: 'paragraph', text: 'One line next line' }, { type: 'unordered', items: ['Check'] },
    { type: 'paragraph', text: '<script>example</script>' },
  ]);
});

test('support message includes provided information without inventing account details', () => {
  const result = supportMessage({ topic: 'Playback problem', device: ' TV ', details: 'An episode keeps buffering.' });
  assert.match(result, /Device: TV/);
  assert.match(result, /An episode keeps buffering/);
  assert.ok(!supportMessage({ topic: 'Payment', device: '', details: 'Please check my payment.' }).includes('Device:'));
});

test('unconfigured content uses bundled guides without requiring accounts', async () => {
  const result = await loadPublicContent();
  assert.equal(result.source, 'bundled');
  assert.equal(result.articles.length, defaultArticles.length);
});

test('content migrations populate guides from the bundled copy', async (t) => {
  const { binding } = database(t);
  const result = await loadPublicContent(binding);
  assert.equal(result.source, 'database');
  assert.equal(result.links.length, defaultLinks.length);
  assert.deepEqual(result.articles, defaultArticles);
});

test('published content excludes drafts and disabled links', async (t) => {
  const { db, binding } = database(t);
  db.exec("UPDATE help_articles SET published=0 WHERE slug='install-plex'; UPDATE service_links SET enabled=0 WHERE id='plex'");
  const result = await loadPublicContent(binding);
  assert.equal(result.articles.length, 5);
  assert.equal(result.links.length, 4);
  assert.ok(!result.articles.some((a) => a.slug === 'install-plex'));
  assert.ok(!result.links.some((a) => a.id === 'plex'));
});

test('an intentionally empty directory does not silently republish defaults', async (t) => {
  const { db, binding } = database(t);
  db.exec('UPDATE help_articles SET published=0; UPDATE service_links SET enabled=0');
  const result = await loadPublicContent(binding);
  assert.deepEqual(result.articles, []);
  assert.deepEqual(result.links, []);
});

test('reapplying the content seed does not overwrite administrator edits', async (t) => {
  const { db, binding } = database(t);
  db.exec("UPDATE help_articles SET title='Updated title' WHERE slug='install-plex'");
  db.exec(readFileSync(new URL('../migrations/0002_public_content.sql', import.meta.url), 'utf8'));
  const result = await loadPublicContent(binding);
  assert.equal(result.articles[0].title, 'Updated title');
});

test('the content response handles database failure without returning database details', async () => {
  const response = await publicContentResponse({ PORTAL_DB: { prepare: () => { throw new Error('Internal database detail'); } } });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { message: 'Updated guides are temporarily unavailable.' });
});

test('the public response contains only services and help articles', async () => {
  const response = await publicContentResponse({});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60');
  assert.deepEqual(Object.keys(await response.json()).sort(), ['articles', 'links', 'source']);
});
