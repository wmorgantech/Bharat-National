/**
 * Environment access helpers.
 *
 * Secrets are read through `requireEnv` so a missing value fails at startup
 * instead of silently falling back to a hardcoded default.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in your environment (see .env.example) before starting the server.`,
    );
  }

  return value.trim();
}

export function getJwtSecret(): string {
  return requireEnv('JWT_SECRET');
}

/**
 * Public base URL that uploaded images are served from.
 *
 * This is required rather than optional because the value is not just read at
 * request time - it is baked into the `url` returned by POST /upload/image,
 * which the admin panel then stores in the database. A missing value would
 * therefore persist rows reading "undefined/<filename>" that no later
 * configuration change can repair, so the server refuses to start without it.
 */
export function getUploadUrl(): string {
  return requireEnv('UPLOAD_URL');
}

/**
 * Internal mailbox that customer enquiries are forwarded to.
 *
 * Optional rather than required: an unset value only means the internal copy is
 * skipped, and the enquiry is still stored and still acknowledged to the
 * customer. Making it mandatory would stop existing deployments from booting
 * over a notification, which is a worse failure than a missing email.
 *
 * Returns undefined when unset so the caller can log and carry on.
 */
export function getCompanyNotificationEmail(): string | undefined {
  const value = process.env.COMPANY_NOTIFICATION_EMAIL?.trim();

  return value ? value : undefined;
}

/**
 * Publicly reachable URL of the BNC logo, shown at the top of outgoing mail.
 *
 * A URL rather than an attached file on purpose: the logo already exists in
 * the storefront and admin bundles, and copying it into the backend would be a
 * fourth copy of the same 130 KB image - one that would also ride along on
 * every single email as an attachment.
 *
 * Optional. Unset means mail is sent exactly as before, with the text-only
 * header, so nothing breaks in an environment that has not configured it.
 */
export function getMailLogoUrl(): string | undefined {
  const value = process.env.MAIL_LOGO_URL?.trim();

  return value ? value : undefined;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getCorsOrigins(): string[] {
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (isProduction() && origins.length === 0) {
    throw new Error('CORS_ORIGINS is required in production.');
  }

  return origins.map((origin) => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGINS must contain absolute origin URLs.');
    }

    if (
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(
        'CORS_ORIGINS entries must be origins without paths or credentials.',
      );
    }

    const hostname = parsed.hostname.toLowerCase();
    const isLocalHost =
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]';

    if (isProduction() && (parsed.protocol !== 'https:' || isLocalHost)) {
      throw new Error(
        'Production CORS_ORIGINS entries must use HTTPS and public hostnames.',
      );
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('CORS_ORIGINS entries must use HTTP or HTTPS.');
    }

    return parsed.origin;
  });
}

export function validateRazorpayKeySafety(): void {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (isProduction() && (!keyId || !keySecret)) {
    throw new Error(
      'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in production.',
    );
  }

  if (!keyId && !keySecret) return;
  if (!keyId || !keySecret) {
    throw new Error(
      'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set together.',
    );
  }

  const expectedPrefix = isProduction() ? 'rzp_live_' : 'rzp_test_';
  if (!keyId.startsWith(expectedPrefix)) {
    throw new Error(
      `RAZORPAY_KEY_ID must use a ${isProduction() ? 'live' : 'test'} Razorpay key in ${process.env.NODE_ENV ?? 'development'} environments.`,
    );
  }
}

export function validateRazorpayWebhookSecret(): void {
  if (isProduction()) {
    requireEnv('RAZORPAY_WEBHOOK_SECRET');
  }
}

/**
 * Access-token lifetime. Declared as a literal because @nestjs/jwt types
 * `expiresIn` as a template-literal union, which a plain `string` from the
 * environment does not satisfy.
 */
export const ACCESS_TOKEN_TTL = '15m';

function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw || !raw.trim()) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * SameSite policy for the refresh cookies.
 *
 * Defaults to 'strict', which is correct for the current local setup (the API
 * and both apps are all on localhost, so they are same-site despite the
 * different ports) and is the safest starting point. Production topology is
 * not confirmed yet: if the API ends up on a different registrable domain than
 * the apps, this must be set to 'none' (which additionally requires HTTPS) and
 * CSRF protection has to be added before doing so.
 */
export function getCookieSameSite(): 'strict' | 'lax' | 'none' {
  const raw = (process.env.COOKIE_SAMESITE ?? 'strict').trim().toLowerCase();

  if (raw === 'lax' || raw === 'none' || raw === 'strict') {
    return raw;
  }

  return 'strict';
}

/** Sliding lifetime of an individual refresh token, in days. */
export function getRefreshTokenTtlDays(): number {
  return positiveIntEnv('REFRESH_TOKEN_TTL_DAYS', 7);
}

/**
 * Hard ceiling for a whole rotation chain, in days. Rotation never extends it,
 * so a stolen refresh token cannot be rotated indefinitely.
 */
export function getRefreshAbsoluteTtlDays(): number {
  return positiveIntEnv('REFRESH_ABSOLUTE_TTL_DAYS', 7);
}
