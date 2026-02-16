const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data.error ? `${data.message || "Request failed"}: ${data.error}` : (data.message || "Request failed");
    throw new Error(message);
  }

  return res.json();
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function me(token) {
  return request("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function dashboardSummary(token) {
  return request("/dashboard/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getUsers(token) {
  return request("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createUser(token, payload) {
  return request("/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function getRoles(token) {
  return request("/roles", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createRole(token, payload) {
  return request("/roles", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function updateProfile(token, payload) {
  return request("/users/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
