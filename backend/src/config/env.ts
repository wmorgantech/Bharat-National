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

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
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
