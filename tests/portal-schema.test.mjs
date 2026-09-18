import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const migration = readFileSync(new URL('../migrations/0001_portal.sql', import.meta.url), 'utf8');
const vipAddonsMigration = readFileSync(new URL('../migrations/0007_vip_addons.sql', import.meta.url), 'utf8');
function database(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(migration);
  db.exec(`
    INSERT INTO users(id, email, display_name) VALUES ('u1', 'one@example.test', 'One'), ('u2', 'two@example.test', 'Two');
    INSERT INTO subscriptions(id, user_id, tier_id, access_status, starts_at, ends_at)
      VALUES ('s1', 'u1', 'gold', 'enabled', 1000, 2000);
    INSERT INTO billing_periods(id, subscription_id, tier_id, starts_at, ends_at, amount_due_minor, currency, reference)
      VALUES ('b1', 's1', 'gold', 1000, 2000, 500, 'GBP', 'PP-001');
  `);
  return db;
}

test('migration creates the portal tables and preserves the six existing tiers', (t) => {
  const db = database(t);
  assert.equal(db.prepare("SELECT count(*) AS n FROM sqlite_master WHERE type='table'").get().n, 10);
  assert.deepEqual(db.prepare('SELECT id FROM subscription_tiers ORDER BY sort_order').all().map(r => r.id),
    ['bronze', 'silver', 'gold', 'diamond', 'ruby', 'platinum']);
  assert.equal(db.prepare('SELECT count(*) AS n FROM service_links').get().n, 4);
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length, 0);
});

test('one subscription per customer and case-insensitive unique email', (t) => {
  const db = database(t);
  assert.throws(() => db.exec("INSERT INTO users(id,email,display_name) VALUES ('u3','ONE@example.test','Duplicate')"));
  assert.throws(() => db.exec("INSERT INTO subscriptions(id,user_id,tier_id) VALUES ('s2','u1','bronze')"));
});

test('subscription references, states and date ranges are constrained', (t) => {
  const db = database(t);
  for (const sql of [
    "UPDATE subscriptions SET user_id='missing'",
    "UPDATE subscriptions SET tier_id='missing'",
    "UPDATE subscriptions SET access_status='unknown'",
    "UPDATE subscriptions SET ends_at=starts_at",
    "UPDATE subscriptions SET starts_at=NULL",
    "UPDATE subscriptions SET starts_at=NULL, ends_at=NULL",
    "UPDATE users SET account_status='unknown'",
  ]) assert.throws(() => db.exec(sql));
});

test('payment currency and period must agree; confirmed payments require dates', (t) => {
  const db = database(t);
  const insert = db.prepare(`INSERT INTO payments
    (id,billing_period_id,amount_minor,currency,status,method,idempotency_key,received_at,confirmed_at)
    VALUES (?,?,?,?,?,'bank_transfer',?,?,?)`);
  assert.throws(() => insert.run('p1','b1',500,'USD','pending','key1',null,null));
  assert.throws(() => insert.run('p1','missing',500,'GBP','pending','key1',null,null));
  assert.throws(() => insert.run('p1','b1',500,'GBP','confirmed','key1',null,null));
  assert.throws(() => insert.run('p1','b1',-1,'GBP','pending','key1',null,null));
  assert.throws(() => insert.run('p1','b1',0.5,'GBP','pending','key1',null,null));
  insert.run('p1','b1',500,'GBP','confirmed','key1',1100,1200);
  assert.throws(() => insert.run('p2','b1',500,'GBP','confirmed','key1',1100,1200));
});

test('future provider payment IDs are unique per provider', (t) => {
  const db = database(t);
  const insert = db.prepare(`INSERT INTO payments
    (id,billing_period_id,amount_minor,currency,status,method,idempotency_key,provider,provider_payment_id)
    VALUES (?,'b1',500,'GBP','pending','external',?,?,?)`);
  insert.run('p1', 'key1', 'provider-a', 'external-1');
  assert.throws(() => insert.run('p2', 'key2', 'provider-a', 'external-1'));
  insert.run('p3', 'key3', 'provider-b', 'external-1');
});

test('historical billing amounts do not change with tier prices', (t) => {
  const db = database(t);
  db.exec("UPDATE subscription_tiers SET monthly_price_minor=750 WHERE id='gold'");
  assert.equal(db.prepare("SELECT amount_due_minor FROM billing_periods WHERE id='b1'").get().amount_due_minor, 500);
});

test('payment recording does not implicitly alter entitlement', (t) => {
  const db = database(t);
  const before = db.prepare("SELECT * FROM subscriptions WHERE id='s1'").get();
  db.exec(`INSERT INTO payments(id,billing_period_id,amount_minor,currency,status,method,idempotency_key)
    VALUES ('p1','b1',500,'GBP','pending','revolut','key1')`);
  assert.deepEqual(db.prepare("SELECT * FROM subscriptions WHERE id='s1'").get(), before);
});

test('VIP and assignable add-ons extend the existing account model', (t) => {
  const db = database(t);
  db.exec(vipAddonsMigration);
  const vip = db.prepare("SELECT id, monthly_price_minor FROM subscription_tiers WHERE id='vip'").get();
  assert.equal(vip.id, 'vip');
  assert.equal(vip.monthly_price_minor, 0);
  assert.equal(db.prepare('SELECT count(*) AS n FROM addon_catalog WHERE enabled=1').get().n, 3);
  db.exec("INSERT INTO user_addons(user_id,addon_id,quantity,assigned_by) VALUES ('u1','extra-movie',2,'u2')");
  assert.equal(db.prepare("SELECT quantity FROM user_addons WHERE user_id='u1' AND addon_id='extra-movie'").get().quantity, 2);
  assert.throws(() => db.exec("INSERT INTO user_addons(user_id,addon_id,quantity) VALUES ('u2','extra-season',0)"));
});

test('a Plex identity cannot be assigned to two portal customers', (t) => {
  const db = database(t);
  db.exec("INSERT INTO plex_account_links(user_id,plex_user_id,tautulli_user_id,verified_by,verified_at) VALUES ('u1','plex1','t1','u2',1000)");
  assert.throws(() => db.exec("INSERT INTO plex_account_links(user_id,plex_user_id,verified_by,verified_at) VALUES ('u2','plex1','u1',1000)"));
  assert.throws(() => db.exec("INSERT INTO plex_account_links(user_id,plex_user_id,tautulli_user_id,verified_by,verified_at) VALUES ('u2','plex2','t1','u1',1000)"));
});
