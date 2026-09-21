// src/api/Brand.js
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
 * Get ALL brands (active + inactive)
 * GET /brand
 */
export async function getBrands() {
  const res = await fetch(`${API_URL}/brand`, {
    method: "GET",
  });
  return handleResponse(res);
}

/**
 * Get ONLY active brands
 * GET /brand/active
 */
export async function getActiveBrands() {
  const res = await fetch(`${API_URL}/brand/active`, {
    method: "GET",
  });
  return handleResponse(res);
}

/**
 * Get single brand by id
 * GET /brand/:id
 */
export async function getBrandById(id) {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    method: "GET",
  });
  return handleResponse(res);
}

/**
 * Create a new brand
 * POST /brand
 * body: { name, imageUrl, description?, isActive? }
 */
export async function createBrand({
  name,
  imageUrl,
  description = "",
  isActive = true,
}) {
  const res = await fetch(`${API_URL}/brand`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      imageUrl,
      description,
      isActive,
    }),
  });

  return handleResponse(res);
}

/**
 * Update a brand
 * PATCH /brand/:id
 */
export async function updateBrand(id, data) {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), // e.g. { name, description, imageUrl, isActive }
  });

  return handleResponse(res);
}

/**
 * Delete / deactivate brand
 * DELETE /brand/:id
 */
export async function deleteBrand(id) {
  const res = await fetch(`${API_URL}/brand/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}
