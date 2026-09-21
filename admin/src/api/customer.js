// src/api/Order.js
import { authHeaders, handleUnauthorized, jsonAuthHeaders } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Common response handler
 */
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
 * ✅ Get ALL orders (active)
 * GET /order
 */
export async function getOrders() {
  const res = await fetch(`${API_URL}/order`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * ✅ Get single order by id
 * GET /order/:id
 */
export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * ✅ Update order
 * PATCH /order/:id
 * body: { ...updates }
 */
export async function updateOrder(id, updates) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "PATCH",
    headers: jsonAuthHeaders(),
    body: JSON.stringify(updates),
  });

  return handleResponse(res);
}

/**
 * ✅ Delete order
 * DELETE /order/:id
 */
export async function deleteOrder(id) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse(res);
}


export async function getUserStats() {
  const res = await fetch(`${API_URL}/user/stats`, {
    method: "GET",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function getValidOrders() {
  const res = await fetch(`${API_URL}/order/valid`, {
    method: "GET",
    headers: authHeaders(),
  });

  return handleResponse(res);
}

export async function getAllUsersWithOrderStats() {
  const res = await fetch(`${API_URL}/order/users/all`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
