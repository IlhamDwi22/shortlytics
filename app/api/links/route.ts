import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateOriginalUrl } from "@/lib/validators";
import { isSelfReferentialOrShortener } from "@/lib/anti-loop";
import { generateUniqueShortCode } from "@/lib/shortener";
import { createLinkRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/privacy";
import { getShortUrl } from "@/lib/request";

const MAX_CREATE_ATTEMPTS = 3;

/**
 * POST /api/links
 * Create a new short URL for authenticated users.
 */
export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in to create a short URL.",
        },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check (20 req / min)
    const ip = extractClientIp(req);
    const rateLimitIdentifier = `${userId}:${ip}`;
    const { success, reset } = await createLinkRateLimit.limit(rateLimitIdentifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many link creation requests. Please try again shortly.",
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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
        { status: 400 }
      );
    }
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
          message: "Cannot shorten a URL from a shortener service or your own domain.",
        },
        { status: 400 }
      );
    }

    // 5. Generate CSPRNG Base62 Unique Short Code & Save Link.
    //    A P2002 (unique shortCode) can still occur if two concurrent requests
    //    pass the pre-check — retry on that specific error.
    let newLink: Awaited<ReturnType<typeof prisma.link.create>> | null = null;

    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
      const shortCode = await generateUniqueShortCode(prisma);

      try {
        newLink = await prisma.link.create({
          data: {
            userId,
            originalUrl: validation.normalizedUrl,
            shortCode,
          },
        });
        break;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          continue;
        }
        throw err;
      }
    }

    if (!newLink) {
      return NextResponse.json(
        {
          error: "COLLISION_RETRY_EXHAUSTED",
          message: "Failed to generate a unique short code. Please try again.",
        },
        { status: 500 }
      );
    }

    // 6. Construct Full Short URL
    const shortUrl = getShortUrl(req, newLink.shortCode);

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
        message: "An error occurred on the server while creating the link.",
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
    const userId = await requireUser();
    if (!userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in to view your links.",
        },
        { status: 401 }
      );
    }

    const links = await prisma.link.findMany({
      where: {
        userId,
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

    const formattedLinks = links.map((link) => ({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: getShortUrl(req, link.shortCode),
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
        message: "An error occurred while fetching your links.",
      },
      { status: 500 }
    );
  }
}
