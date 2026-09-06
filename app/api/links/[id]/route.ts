import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getShortUrl } from "@/lib/request";

/**
 * GET /api/links/:id
 * Retrieve detail of a single link owned by the authenticated user.
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in first.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    // Scoped query: ownership enforced atomically in the WHERE clause
    // (returns 404 for both missing links and other users' links).
    const link = await prisma.link.findFirst({
      where: { id, userId: session.user.id },
      include: {
        _count: {
          select: { clicks: true },
        },
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

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: getShortUrl(req, link.shortCode),
      originalUrl: link.originalUrl,
      isActive: link.isActive,
      totalClicks: link._count.clicks,
      createdAt: link.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Get Link Detail Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat mengambil data link.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/links/:id
 * Delete a link and cascade delete all its click records.
 */
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in first.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    // Atomic scoped delete: never possible to delete another user's link, and
    // no TOCTOU window between an ownership check and the delete itself.
    const result = await prisma.link.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Link not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Link and all of its analytics data were deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Link Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat menghapus link.",
      },
      { status: 500 }
    );
  }
}
