// src/api/Product.js
import { apiBaseUrl } from "./http";

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
 * ✅ Get ONLY ACTIVE products
 * GET /product/active
 */
export async function getActiveProducts() {
  const res = await fetch(`${apiBaseUrl()}/product/active`, {
    method: "GET",
  });
  return handleResponse(res);
}


/**
 * ✅ Get LIMITED products (e.g. latest 10 for homepage)
 * GET /product/limit
 */
export async function getLimitedProducts() {
  const res = await fetch(`${apiBaseUrl()}/product/limit`, {
    method: "GET",
  });

  return handleResponse(res);
}


/**
 * ✅ Get single product by id
 * GET /product/:id
 */
export async function getProductById(id) {
  const res = await fetch(`${apiBaseUrl()}/product/${id}`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getProductsByCategory(categoryId) {
  const res = await fetch(`${apiBaseUrl()}/product/category/${categoryId}`, {
    method: "GET",
  });
  return handleResponse(res);
}

