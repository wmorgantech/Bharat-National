
import { apiBaseUrl } from "./http";


async function parseResponse(res) {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ✅ POST /contact
export async function createContact(payload) {
  const res = await fetch(`${apiBaseUrl()}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}


export async function getContacts() {
  const res = await fetch(`${apiBaseUrl()}/contact`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(res);
}
