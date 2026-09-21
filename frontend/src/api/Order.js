
const API_URL = import.meta.env.VITE_API_URL;

// Common response handler
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
 * ✅ Create Order
 * POST /order
 */
export async function createOrder(payload) {
  const res = await fetch(`${API_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * ✅ Get All Orders (Admin)
 * GET /order
 */
export async function getOrders() {
  const res = await fetch(`${API_URL}/order`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Orders by User
 * GET /order?userId=1
 */
export async function getOrdersByUser(userId) {
  const res = await fetch(`${API_URL}/order?userId=${userId}`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Active Orders
 * GET /order/active
 */
export async function getActiveOrders() {
  const res = await fetch(`${API_URL}/order/active`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Get Single Order
 * GET /order/:id
 */
export async function getOrderById(id) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "GET",
  });

  return handleResponse(res);
}

/**
 * ✅ Update Order
 * PATCH /order/:id
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
 * ✅ Delete (Soft Delete)
 * DELETE /order/:id
 */
export async function deleteOrder(id) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}

export const getLastOrderForUser = async (userId) => {
  const res = await fetch(`${API_URL}/order/last?userId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
};