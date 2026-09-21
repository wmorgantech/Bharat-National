// src/api/Order.js
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
    headers: {
      "Content-Type": "application/json",
    },
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
  });

  return handleResponse(res);
}



export async function getOrderStatusStats() {
  const res = await fetch(`${API_URL}/order/status-stats`, {
    method: "GET",
  });

  return handleResponse(res);
}

export async function getSalesStats() {
  const res = await fetch(`${API_URL}/order/stats`, {
    method: "GET",
  });

  return handleResponse(res);
}