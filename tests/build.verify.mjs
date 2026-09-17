import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
async function compare(path) {
  if ((await stat(resolve(root, path))).isDirectory()) {
    for (const name of await readdir(resolve(root, path))) await compare(`${path}/${name}`);
  } else {
    assert.deepEqual(await readFile(resolve(output, path)), await readFile(resolve(root, path)), path);
  }
}

test('the public website is copied byte-for-byte without rewriting its bundle', async () => {
  for (const path of ['index.html','account','assets','icons','plex-posters','preview-pictures','plex-preview.json',
    'plexpoint-logo.png','homepage.png','request.jpg','manifest.webmanifest','sw.js','_routes.json']) {
    await compare(path);
  }
});

test('the account session bootstrap is isolated and cache-versioned', async () => {
  const account = await readFile(resolve(root, 'account/index.html'), 'utf8');
  const portal = await readFile(resolve(root, 'assets/portal.js'), 'utf8');
  assert.match(account, /href="\/assets\/portal\.css\?v=[^"]+"/);
  assert.match(account, /src="\/assets\/portal-auth\.js\?v=[^"]+"/);
  assert.match(account, /src="\/assets\/portal-navigation\.js\?v=[^"]+"/);
  assert.match(account, /src="\/assets\/portal\.js\?v=[^"]+"/);
  assert.doesNotMatch(portal, /import "\.\/portal-auth\.js/);
  assert.doesNotMatch(portal, /import "\.\/portal-navigation\.js/);
  assert.match(portal, /portal-content\.js\?v=/);
  assert.match(portal, /portal-utils\.js\?v=/);
});

test('production fetches same-zone media services through Cloudflare public routing', async () => {
  const config = JSON.parse(await readFile(resolve(root, 'wrangler.jsonc'), 'utf8'));
  assert.ok(config.compatibility_flags.includes('global_fetch_strictly_public'));
});

test('only intended public assets and the generated worker are shipped', async () => {
  assert.deepEqual((await readdir(output)).sort(), [
    'index.html','account','assets','icons','plex-posters','preview-pictures','plex-preview.json',
    'plexpoint-logo.png','homepage.png','request.jpg','manifest.webmanifest','sw.js','_routes.json','_worker.js',
  ].sort());
  const entry = resolve(output, '_worker.js/index.js');
  const syntax = spawnSync(process.execPath, ['--check', entry], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
  const worker = await readFile(entry, 'utf8');
  assert.deepEqual(await readFile(resolve(root, '_worker.js')), await readFile(entry),
    'The repository-root worker deployed by Pages must match the generated Functions worker');
  for (const endpoint of ['/api/portal/activity', '/api/portal/avatar', '/api/portal/requests', '/api/portal/billing', '/api/portal/admin/billing', '/api/portal/admin/users', '/api/portal/auth/:action', '/api/portal/plex/:action', '/api/portal/content']) {
    assert.ok(worker.includes(endpoint), `Missing endpoint: ${endpoint}`);
  }
  for (const endpoint of ['anime-movies','anime-shows','collections','counts','featured-collection',
    'image','movies','sections','shows','status','top-rated']) {
    assert.ok(worker.includes(`/api/plex/${endpoint}`), `Missing endpoint: ${endpoint}`);
  }
});

test('the repository-root worker dispatches the Plex sign-in API', async () => {
  const workerUrl = `${pathToFileURL(resolve(root, '_worker.js')).href}?build-test=${Date.now()}`;
  const { default: worker } = await import(workerUrl);
  const response = await worker.fetch(new Request('https://portal.example.test/api/portal/plex/start'), {
    ASSETS: { fetch: () => new Response('static fallback') },
  }, { waitUntil() {} });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'POST');
  assert.deepEqual(await response.json(), { message: 'Method not allowed.' });
});
