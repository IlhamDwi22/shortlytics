import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
          message: "Anda harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    const link = await prisma.link.findUnique({
      where: { id },
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
          message: "Link tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // IDOR Protection: verify user ownership
    if (link.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Anda tidak memiliki akses ke link ini.",
        },
        { status: 403 }
      );
    }

    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      process.env.APP_DOMAIN ||
      "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";

    return NextResponse.json({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${protocol}://${host}/${link.shortCode}`,
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
          message: "Anda harus login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const { id } = await props.params;

    const link = await prisma.link.findUnique({
      where: { id },
      select: { id: true, userId: true },
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

    // IDOR Protection: verify user ownership
    if (link.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "FORBIDDEN",
          message: "Anda tidak memiliki izin untuk menghapus link ini.",
        },
        { status: 403 }
      );
    }

    // Cascade delete link and all associated clicks
    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Link beserta seluruh data analitik berhasil dihapus.",
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
