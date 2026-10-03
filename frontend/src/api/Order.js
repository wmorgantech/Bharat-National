
import { apiBaseUrl, apiFetch, handleUnauthorized } from "./http";

// Common response handler
async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    handleUnauthorized(response);
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

/**
 * ✅ Create Order
 * POST /order
 * The server takes ownership from the auth token; any userId in the payload is ignored.
 */
export async function createOrder(payload) {
  const res = await apiFetch(`${apiBaseUrl()}/order`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * ✅ Get the signed-in user's orders
 * GET /order
 */
export async function getOrders() {
  const res = await apiFetch(`${apiBaseUrl()}/order`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Orders by User
 * GET /order?userId=1
 * Server-side this is always scoped to the authenticated user.
 */
export async function getOrdersByUser(userId) {
  const res = await apiFetch(`${apiBaseUrl()}/order?userId=${userId}`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Active Orders (admin-only server-side)
 * GET /order/active
 */
export async function getActiveOrders() {
  const res = await apiFetch(`${apiBaseUrl()}/order/active`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Single Order
 * GET /order/:id
 */
export async function getOrderById(id) {
  const res = await apiFetch(`${apiBaseUrl()}/order/${id}`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Update Order (admin-only server-side)
 * PATCH /order/:id
 */
export async function updateOrder(id, updates) {
  const res = await apiFetch(`${apiBaseUrl()}/order/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return handleResponse(res);
}

/**
 * ✅ Delete (Soft Delete) — admin-only server-side
 * DELETE /order/:id
 */
export async function deleteOrder(id) {
  const res = await apiFetch(`${apiBaseUrl()}/order/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}

export const getLastOrderForUser = async (userId) => {
  const res = await apiFetch(`${apiBaseUrl()}/order/last?userId=${userId}`, {
    method: 'GET',
  });
  return handleResponse(res);
};
