/**
 * Request origin / host helpers.
 *
 * Never trust client-supplied `x-forwarded-*` headers (attackers can inject
 * arbitrary hosts and poison generated short URLs). When `APP_DOMAIN` is set
 * (production) it is always used; otherwise fall back to the `host` header.
 */

/**
 * Single source of truth for the application's configured domain.
 * Returns the trimmed `APP_DOMAIN` env value, or `null` when unset so callers
 * can apply their own (server-only) fallback.
 */
export function getAppDomain(): string | null {
  const appDomain = process.env.APP_DOMAIN?.trim();
  return appDomain && appDomain.length > 0 ? appDomain : null;
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