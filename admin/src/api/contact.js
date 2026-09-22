// src/api/contact.js
import { apiFetch, handleUnauthorized } from "./http";

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
 * Get all contact enquiries (admin only)
 * GET /contact
 *
 * Unlike /category and /brand, this endpoint wraps its payload:
 *   { message: "All contacts", data: [...] }
 * so the array is unwrapped here and callers get a plain list.
 */
export async function getContacts() {
  const res = await apiFetch(`${API_URL}/contact`, {
    method: "GET",
  });

  const result = await handleResponse(res);
  return result?.data ?? [];
}
