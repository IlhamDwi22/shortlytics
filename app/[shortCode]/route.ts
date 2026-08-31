import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redirectRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/privacy";
import { parseClientDetails } from "@/lib/user-agent";
import { resolveGeolocation } from "@/lib/geolocation";

const RESERVED_PATHS = new Set([
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

    // 1. Reserved keyword check
    if (!shortCode || RESERVED_PATHS.has(shortCode.toLowerCase())) {
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

    // 4. If link not found, return 404
    if (!link) {
      const notFoundUrl = new URL("/404", req.url);
      return NextResponse.redirect(notFoundUrl, { status: 302 });
    }

    // 5. Asynchronous Click Metrics Recording (Non-blocking to preserve <300ms SLA)
    const clientDetails = parseClientDetails(req);

    // Perform geolocation lookup and DB record creation in background
    (async () => {
      try {
        const geo = await resolveGeolocation(ip, 1200);
        await prisma.click.create({
          data: {
            linkId: link.id,
            ipAddress: ip,
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
    })();

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
    console.error("Redirect Handler Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
