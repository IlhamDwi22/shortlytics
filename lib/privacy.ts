/**
 * Privacy Utilities — IP Address Masking
 * Ensures visitor IP addresses are never exposed raw on client interfaces (TechSpec Section 6.5 & PRD Section 13.5)
 */

/**
 * Returns true for private / reserved / loopback addresses so that these are
 * never sent to external geolocation providers and never trusted as a real
 * client IP. Covers IPv4 (RFC 1918, loopback, link-local, CGNAT, 0.0.0.0) and
 * IPv6 (loopback, ULA fc00::/7, link-local fe80::/10, IPv4-mapped).
 */
export function isPrivateIp(ip: string): boolean {
  const clean = ip.trim().toLowerCase();
  if (!clean || clean === "localhost" || clean === "unknown") return true;

  // IPv4-mapped IPv6 — normalize to the embedded IPv4 before classification.
  const v4Mapped = clean.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const v4 = v4Mapped ? v4Mapped[1] : "";

  if (v4.includes(".") || (clean.includes(".") && !clean.includes(":"))) {
    const parts = (v4 || clean).split(".").map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  const ipv6 = clean.replace(/^::ffff:/, "");
  if (ipv6 === "::1" || ipv6 === "::" || ipv6 === "::0") return true;
  // Unique Local Address (fc00::/7)
  if (ipv6.startsWith("fc") || ipv6.startsWith("fd")) return true;
  // Link-local (fe80::/10)
  if (
    ipv6.startsWith("fe8") ||
    ipv6.startsWith("fe9") ||
    ipv6.startsWith("fea") ||
    ipv6.startsWith("feb")
  ) {
    return true;
  }

  return false;
}

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

  // IPv4-mapped IPv6
  const v4Mapped = cleanIp.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Mapped) {
    const parts = v4Mapped[1].split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
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
 *
 * `x-forwarded-for` is client-supplied and can be spoofed (the platform proxy
 * appends the real client IP, but attackers can add their own prefix entries).
 * We therefore prefer the rightmost non-private entry — the one appended by
 * the closest trusted proxy — and never return a private/spoofable address.
 */
export function extractClientIp(req: Request): string {
  const candidates: string[] = [];

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    for (const part of forwarded.split(",")) candidates.push(part.trim());
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) candidates.push(realIp.trim());
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) candidates.push(cfIp.trim());

  // Rightmost public address first (closest to the trusted edge proxy).
  for (let i = candidates.length - 1; i >= 0; i--) {
    const c = candidates[i];
    if (c && !isPrivateIp(c)) return c;
  }
  // Fall back to any candidate, then to localhost.
  for (const c of candidates) {
    if (c) return c;
  }
  return "127.0.0.1";
}
