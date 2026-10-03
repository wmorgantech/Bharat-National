
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


export async function getProducts() {
  const res = await apiFetch(`${apiBaseUrl()}/product`, {
    method: "GET",
  });
  return handleResponse(res);
}



export async function getActiveProducts() {
  const res = await apiFetch(`${apiBaseUrl()}/product/active`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getProductById(id) {
  const res = await apiFetch(`${apiBaseUrl()}/product/${id}`, {
    method: "GET",
  });
  return handleResponse(res);
}


export async function createProduct({
  name,
  description = "",
  price,
  stock,
  imageUrl,
  categoryId,
  brandId,
  isActive = true,
}) {
  const res = await apiFetch(`${apiBaseUrl()}/product`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      price,
      stock,
      imageUrl, // should be an array of strings
      categoryId,
      brandId,
      isActive,
    }),
  });

  return handleResponse(res);
}



export async function updateProduct(id, data) {
  const res = await apiFetch(`${apiBaseUrl()}/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function deleteProduct(id) {
  const res = await apiFetch(`${apiBaseUrl()}/product/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}
