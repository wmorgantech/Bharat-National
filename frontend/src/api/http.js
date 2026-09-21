// src/api/http.js
// Shared helpers for authenticated storefront API calls.

export function getAuthToken() {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
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

/**
 * Clears the stored session when the API rejects the token, so the app falls
 * back to the logged-out state instead of retrying with a dead token.
 */
export function handleUnauthorized(response) {
  if (response.status !== 401) return;

  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  } catch {
    // ignore storage errors
  }

  window.dispatchEvent(new Event("auth:logout"));
}
