// src/api/http.js
// Shared helpers for authenticated admin API calls.

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
 * Clears the stored session and returns to the login screen when the API
 * rejects the token (expired, revoked, or signed with a rotated secret).
 */
export function handleUnauthorized(response) {
  if (response.status !== 401) return;

  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("isAdminLoggedIn");
  } catch {
    // ignore storage errors
  }

  if (!window.location.pathname.endsWith("/login")) {
    window.location.href = "/admin/login";
  }
}
