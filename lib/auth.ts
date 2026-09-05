import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// Idle session timeout: an authenticated session expires if the user has been
// inactive for this many seconds (15 days). Every authenticated request slides
// the window forward, so the timeout is measured from the last activity.
const SESSION_IDLE_TIMEOUT = 15 * 24 * 60 * 60; // 15 days

// Brute-force protection: after 5 consecutive failed password attempts the
// account is locked for 15 minutes. A success resets the counter.
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max absolute lifetime
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const now = Date.now();

        // Account lockout window — refuse even correct passwords until it ends.
        if (user.lockedUntil && user.lockedUntil.getTime() > now) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Slide toward lockout; on reaching the limit, reset the counter for
          // the next window (fresh 5 attempts after the lock expires).
          const willLock = user.failedAttempts + 1 >= MAX_FAILED_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: willLock ? 0 : user.failedAttempts + 1,
              lockedUntil: willLock ? new Date(now + LOCK_DURATION_MS) : null,
            },
          });
          throw new Error("INVALID_CREDENTIALS");
        }

        // Successful authentication resets the lockout state.
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      // A fresh sign-in: initialize the last-activity timestamp.
      if (user) {
        token.id = user.id;
        token.lastActivity = now;
        return token;
      }

      // Session refresh from an incoming request: enforce the idle timeout.
      // If the user has been inactive for `SESSION_IDLE_TIMEOUT` or longer,
      // invalidate the token so they must sign in again.
      const lastActivity = token.lastActivity as number | undefined;
      if (!lastActivity || now - lastActivity >= SESSION_IDLE_TIMEOUT) {
        return {};
      }

      // Still active within the window: slide the timeout forward.
      token.lastActivity = now;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
      }
      return session;
    },
  },
};
