import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { maskIp } from "@/lib/privacy";

/**
 * GET /api/links/:id/analytics
 * Retrieve detailed analytics and breakdown for a link (TechSpec Section 5.2).
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Anda harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    // 2. Fetch Link and Verify Ownership (IDOR Protection)
    const link = await prisma.link.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        shortCode: true,
        originalUrl: true,
        createdAt: true,
      },
    });

    if (!link) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Link tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Anda tidak memiliki akses ke data analitik link ini.",
        },
        { status: 403 }
      );
    }

    // 3. Fetch Click Records
    const clicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { clickedAt: "desc" },
    });

    const totalClicks = clicks.length;

    // 4. Compute Daily Clicks (Grouped by YYYY-MM-DD in chronological order)
    const dayMap = new Map<string, number>();
    for (const click of clicks) {
      const dateStr = click.clickedAt.toISOString().split("T")[0];
      dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
    }

    const clicksByDay = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Compute Device Breakdown
    const deviceMap = new Map<string, number>();
    for (const click of clicks) {
      const dev = click.deviceType || "desktop";
      deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);
    }
    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // 6. Compute Browser Breakdown
    const browserMap = new Map<string, number>();
    for (const click of clicks) {
      const browser = click.browser || "Unknown";
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    }
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    // 7. Compute Top Referrers
    const referrerMap = new Map<string, number>();
    for (const click of clicks) {
      const ref = click.referrer || "direct";
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    }
    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 8. Compute Top Countries
    const countryMap = new Map<string, number>();
    for (const click of clicks) {
      const country = click.country || "Unknown";
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    }
    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 9. Recent Clicks (Mask IP Address strictly for privacy protection)
    const recentClicks = clicks.slice(0, 15).map((c) => ({
      id: c.id,
      clickedAt: c.clickedAt.toISOString(),
      maskedIp: maskIp(c.ipAddress),
      country: c.country || "Unknown",
      city: c.city || "Unknown",
      deviceType: c.deviceType || "desktop",
      browser: c.browser || "Unknown",
      referrer: c.referrer || "direct",
    }));

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.APP_DOMAIN ||
      "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";

    return NextResponse.json({
      linkId: link.id,
      shortCode: link.shortCode,
      shortUrl: `${protocol}://${host}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt.toISOString(),
      totalClicks,
      clicksByDay,
      deviceBreakdown,
      browserBreakdown,
      topReferrers,
      topCountries,
      recentClicks,
    });
  } catch (error) {
    console.error("Get Analytics Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat mengambil data analitik.",
      },
      { status: 500 }
    );
  }
}
