import { apiFetch } from "./http";

const BASE_URL = import.meta.env.VITE_API_URL;

// Upload image (admin only; the browser sets the multipart boundary itself,
// so only the Authorization header is added here)
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiFetch(`${BASE_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  return res.json(); // expected: { url: "https://..." }
}
