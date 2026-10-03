import { apiBaseUrl, apiFetch } from "./http";

// Upload image (admin only; the browser sets the multipart boundary itself,
// so only the Authorization header is added here)
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiFetch(`${apiBaseUrl()}/upload/image`, {
    method: "POST",
    body: formData,
  });

  return res.json(); // expected: { url: "https://..." }
}
