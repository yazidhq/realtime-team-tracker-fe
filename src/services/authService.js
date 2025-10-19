const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
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

export async function login({ email, password }) {
  const body = await request(`/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) });
  const payload = body?.data || body;
  return payload;
}

export async function register(payload) {
  const body = await request(`/api/auth/register`, { method: "POST", body: JSON.stringify(payload) });
  return body?.data || body;
}

export async function refreshToken(refresh_token) {
  const body = await request(`/api/auth/refresh_token`, { method: "POST", body: JSON.stringify({ refresh_token }) });
  return body?.data || body;
}

export default { login, register, refreshToken };
