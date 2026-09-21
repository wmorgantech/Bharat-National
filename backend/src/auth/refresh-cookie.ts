import { CookieOptions, Response } from 'express';
import { getCookieSameSite, getRefreshAbsoluteTtlDays, isProduction } from '../config/env';

/**
 * Refresh tokens live in HttpOnly cookies so page scripts cannot read them.
 *
 * The storefront and the back office get separate cookie names AND separate
 * paths. Cookies are scoped by domain, not by port, so in production both apps
 * share a site: without distinct names a shopper login would overwrite an admin
 * session in the same browser. The path scoping additionally keeps each cookie
 * away from endpoints that have no business seeing it.
 */
export const USER_REFRESH_COOKIE = 'bnc_user_rt';
export const ADMIN_REFRESH_COOKIE = 'bnc_admin_rt';

export const USER_COOKIE_PATH = '/auth';
export const ADMIN_COOKIE_PATH = '/admin';

const DAY_MS = 24 * 60 * 60 * 1000;

function baseOptions(path: string): CookieOptions {
  return {
    httpOnly: true,
    // Plain HTTP locally; TLS-only in production.
    secure: isProduction(),
    // Defaults to the safest same-site value. Production topology is not
    // confirmed yet, so this is configuration rather than a hardcoded choice.
    sameSite: getCookieSameSite(),
    path,
  };
}

export function setUserRefreshCookie(res: Response, token: string): void {
  res.cookie(USER_REFRESH_COOKIE, token, {
    ...baseOptions(USER_COOKIE_PATH),
    maxAge: getRefreshAbsoluteTtlDays() * DAY_MS,
  });
}

export function setAdminRefreshCookie(res: Response, token: string): void {
  res.cookie(ADMIN_REFRESH_COOKIE, token, {
    ...baseOptions(ADMIN_COOKIE_PATH),
    maxAge: getRefreshAbsoluteTtlDays() * DAY_MS,
  });
}

/**
 * Removal only works when the attributes match the ones used to set the
 * cookie, so both helpers reuse the same options.
 */
export function clearUserRefreshCookie(res: Response): void {
  res.clearCookie(USER_REFRESH_COOKIE, baseOptions(USER_COOKIE_PATH));
}

export function clearAdminRefreshCookie(res: Response): void {
  res.clearCookie(ADMIN_REFRESH_COOKIE, baseOptions(ADMIN_COOKIE_PATH));
}

export function readUserRefreshCookie(req: any): string | undefined {
  return req?.cookies?.[USER_REFRESH_COOKIE];
}

export function readAdminRefreshCookie(req: any): string | undefined {
  return req?.cookies?.[ADMIN_REFRESH_COOKIE];
}
