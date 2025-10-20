const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem("authToken");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
      ...(opts.headers || {}),
    },
    ...opts,
  });

  const bodyText = await res.text();
  let body = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  if (!res.ok) {
    const message = (body && (body.message || body.error || JSON.stringify(body))) || res.statusText;
    throw new Error(message);
  }

  return body;
}

export async function create(payload) {
  const body = await request(`/api/contact/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body?.data || body;
}

export async function update(id, payload) {
  const body = await request(`/api/contact/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return body?.data || body;
}

export async function remove(id) {
  if (!id) throw new Error("ID is required for delete");
  const body = await request(`/api/contact/${id}`, {
    method: "DELETE",
  });
  return body?.data || body;
}

export async function getAll() {
  const body = await request(`/api/contact/`, {
    method: "GET",
  });
  return body?.data || body;
}

export async function getById(id) {
  const body = await request(`/api/contact/${id}`, {
    method: "GET",
  });
  return body?.data || body;
}

export default { create, update, remove, getAll, getById };
