import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // NextAuth only checks "does a token exist". An idle-timed-out session
    // produces a token without `id`, which must NOT be treated as valid.
    authorized({ token }) {
      return !!token && typeof token.id === "string" && token.id.length > 0;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/links/:path*"],
};