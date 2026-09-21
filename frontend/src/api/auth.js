import { clearSession, setTokens } from "./http";

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
    // credentials are required for the server to set the HttpOnly refresh cookie
    const response = await fetch(`${VITE_API_URL}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // ✅ LOGIN (NEW)
  async login(mobilenumber, password) {
    const response = await fetch(`${VITE_API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobilenumber, password }),
    });

    const data = await handleResponse(response);

    // ✅ store access token & user; the refresh token is an HttpOnly cookie
    setTokens(data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  // ✅ LOGOUT (revokes the refresh token server-side, then clears local state)
  async logout() {
    try {
      // No body: the server reads and clears the refresh cookie.
      await fetch(`${VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Best effort: still clear local state below.
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
