const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const TOKEN = localStorage.getItem("authToken");

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
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
  const body = await request(`/api/group_participant/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body?.data || body;
}

export async function update(id, payload) {
  const body = await request(`/api/group_participant/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return body?.data || body;
}

export async function remove(id) {
  if (!id) throw new Error("ID is required for delete");
  const body = await request(`/api/group_participant/${id}`, {
    method: "DELETE",
  });
  return body?.data || body;
}

export async function getAll() {
  const body = await request(`/api/group_participant/`, {
    method: "GET",
  });
  return body?.data || body;
}

export async function getById(id) {
  const body = await request(`/api/group_participant/${id}`, {
    method: "GET",
  });
  return body?.data || body;
}

export default { create, update, remove, getAll, getById };
