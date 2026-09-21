
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

 
export async function getProducts() {
  const res = await fetch(`${API_URL}/product`, {
    method: "GET",
  });
  return handleResponse(res);
}



export async function getActiveProducts() {
  const res = await fetch(`${API_URL}/product/active`, {
    method: "GET",
  });
  return handleResponse(res);
}

export async function getProductById(id) {
  const res = await fetch(`${API_URL}/product/${id}`, {
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
  const res = await fetch(`${API_URL}/product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const res = await fetch(`${API_URL}/product/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/product/${id}`, {
    method: "DELETE",
  });

  return handleResponse(res);
}
