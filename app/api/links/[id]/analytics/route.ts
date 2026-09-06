import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { maskIp } from "@/lib/privacy";
import { getShortUrl } from "@/lib/request";

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
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in first.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    // 2. Fetch Link with scoped ownership (IDOR Protection — returns 404 for
    //    both missing links and other users' links, no existence leak).
    const link = await prisma.link.findFirst({
      where: { id, userId },
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
          message: "Link not found.",
        },
        { status: 404 }
      );
    }

    // 3. Fetch Click Records (bounded — all aggregation happens in the database)
    const [
      totalClicks,
      recentClicksRaw,
      deviceBreakdownRaw,
      browserBreakdownRaw,
      topReferrersRaw,
      topCountriesRaw,
    ] = await Promise.all([
      prisma.click.count({ where: { linkId: link.id } }),
      prisma.click.findMany({
        where: { linkId: link.id },
        orderBy: { clickedAt: "desc" },
        take: 15,
      }),
      prisma.click.groupBy({
        by: ["deviceType"],
        where: { linkId: link.id },
        _count: { deviceType: true },
      }),
      prisma.click.groupBy({
        by: ["browser"],
        where: { linkId: link.id },
        _count: { browser: true },
      }),
      prisma.click.groupBy({
        by: ["referrer"],
        where: { linkId: link.id },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      }),
      prisma.click.groupBy({
        by: ["country"],
        where: { linkId: link.id },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
    ]);

    // Daily series — grouped server-side in Postgres, never loaded row-by-row.
    const dailyRows = await prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT TO_CHAR(DATE_TRUNC('day', "clickedAt"), 'YYYY-MM-DD') AS "date",
             COUNT(*)::int AS count
      FROM "clicks"
      WHERE "linkId" = ${link.id}
      GROUP BY 1
      ORDER BY "date" ASC
    `;

    const clicksByDay = dailyRows;

    const deviceBreakdown = deviceBreakdownRaw
      .map((d) => ({ type: d.deviceType || "desktop", count: d._count.deviceType }))
      .sort((a, b) => b.count - a.count);

    const browserBreakdown = browserBreakdownRaw
      .map((b) => ({ browser: b.browser || "Unknown", count: b._count.browser }))
      .sort((a, b) => b.count - a.count);

    const topReferrers = topReferrersRaw.map((r) => ({
      referrer: r.referrer || "direct",
      count: r._count.referrer,
    }));

    const topCountries = topCountriesRaw.map((c) => ({
      country: c.country || "Unknown",
      count: c._count.country,
    }));

    // 4. Recent Clicks (IP Address masked strictly for privacy)
    const recentClicks = recentClicksRaw.map((c) => ({
      id: c.id,
      clickedAt: c.clickedAt.toISOString(),
      maskedIp: maskIp(c.ipAddress),
      country: c.country || "Unknown",
      city: c.city || "Unknown",
      deviceType: c.deviceType || "desktop",
      browser: c.browser || "Unknown",
      referrer: c.referrer || "direct",
    }));

    const shortUrl = getShortUrl(req, link.shortCode);

    return NextResponse.json({
      linkId: link.id,
      shortCode: link.shortCode,
      shortUrl,
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
        message: "An error occurred while fetching analytics data.",
      },
      { status: 500 }
    );
  }
}
