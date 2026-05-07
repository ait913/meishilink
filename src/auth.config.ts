import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  providers,
  callbacks: {
    authorized({ auth, request }) {
      const pathname = new URL((request as Request & { url: string }).url).pathname;
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/onboarding", "/settings"];
      if (protectedPaths.some((entry) => pathname.startsWith(entry))) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        (token as Record<string, unknown>).id = (user as { id?: string }).id ?? token.sub;
      }
      return token;
    },
    session({ session, token }) {
      const id = (token as Record<string, unknown>).id ?? token.sub;
      if (session.user && id) {
        (session.user as { id?: string }).id = id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
