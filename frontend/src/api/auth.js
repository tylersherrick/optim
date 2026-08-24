const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/** POST /users/register — username/password signup */
export function registerUser({ username, password, name, email }) {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, password, name, email }),
  });
}

/** POST /users/login — username or email/password login */
export function loginUser({ username, password }) {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}