/**
 * Canonical client-side types for the API routes under `app/api/`.
 * These mirror the JSON contracts returned by the server so client fetchers
 * never rely on implicitly-typed `res.json()` payloads.
 */

/**
 * Error envelope returned by every API route on failure.
 * Non-2xx responses are thrown as `ApiError` by `fetchJson`.
 */
export interface ApiErrorPayload {
  error?: string;
  message?: string;
}

/** Link summary object (the shape of every link in dashboard lists). */
export interface ApiLink {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
}

/** GET /api/links */
export interface ListLinksResponse {
  links: ApiLink[];
  count: number;
}

/** POST /api/links */
export interface CreateLinkResponse {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
}

/** GET /api/links/:id */
export interface LinkDetail {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  isActive: boolean;
  totalClicks: number;
  createdAt: string;
}

/** GET /api/links/:id/analytics */
export interface ClickRecord {
  id: string;
  clickedAt: string;
  maskedIp: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  referrer: string;
}

export interface AnalyticsResponse {
  linkId: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  deviceBreakdown: { type: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  recentClicks: ClickRecord[];
}

/** DELETE /api/links/:id */
export interface DeleteLinkResponse {
  message: string;
}

/** POST /api/auth/register */
export interface RegisterResponse {
  message: string;
}

/**
 * Thrown by `fetchJson` for any non-2xx response. `message` is the server's
 * error message (or a fallback); `code` is the machine-readable error code.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Typed fetch for the app's JSON API: parses the body as `T` on success and
 * throws `ApiError` with the server's message on any non-2xx response.
 * Network failures surface as `ApiError` too (status 0), so callers have a
 * single error type to handle.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new ApiError("Failed to connect to the server. Check your connection.", 0);
  }

  const data = (await res.json().catch(() => ({}))) as Partial<T> &
    Partial<ApiErrorPayload>;

  if (!res.ok) {
    throw new ApiError(data.message || "Request failed.", res.status, data.error);
  }

  return data as T;
}