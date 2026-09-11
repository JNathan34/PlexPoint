const DAY_MS = 86_400_000;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const ACCESS_STATUSES = new Set(['pending', 'enabled', 'suspended', 'cancelled']);

function integer(value, name, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function timestamp(value, name) {
  return integer(value, name, 0, MAX_TIMESTAMP);
}

function periodDates(startsAt, endsAt) {
  timestamp(startsAt, 'starts_at');
  timestamp(endsAt, 'ends_at');
  if (endsAt <= startsAt) throw new RangeError('ends_at must be after starts_at');
}

/** End dates are exclusive: a subscription expires exactly at ends_at. */
export function subscriptionSummary(subscription, now = Date.now()) {
  timestamp(now, 'now');
  if (subscription == null) return { status: 'none', remainingMs: 0, daysRemaining: 0 };
  if (!ACCESS_STATUSES.has(subscription.access_status)) throw new TypeError('Unknown access status');
  const hasDates = subscription.starts_at != null || subscription.ends_at != null;
  if (hasDates) periodDates(subscription.starts_at, subscription.ends_at);
  if (subscription.access_status === 'enabled' && !hasDates) {
    throw new TypeError('Enabled subscriptions require start and end dates');
  }

  let status = subscription.access_status;
  if (status === 'pending') status = 'awaiting_payment';
  if (status === 'enabled') {
    status = now < subscription.starts_at ? 'scheduled' : now >= subscription.ends_at ? 'expired' : 'active';
  }
  const remainingMs = status === 'active' ? subscription.ends_at - now : 0;
  return { status, remainingMs, daysRemaining: Math.ceil(remainingMs / DAY_MS) };
}

/** Extend from expiry for current/future subscriptions, or from now if expired.
 * Returns a proposed date, without changing payment or access status.
 */
export function extendedExpiry(endsAt, days, now = Date.now()) {
  timestamp(endsAt, 'ends_at');
  timestamp(now, 'now');
  integer(days, 'days', 1);
  return timestamp(Math.max(endsAt, now) + days * DAY_MS, 'extended expiry');
}

/** Calendar-month renewal clamps month-end dates, preserving the UTC time. */
export function addCalendarMonths(value, months) {
  timestamp(value, 'timestamp');
  integer(months, 'months', 1);
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  timestamp(date.getTime(), 'renewal month');
  const lastDay = new Date(date.getTime());
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
  timestamp(lastDay.getTime(), 'month end');
  date.setUTCDate(Math.min(day, lastDay.getUTCDate()));
  return timestamp(date.getTime(), 'renewal date');
}

/** Input must be the ledger for this one billing period, not a user's lifetime payments. */
export function paymentSummary(period, payments) {
  if (!period || typeof period.id !== 'string' || !period.id) throw new TypeError('Billing period ID required');
  integer(period.amount_due_minor, 'amount_due_minor');
  if (!/^[A-Z]{3}$/.test(period.currency)) throw new TypeError('Invalid currency');
  if (!['open', 'void'].includes(period.status)) throw new TypeError('Unknown billing period status');
  if (!Array.isArray(payments)) throw new TypeError('Payments must be an array');
  const ids = new Set();
  let confirmedMinor = 0;
  let pendingMinor = 0;
  for (const payment of payments) {
    if (typeof payment.id !== 'string' || !payment.id || ids.has(payment.id)) {
      throw new TypeError('Payments must have unique IDs');
    }
    ids.add(payment.id);
    if (payment.billing_period_id !== period.id || payment.currency !== period.currency) {
      throw new TypeError('Payment does not belong to this billing period and currency');
    }
    integer(payment.amount_minor, 'amount_minor', 1);
    if (!['pending', 'confirmed', 'void'].includes(payment.status)) throw new TypeError('Unknown payment status');
    if (payment.status === 'confirmed') confirmedMinor = integer(confirmedMinor + payment.amount_minor, 'confirmed total');
    if (payment.status === 'pending') pendingMinor = integer(pendingMinor + payment.amount_minor, 'pending total');
  }
  const outstandingMinor = Math.max(0, period.amount_due_minor - confirmedMinor);
  const status = period.status === 'void' ? 'void'
    : outstandingMinor === 0 ? 'paid'
      : pendingMinor > 0 ? 'awaiting_confirmation'
        : confirmedMinor > 0 ? 'partially_paid' : 'unpaid';
  return {
    status,
    currency: period.currency,
    confirmedMinor,
    pendingMinor,
    outstandingMinor: period.status === 'void' ? 0 : outstandingMinor,
    creditMinor: Math.max(0, confirmedMinor - period.amount_due_minor),
  };
}
