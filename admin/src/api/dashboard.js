// src/api/dashboard.js
const API_URL = import.meta.env.VITE_API_URL;

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

export async function getDashboardStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLast3DaysRevenue() {
  const res = await fetch(`${API_URL}/dashboard/revenue/last-3-days`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLast30DaysStats() {
  const res = await fetch(`${API_URL}/dashboard/stats/last-30-days`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getLatestOrders() {
  const res = await fetch(`${API_URL}/dashboard/orders/latest`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getTopSellingProducts() {
  const res = await fetch(`${API_URL}/dashboard/products/top-selling`, {
    method: "GET",
  });
  return handleResponse(res);
}