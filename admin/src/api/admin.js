import { apiFetch, clearSession } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function loginAdmin(email, password) {
  try {
    // credentials are required for the server to set the HttpOnly refresh cookie
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let message = "Login failed";
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          message = errorData.message;
        }
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
}

/** Per-device logout: the server reads and clears the refresh cookie. */
export async function logoutSession() {
  try {
    await fetch(`${API_URL}/admin/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Best effort: still clear local state below.
  }

  clearSession();
}

/** Revokes every admin session, on all devices. */
export async function logoutAllSessions() {
  try {
    // credentials so the server can clear the refresh cookie on this device too
    await apiFetch(`${API_URL}/admin/logout-all`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Best effort: still clear local state below.
  }

  clearSession();
}
