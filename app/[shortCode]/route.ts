import { NextResponse, after } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { redirectRateLimit } from "@/lib/rate-limit";
import { extractClientIp, maskIp } from "@/lib/privacy";
import { parseClientDetails } from "@/lib/user-agent";
import { resolveGeolocation } from "@/lib/geolocation";

const RESERVED_PATHS = new Set([
  "404",
  "api",
  "login",
  "register",
  "dashboard",
  "links",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
]);

/**
 * Core Public Redirect Handler
 * GET /:shortCode
 * Redirects visitor to destination URL (<300ms) and records analytics asynchronously.
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await props.params;

    // 1. Reserved keyword check (exact match — generated codes are mixed-case
    //    base62, so "/API" must be allowed even though "/api" is reserved)
    if (!shortCode || RESERVED_PATHS.has(shortCode)) {
      return new Response("Not Found", { status: 404 });
    }

    const ip = extractClientIp(req);

    // 2. Rate Limiting Check (100 requests / minute)
    const { success, reset } = await redirectRateLimit.limit(ip);
    if (!success) {
      return new Response(
        `Rate limit exceeded. Please try again in ${reset} seconds.`,
        {
          status: 429,
          headers: {
            "Retry-After": reset.toString(),
            "Content-Type": "text/plain",
          },
        }
      );
    }

    // 3. Find Active Link
    const link = await prisma.link.findUnique({
      where: {
        shortCode,
        isActive: true,
      },
      select: {
        id: true,
        originalUrl: true,
      },
    });

    // 4. If link not found, render the app 404 page
    if (!link) {
      notFound();
    }

    // 5. Asynchronous Click Metrics Recording (Non-blocking to preserve <300ms SLA)
    const clientDetails = parseClientDetails(req);

    // Schedule click logging with after() so it always completes before the
    // serverless instance is frozen — never a fire-and-forget IIFE.
    after(async () => {
      try {
        const geo = await resolveGeolocation(ip, 1200);
        await prisma.click.create({
          data: {
            linkId: link.id,
            // Privacy by default: raw IP is used only for the in-flight
            // geolocation lookup and is NEVER persisted — store masked-only.
            ipAddress: maskIp(ip),
            country: geo.country,
            city: geo.city,
            deviceType: clientDetails.deviceType,
            browser: clientDetails.browser,
            referrer: clientDetails.referrer,
          },
        });
      } catch (err) {
        console.error(`Click logging error for shortCode [${shortCode}]:`, err);
      }
    });

    // 6. Return Fast HTTP 302 Redirect with no-cache headers
    return NextResponse.redirect(link.originalUrl, {
      status: 302,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    // `notFound()` throws NEXT_HTTP_ERROR_FALLBACK;404 — must propagate, not
    // swallow it (otherwise every missing short code becomes a 500).
    if (error instanceof Error && "digest" in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK;404")) {
        throw error;
      }
    }
    console.error("Redirect Handler Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
