
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
 * Get ALL categories (active + inactive)
 * GET /category
 */
export async function getCategories() {
  const res = await fetch(`${API_URL}/category`, {
    method: "GET",
  });
  return handleResponse(res);
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

/**
 * Create a new category
 * POST /category
 * body: { name, imageUrl, description?, isActive? }
 */
export async function createCategory({ name, imageUrl, description = "", isActive = true }) {
  const res = await fetch(`${API_URL}/category`, {
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
 * Update a category
 * PATCH /category/:id
 */
export async function updateCategory(id, data) {
  const res = await fetch(`${API_URL}/category/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), // e.g. { name, description, isActive }
  });

  return handleResponse(res);
}

/**
 * Delete / deactivate category
 * DELETE /category/:id
 */
export async function deleteCategory(id) {
  const res = await fetch(`${API_URL}/category/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}
