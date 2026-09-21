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

    // ✅ store token & user
    localStorage.setItem("authToken", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  },

  // ✅ LOGOUT
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
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