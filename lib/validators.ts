/**
 * URL Validators and Scheme Whitelist
 * Enforces security constraints based on TechSpec Section 6.2 & PRD Section 13.1
 */

const ALLOWED_SCHEMES = ["http:", "https:"];
export const MAX_URL_LENGTH = 2048;

export interface ValidationResult {
  valid: boolean;
  error?: "INVALID_URL_FORMAT" | "DISALLOWED_SCHEME" | "URL_TOO_LONG" | "EMPTY_URL";
  message?: string;
  normalizedUrl?: string;
}

/**
 * Validates original long URL for security, length, and valid HTTP/HTTPS scheme.
 */
export function validateOriginalUrl(input: unknown): ValidationResult {
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return {
      valid: false,
      error: "EMPTY_URL",
      message: "URL tidak boleh kosong.",
    };
  }

  const trimmed = input.trim();

  // Edge case #3: URL length constraint
  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      valid: false,
      error: "URL_TOO_LONG",
      message: `URL terlalu panjang, maksimal ${MAX_URL_LENGTH} karakter.`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "INVALID_URL_FORMAT",
      message: "Format URL tidak valid. Pastikan menyertakan http:// atau https://",
    };
  }

  // Scheme check (whitelisting only http: and https:)
  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    return {
      valid: false,
      error: "DISALLOWED_SCHEME",
      message: "Hanya protokol http:// dan https:// yang diizinkan.",
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  };
}
