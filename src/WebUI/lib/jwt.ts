export type JwtClaims = {
  sub?: string;
  unique_name?: string;
  role?: string | string[];
  exp?: number;
};

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
  );
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, clockSkewSeconds = 60): boolean {
  const claims = decodeJwt(token);
  const exp = claims?.exp;
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + clockSkewSeconds;
}

