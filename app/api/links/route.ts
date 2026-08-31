import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateOriginalUrl } from "@/lib/validators";
import { isSelfReferentialOrShortener } from "@/lib/anti-loop";
import { generateUniqueShortCode } from "@/lib/shortener";
import { createLinkRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/privacy";

/**
 * POST /api/links
 * Create a new short URL for authenticated users.
 */
export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Anda harus login untuk membuat short URL.",
        },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check (20 req / min)
    const ip = extractClientIp(req);
    const rateLimitIdentifier = `${session.user.id}:${ip}`;
    const { success, reset } = await createLinkRateLimit.limit(rateLimitIdentifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Terlalu banyak request pembuatan link. Coba lagi dalam beberapa saat.",
          retryAfter: reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": reset.toString(),
          },
        }
      );
    }

    // 3. Parse & Validate Payload
    const body = await req.json().catch(() => ({}));
    const { originalUrl } = body;

    const validation = validateOriginalUrl(originalUrl);
    if (!validation.valid || !validation.normalizedUrl) {
      return NextResponse.json(
        {
          error: validation.error || "INVALID_URL",
          message: validation.message || "URL tidak valid.",
        },
        { status: 400 }
      );
    }

    // 4. Anti-Loop & Shortener Blocklist Check
    if (isSelfReferentialOrShortener(validation.normalizedUrl)) {
      return NextResponse.json(
        {
          error: "SELF_REFERENTIAL_URL",
          message: "Tidak dapat menyingkat URL dari layanan shortener atau domain sendiri.",
        },
        { status: 400 }
      );
    }

    // 5. Generate CSPRNG Base62 Unique Short Code (with collision retry)
    const shortCode = await generateUniqueShortCode(prisma);

    // 6. Save Link to Database
    const newLink = await prisma.link.create({
      data: {
        userId: session.user.id,
        originalUrl: validation.normalizedUrl,
        shortCode,
      },
    });

    // 7. Construct Full Short URL
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.APP_DOMAIN ||
      "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const shortUrl = `${protocol}://${host}/${newLink.shortCode}`;

    return NextResponse.json(
      {
        id: newLink.id,
        shortCode: newLink.shortCode,
        shortUrl,
        originalUrl: newLink.originalUrl,
        createdAt: newLink.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Link Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server saat membuat link.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/links
 * List all active links for the authenticated user.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Anda harus login untuk melihat daftar link.",
        },
        { status: 401 }
      );
    }

    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.APP_DOMAIN ||
      "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";

    const formattedLinks = links.map((link) => ({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${protocol}://${host}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      totalClicks: link._count.clicks,
      createdAt: link.createdAt.toISOString(),
    }));

    return NextResponse.json({
      links: formattedLinks,
      count: formattedLinks.length,
    });
  } catch (error) {
    console.error("List Links Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat mengambil daftar link.",
      },
      { status: 500 }
    );
  }
}
