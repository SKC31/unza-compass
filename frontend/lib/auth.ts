/**
 * Client-side storage of the admin JWT. The token itself is issued and
 * verified entirely by the backend (see backend/auth.py) — this module
 * just persists it in the browser between page loads.
 */
const TOKEN_KEY = "unza_compass_admin_token";
const EMAIL_KEY = "unza_compass_admin_email";

export function setToken(token: string, email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
