// src/api/http.js
// Shared helpers for authenticated admin API calls.

/**
 * Base URL of the backend API.
 *
 * VITE_* values are inlined at BUILD time, not read at runtime, so a build
 * produced without this variable set bakes `undefined` into the bundle and
 * every call silently becomes `fetch("undefined/admin/login")` - a build that
 * succeeds and then fails only in the browser, with a confusing error.
 *
 * Reading it through this function instead makes the misconfiguration explicit
 * at the moment a request is attempted, and names the variable to set.
 */
export function apiBaseUrl() {
  const base = import.meta.env.VITE_API_URL;

  if (typeof base !== "string" || !base.trim()) {
    throw new Error(
      "VITE_API_URL is not set. The admin panel cannot reach the backend. " +
        "Set VITE_API_URL in the environment used for `npm run build` " +
        "(see .env.example) and rebuild.",
    );
  }

  return base.trim();
}

const ACCESS_TOKEN_KEY = "authToken";

export function getAuthToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Only the access token is stored by the app. The refresh token lives in an
 * HttpOnly cookie set by the server and is never readable from JavaScript.
 */
export function setTokens(accessToken) {
  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } catch {
    // ignore storage errors
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminLoggedIn");
  } catch {
    // ignore storage errors
  }
}

/** Authorization header merged with any extra headers. */
export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

/** JSON content type + Authorization. */
export function jsonAuthHeaders() {
  return authHeaders({ "Content-Type": "application/json" });
}

function redirectToLogin() {
  if (!window.location.pathname.endsWith("/login")) {
    window.location.href = "/admin/login";
  }
}

// ---------------------------------------------------------------------------
// Single-flight refresh
//
// Refresh tokens are single-use: the server revokes the presented token and
// issues a replacement. If several expired requests each fired their own
// refresh, all but the first would present an already-revoked token, which the
// server correctly treats as theft and responds to by killing the whole token
// family. Funnelling every concurrent 401 through one shared promise is what
// prevents that self-inflicted logout.
// ---------------------------------------------------------------------------
let refreshPromise = null;

async function requestNewAccessToken() {
  try {
    // No body: the refresh token travels as an HttpOnly cookie, which requires
    // credentials to be included on the request.
    const res = await fetch(`${apiBaseUrl()}/admin/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json();
    if (!data?.access_token) {
      clearSession();
      return null;
    }

    setTokens(data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

/** Returns a new access token, sharing one in-flight request across callers. */
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * fetch wrapper that attaches the access token and, on a 401, refreshes once
 * and replays the request.
 */
export async function apiFetch(url, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  // The browser must set its own multipart boundary, so never force a
  // Content-Type on FormData bodies.
  const baseHeaders = isFormData ? {} : { "Content-Type": "application/json" };

  const send = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...baseHeaders,
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const response = await send(getAuthToken());

  if (response.status !== 401) {
    return response;
  }

  const newToken = await refreshAccessToken();

  if (!newToken) {
    redirectToLogin();
    return response;
  }

  return send(newToken);
}

/**
 * Clears the stored session and returns to the login screen when the API
 * rejects the request even after a refresh attempt.
 */
export function handleUnauthorized(response) {
  if (response.status !== 401) return;

  clearSession();
  redirectToLogin();
}
