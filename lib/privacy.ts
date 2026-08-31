/**
 * Privacy Utilities — IP Address Masking
 * Ensures visitor IP addresses are never exposed raw on client interfaces (TechSpec Section 6.5 & PRD Section 13.5)
 */

/**
 * Masks raw IP address for privacy compliance in analytics.
 * IPv4: 192.168.1.100 -> 192.168.1.xxx
 * IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 2001:0db8:85a3:xxxx:xxxx:xxxx:xxxx:xxxx
 */
export function maskIp(ip: string | null | undefined): string {
  if (!ip || typeof ip !== "string") {
    return "xxx.xxx.xxx.xxx";
  }

  const cleanIp = ip.trim();

  // Handle localhost
  if (cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp === "localhost") {
    return "127.0.0.xxx";
  }

  // IPv4 format
  const ipv4Parts = cleanIp.split(".");
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.xxx`;
  }

  // IPv6 format
  const ipv6Parts = cleanIp.split(":");
  if (ipv6Parts.length >= 3) {
    return `${ipv6Parts.slice(0, 3).join(":")}:xxxx:xxxx:xxxx:xxxx:xxxx`;
  }

  return "xxx.xxx.xxx.xxx";
}

/**
 * Extracts client IP address from Next.js Request headers.
 */
export function extractClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Return first IP if comma-separated proxy list
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "127.0.0.1";
}
