const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true") === "true";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
  }
}

/** Matches the error body produced by API/main.py: { error, detail }. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, body.detail ?? response.statusText);
  }
  return response.json() as Promise<T>;
}
