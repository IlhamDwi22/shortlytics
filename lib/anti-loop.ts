/**
 * Anti-Loop and Self-Referential Shortener Detection
 * Prevents infinite redirect loops and shortener chaining based on TechSpec Section 6.3 & PRD Section 13.2
 */

const BLOCKED_SHORTENER_DOMAINS = [
  "bit.ly",
  "tinyurl.com",
  "is.gd",
  "t.co",
  "ow.ly",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "bl.ink",
  "shorturl.at",
  "goo.gl",
  "v.gd",
  "rb.gy",
];

/**
 * Checks if the provided URL is from our own domain or from a blocked third-party shortener.
 */
export function isSelfReferentialOrShortener(originalUrl: string): boolean {
  try {
    const parsed = new URL(originalUrl);
    const hostname = parsed.hostname.toLowerCase();

    // 1. Check against own application domain
    const ownDomain = (process.env.APP_DOMAIN || "shortlytics.app").toLowerCase();
    if (
      hostname === ownDomain ||
      hostname.endsWith(`.${ownDomain}`) ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      return true;
    }

    // 2. Check against blocked external shorteners
    return BLOCKED_SHORTENER_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    // If parsing fails, it's invalid so treat as non-shortener (validators.ts will catch format error)
    return false;
  }
}
