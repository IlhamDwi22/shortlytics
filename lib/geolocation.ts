/**
 * IP Geolocation Resolver Utility
 * Resolves approximate Country and City from visitor IP address (TechSpec Section 3 & 8)
 */

export interface GeolocationResult {
  country: string;
  city: string;
}

const LOCAL_IPS = new Set(["127.0.0.1", "::1", "localhost", "::ffff:127.0.0.1"]);

/**
 * Resolves approximate geolocation from IP with timeout protection.
 * Redirect must never hang if geolocation API is slow or unavailable.
 */
export async function resolveGeolocation(
  ip: string,
  timeoutMs: number = 1500
): Promise<GeolocationResult> {
  const cleanIp = ip.trim();

  // Local/Private IP check
  if (
    LOCAL_IPS.has(cleanIp) ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.16.") ||
    cleanIp === "unknown"
  ) {
    return {
      country: "Local Network",
      city: "Localhost",
    };
  }

  const token = process.env.IPINFO_API_TOKEN;
  const endpoint = token
    ? `https://ipinfo.io/${cleanIp}/json?token=${token}`
    : `https://ip-api.com/json/${cleanIp}?fields=country,city,status`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // Cache response for 24h
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { country: "Unknown", city: "Unknown" };
    }

    const data = await res.json();

    if (token) {
      // ipinfo.io response format
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown",
      };
    } else {
      // ip-api.com response format
      if (data.status === "fail") {
        return { country: "Unknown", city: "Unknown" };
      }
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown",
      };
    }
  } catch {
    // Graceful fallback on network/timeout error
    return {
      country: "Unknown",
      city: "Unknown",
    };
  }
}
