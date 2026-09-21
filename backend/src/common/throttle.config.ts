/**
 * Central rate-limiting configuration.
 *
 * NOTE: in @nestjs/throttler v5+ `ttl` is expressed in MILLISECONDS
 * (it was seconds in v4). All values below are milliseconds.
 *
 * Two named throttlers run on every request:
 *   - `short` guards against bursts (per minute)
 *   - `long`  guards against slow, sustained attempts (per 15 minutes)
 *
 * Routes tighten these with @Throttle(...) using the presets at the bottom.
 */

const MINUTE = 60_000;
const FIFTEEN_MINUTES = 15 * MINUTE;
const HOUR = 60 * MINUTE;

export const THROTTLE_SHORT = 'short';
export const THROTTLE_LONG = 'long';

/** Global defaults, applied to every route unless overridden. */
export const THROTTLER_CONFIG = [
  { name: THROTTLE_SHORT, ttl: MINUTE, limit: 100 },
  { name: THROTTLE_LONG, ttl: FIFTEEN_MINUTES, limit: 1000 },
];

/**
 * Pass this to @SkipThrottle to exempt a route from every throttler.
 *
 * A bare @SkipThrottle() is NOT equivalent: it defaults to `{ default: true }`,
 * which only skips a throttler literally named "default". Because the
 * throttlers here are named, each one has to be listed explicitly.
 */
export const SKIP_ALL_THROTTLES = {
  [THROTTLE_SHORT]: true,
  [THROTTLE_LONG]: true,
};

/**
 * Login: two-tier. Deliberately more forgiving than typical hardening advice
 * because a large share of Indian mobile traffic shares public IPs via CGNAT,
 * so a harsh per-IP limit would lock out unrelated legitimate customers.
 */
export const LOGIN_THROTTLE = {
  [THROTTLE_SHORT]: { limit: 5, ttl: MINUTE },
  [THROTTLE_LONG]: { limit: 20, ttl: FIFTEEN_MINUTES },
};

/** Admin login: the highest-value credential, and few legitimate admins. */
export const ADMIN_LOGIN_THROTTLE = {
  [THROTTLE_SHORT]: { limit: 5, ttl: MINUTE },
  [THROTTLE_LONG]: { limit: 5, ttl: FIFTEEN_MINUTES },
};

/** Signup: blocks mass account creation. */
export const SIGNUP_THROTTLE = {
  [THROTTLE_SHORT]: { limit: 3, ttl: MINUTE },
  [THROTTLE_LONG]: { limit: 5, ttl: HOUR },
};

/** Contact form: spam prevention (also shields the mail transport). */
export const CONTACT_THROTTLE = {
  [THROTTLE_SHORT]: { limit: 2, ttl: MINUTE },
  [THROTTLE_LONG]: { limit: 3, ttl: HOUR },
};

/** Admin provisioning: already role-gated; this is defence in depth. */
export const ADMIN_REGISTER_THROTTLE = {
  [THROTTLE_SHORT]: { limit: 3, ttl: MINUTE },
  [THROTTLE_LONG]: { limit: 5, ttl: HOUR },
};
