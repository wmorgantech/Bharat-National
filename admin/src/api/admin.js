import { apiFetch, clearSession, getRefreshToken } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

export async function loginAdmin(email, password) {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
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

/** Per-device logout: revokes this device's refresh token, then clears storage. */
export async function logoutSession() {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Best effort: still clear local state below.
    }
  }

  clearSession();
}

/** Revokes every admin session, on all devices. */
export async function logoutAllSessions() {
  try {
    await apiFetch(`${API_URL}/admin/logout-all`, { method: "POST" });
  } catch {
    // Best effort: still clear local state below.
  }

  clearSession();
}
