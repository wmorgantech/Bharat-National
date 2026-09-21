import { clearSession, getRefreshToken, setTokens } from "./http";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// helper
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const auth = {
  // ✅ SIGNUP
  async signup(userData) {
    const response = await fetch(`${VITE_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // ✅ LOGIN (NEW)
  async login(mobilenumber, password) {
    const response = await fetch(`${VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobilenumber, password }),
    });

    const data = await handleResponse(response);

    // ✅ store tokens & user
    setTokens(data.access_token, data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  // ✅ LOGOUT (revokes the refresh token server-side, then clears local state)
  async logout() {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Best effort: still clear local state below.
      }
    }

    clearSession();
    localStorage.removeItem("pendingCartItem");
    window.dispatchEvent(new Event("auth:logout"));
  },

  // ✅ CHECK AUTH
  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  },

  // ✅ GET USER
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};