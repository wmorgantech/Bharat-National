import { apiBaseUrl, apiFetch, handleUnauthorized } from "./http";

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

export async function createPaymentOrder(checkoutIntentId) {
  const response = await apiFetch(`${apiBaseUrl()}/payment/create-order`, {
    method: "POST",
    body: JSON.stringify({ checkoutIntentId }),
  });

  return handleResponse(response);
}

export async function verifyPayment(payment) {
  const response = await apiFetch(`${apiBaseUrl()}/payment/verify`, {
    method: "POST",
    body: JSON.stringify(payment),
  });

  return handleResponse(response);
}