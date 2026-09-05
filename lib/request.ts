/**
 * Request origin / host helpers.
 *
 * Never trust client-supplied `x-forwarded-*` headers (attackers can inject
 * arbitrary hosts and poison generated short URLs). When `APP_DOMAIN` is set
 * (production) it is always used; otherwise fall back to the `host` header.
 */

export function getBaseUrl(req: Request): string {
  const appDomain = process.env.APP_DOMAIN?.trim();
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