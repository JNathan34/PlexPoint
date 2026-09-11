import test from "node:test";
import assert from "node:assert/strict";
import { subscriptionSummary, extendedExpiry, addCalendarMonths, paymentSummary } from "../shared/portal/subscriptions.js";

const now = Date.parse('2026-09-11T12:00:00Z');
const day = 86_400_000;
const subscription = { access_status: 'enabled', starts_at: now - day, ends_at: now + day };

for (const [label, value, expected] of [
  ['no subscription', null, 'none'],
  ['current subscription', subscription, 'active'],
  ['start boundary', { ...subscription, starts_at: now }, 'active'],
  ['expiry boundary', { ...subscription, ends_at: now }, 'expired'],
  ['future start', { ...subscription, starts_at: now + 1 }, 'scheduled'],
  ['awaiting initial payment', { access_status: 'pending' }, 'awaiting_payment'],
  ['suspension takes precedence', { ...subscription, access_status: 'suspended' }, 'suspended'],
  ['cancellation takes precedence', { ...subscription, access_status: 'cancelled' }, 'cancelled'],
]) {
  test(label, () => assert.equal(subscriptionSummary(value, now).status, expected));
}

test('remaining days round up without showing time on an inactive entitlement', () => {
  assert.deepEqual(subscriptionSummary({ ...subscription, ends_at: now + 1 }, now), {
    status: 'active', remainingMs: 1, daysRemaining: 1,
  });
  assert.equal(subscriptionSummary({ ...subscription, access_status: 'suspended' }, now).remainingMs, 0);
});

test('invalid or incomplete entitlement dates are rejected', () => {
  for (const value of [
    { access_status: 'enabled' },
    { ...subscription, starts_at: null },
    { ...subscription, starts_at: now + day },
    { ...subscription, ends_at: 'tomorrow' },
    { ...subscription, access_status: 'anything' },
  ]) assert.throws(() => subscriptionSummary(value, now));
  assert.throws(() => subscriptionSummary(subscription, NaN));
});

test('extensions preserve unused time and restart expired terms from now', () => {
  assert.equal(extendedExpiry(now + day, 30, now), now + 31 * day);
  assert.equal(extendedExpiry(now - day, 30, now), now + 30 * day);
  assert.equal(extendedExpiry(now, 1, now), now + day);
  for (const days of [0, -1, 0.5, Infinity, '30', Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => extendedExpiry(now, days, now));
  }
});

for (const [input, months, expected] of [
  ['2026-01-31T12:34:56Z', 1, '2026-02-28T12:34:56.000Z'],
  ['2028-01-31T12:34:56Z', 1, '2028-02-29T12:34:56.000Z'],
  ['2026-12-31T12:34:56Z', 1, '2027-01-31T12:34:56.000Z'],
  ['2026-01-31T12:34:56Z', 2, '2026-03-31T12:34:56.000Z'],
]) test(`calendar renewal ${input} + ${months}`, () => {
  assert.equal(new Date(addCalendarMonths(Date.parse(input), months)).toISOString(), expected);
});

test('invalid calendar intervals and date overflow are rejected', () => {
  for (const months of [0, -1, 1.5, '1', Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => addCalendarMonths(now, months));
  }
  assert.throws(() => addCalendarMonths(8_640_000_000_000_000, 1));
});

const period = { id: 'period-1', amount_due_minor: 500, currency: 'GBP', status: 'open' };
const payment = { id: 'payment-1', billing_period_id: period.id, amount_minor: 500, currency: 'GBP', status: 'confirmed' };

for (const [label, payments, expected] of [
  ['no payments', [], 'unpaid'],
  ['pending payment', [{ ...payment, status: 'pending' }], 'awaiting_confirmation'],
  ['full payment', [payment], 'paid'],
  ['partial payment', [{ ...payment, amount_minor: 200 }], 'partially_paid'],
  ['void payment', [{ ...payment, status: 'void' }], 'unpaid'],
  ['partial plus pending', [{ ...payment, amount_minor: 200 }, { ...payment, id: 'p2', status: 'pending', amount_minor: 300 }], 'awaiting_confirmation'],
]) test(`billing: ${label}`, () => assert.equal(paymentSummary(period, payments).status, expected));

test('split payments, overpayment and free billing periods', () => {
  const result = paymentSummary(period, [{ ...payment, amount_minor: 200 }, { ...payment, id: 'p2', amount_minor: 350 }]);
  assert.equal(result.status, 'paid');
  assert.equal(result.confirmedMinor, 550);
  assert.equal(result.creditMinor, 50);
  assert.equal(result.outstandingMinor, 0);
  assert.equal(paymentSummary({ ...period, amount_due_minor: 0 }, []).status, 'paid');
  assert.equal(paymentSummary({ ...period, status: 'void' }, []).outstandingMinor, 0);
  assert.equal(paymentSummary({ ...period, status: 'void' }, [payment]).status, 'void');
});

test('pending money does not reduce the outstanding balance', () => {
  const result = paymentSummary(period, [{ ...payment, status: 'pending' }]);
  assert.equal(result.pendingMinor, 500);
  assert.equal(result.outstandingMinor, 500);
});

test('a previous period payment cannot settle a new period', () => {
  assert.throws(() => paymentSummary({ ...period, id: 'period-2' }, [payment]));
});

test('duplicate, mismatched and invalid payments cannot inflate totals', () => {
  assert.throws(() => paymentSummary(period, [payment, payment]));
  for (const invalid of [
    { ...payment, currency: 'USD' }, { ...payment, amount_minor: -1 },
    { ...payment, amount_minor: 0.5 }, { ...payment, amount_minor: '500' },
    { ...payment, status: 'unknown' }, { ...payment, id: '' },
  ]) assert.throws(() => paymentSummary(period, [invalid]));
  assert.throws(() => paymentSummary(period, [
    { ...payment, amount_minor: Number.MAX_SAFE_INTEGER }, { ...payment, id: 'p2' },
  ]));
});

test('invalid billing periods are rejected', () => {
  for (const invalid of [null, { ...period, id: '' }, { ...period, currency: 'gbp' },
    { ...period, amount_due_minor: -1 }, { ...period, status: 'unknown' }]) {
    assert.throws(() => paymentSummary(invalid, []));
  }
});

test('reading payment status never changes subscription entitlement or dates', () => {
  const before = structuredClone(subscription);
  paymentSummary(period, [payment]);
  assert.deepEqual(subscription, before);
});
