import { apiFetch, handleUnauthorized } from "./http";

const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(data?.message || data?.error || "Payment request failed");
  }

  return data;
}

export async function createPaymentOrder(orderId) {
  const response = await apiFetch(`${API_URL}/payment/create-order`, {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

  return handleResponse(response);
}

export async function verifyPayment(payment) {
  const response = await apiFetch(`${API_URL}/payment/verify`, {
    method: "POST",
    body: JSON.stringify(payment),
  });

  return handleResponse(response);
}