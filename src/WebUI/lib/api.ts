import { getToken } from "@/lib/auth";

export const GATEWAY_BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, payload: unknown) {
    super(`API Error (${status})`);
    this.status = status;
    this.payload = payload;
  }
}

async function parseJsonSafely(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${GATEWAY_BASE_URL}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (init.auth !== false) {
    const token = typeof window === "undefined" ? null : getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    throw new ApiError(res.status, await parseJsonSafely(res));
  }
  return (await parseJsonSafely(res)) as T;
}

