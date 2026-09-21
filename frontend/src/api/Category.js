const API_URL = import.meta.env.VITE_API_URL;

/**
 * Handle fetch responses in one place
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
 * Get ONLY active categories
 * GET /category/active
 */
export async function getActiveCategories() {
  const res = await fetch(`${API_URL}/category/active`, {
    method: "GET",
  });
  return handleResponse(res);
}

/**
 * Get single category by id
 * GET /category/:id
 */
export async function getCategoryById(id) {
  const res = await fetch(`${API_URL}/category/${id}`, {
    method: "GET",
  });
  return handleResponse(res);
}

