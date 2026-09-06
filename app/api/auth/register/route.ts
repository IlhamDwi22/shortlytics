import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authRateLimit } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/privacy";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    // 0. Rate Limiting (5 req / min per IP)
    const ip = extractClientIp(req);
    const { success, reset } = await authRateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many registration attempts. Please try again shortly.",
          retryAfter: reset,
        },
        {
          status: 429,
          headers: { "Retry-After": reset.toString() },
        }
      );
    }

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
    const { email, password, name } = body;

    // 1. Validation
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        {
          error: "INVALID_EMAIL",
          message: "Invalid email format.",
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "INVALID_PASSWORD",
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "EMAIL_ALREADY_EXISTS",
          message: "Email is already registered. Please sign in.",
        },
        { status: 409 }
      );
    }

    // 3. Hash password (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: typeof name === "string" && name.trim() ? name.trim() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: "An error occurred on the server during registration.",
      },
      { status: 500 }
    );
  }
}
