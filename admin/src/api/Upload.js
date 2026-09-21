const BASE_URL = import.meta.env.VITE_API_URL;

// Upload image
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  return res.json(); // expected: { url: "https://..." }
}
