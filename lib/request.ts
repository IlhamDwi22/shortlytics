/**
 * Request origin / host helpers.
 *
 * Never trust client-supplied `x-forwarded-*` headers (attackers can inject
 * arbitrary hosts and poison generated short URLs). When `APP_DOMAIN` is set
 * (production) it is always used; otherwise fall back to the `host` header.
 */

/**
 * Single source of truth for the application's configured domain.
 * `NEXT_PUBLIC_APP_DOMAIN` is the canonical var (used by both client & server),
 * ensuring the value can never drift between them. The legacy `APP_DOMAIN`
 * is kept as a silent fallback for backward-compatible configs.
 */
export function getAppDomain(): string | null {
  const domain =
    process.env.NEXT_PUBLIC_APP_DOMAIN?.trim() ||
    process.env.APP_DOMAIN?.trim();
  return domain && domain.length > 0 ? domain : null;
}

export function getBaseUrl(req: Request): string {
  const appDomain = getAppDomain();
  if (appDomain) {
    return `https://${appDomain}`;
  }

  const host = req.headers.get("host")?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const scheme =
    forwardedProto === "https"
      ? "https"
      : host?.includes("localhost") || host?.startsWith("127.")
        ? "http"
        : "https";

  return `${scheme}://${host || "localhost:3000"}`;
}

export function getShortUrl(req: Request, path: string): string {
  return `${getBaseUrl(req)}/${path}`;
}