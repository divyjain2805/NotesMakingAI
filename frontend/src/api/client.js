const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "notesmakingai-token";

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && getAuthToken()) {
      clearAuthToken();
      window.dispatchEvent(new Event("notesmakingai:unauthorized"));
    }
    const message =
      data.message || data.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function authenticatedFetch(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return parseJsonResponse(response);
}

export async function registerAccount(email, password) {
  const data = await parseJsonResponse(
    await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
  );
  window.localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function signIn(email, password) {
  const data = await parseJsonResponse(
    await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
  );
  window.localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  const data = await authenticatedFetch("/api/auth/me");
  return data.user;
}

export async function fetchNotes() {
  const data = await authenticatedFetch("/api/notes");

  if (!data.success) {
    throw new Error(data.message || "Could not load notes");
  }

  return data.data ?? [];
}

export async function sendAssistantQuery(query) {
  return authenticatedFetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
}
