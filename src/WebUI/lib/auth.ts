import { decodeJwt, isJwtExpired } from "@/lib/jwt";

const TOKEN_KEY = "pulsenet.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getSession() {
  const token = getToken();
  if (!token) return null;
  if (isJwtExpired(token)) {
    clearToken();
    return null;
  }
  const claims = decodeJwt(token);
  if (!claims?.sub) return null;
  return {
    token,
    userId: claims.sub,
    username: claims.unique_name ?? null,
    role: claims.role ?? null,
  };
}

