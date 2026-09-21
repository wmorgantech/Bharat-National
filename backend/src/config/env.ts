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
