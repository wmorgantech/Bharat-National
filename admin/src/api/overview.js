// src/api/overview.js
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

/**
 * Get all overview data (stats + activity + top performers)
 * GET /overview/all
 */
export async function getOverviewData() {
  const res = await fetch(`${API_URL}/overview/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}

/**
 * Get overview statistics only
 * GET /overview/stats
 */
export async function getOverviewStats() {
  const res = await fetch(`${API_URL}/overview/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}

/**
 * Get recent activity only
 * GET /overview/activity
 */
export async function getRecentActivity() {
  const res = await fetch(`${API_URL}/overview/activity`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}

/**
 * Get top performing products only
 * GET /overview/top-performers
 */
export async function getTopPerformers() {
  const res = await fetch(`${API_URL}/overview/top-performers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}

/**
 * Get total revenue summary
 * GET /overview/revenue
 */
export async function getTotalRevenue() {
  const res = await fetch(`${API_URL}/overview/revenue`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}

/**
 * Get monthly chart data
 * GET /overview/chart
 */
export async function getChartData() {
  const res = await fetch(`${API_URL}/overview/chart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await handleResponse(res);
  return result.data || result;
}