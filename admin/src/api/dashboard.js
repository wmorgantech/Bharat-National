// src/api/dashboard.js
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
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function getDashboardStats() {
  const res = await apiFetch(`${apiBaseUrl()}/dashboard/stats`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLast3DaysRevenue() {
  const res = await apiFetch(`${apiBaseUrl()}/dashboard/revenue/last-3-days`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLast30DaysStats() {
  const res = await apiFetch(`${apiBaseUrl()}/dashboard/stats/last-30-days`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLatestOrders() {
  const res = await apiFetch(`${apiBaseUrl()}/dashboard/orders/latest`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getTopSellingProducts() {
  const res = await apiFetch(`${apiBaseUrl()}/dashboard/products/top-selling`, {
    method: "GET",
  });
  return handleResponse(res);
}
