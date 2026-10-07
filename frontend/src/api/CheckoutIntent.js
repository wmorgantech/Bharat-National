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
    throw new Error(data?.message || data?.error || "Checkout request failed");
  }

  return data;
}

export async function createCheckoutIntent(payload) {
  const response = await apiFetch(`${apiBaseUrl()}/checkout-intents`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}
