import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isInternalRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/scanning") ||
        nextUrl.pathname.startsWith("/scan-management") ||
        nextUrl.pathname.startsWith("/add-target") ||
        nextUrl.pathname.startsWith("/targets") ||
        nextUrl.pathname.startsWith("/risk-scoring") ||
        nextUrl.pathname.startsWith("/export") ||
        nextUrl.pathname.startsWith("/vulnerability-report");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isInternalRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
    jwt({ token, user, account }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // Providers are defined in lib/auth.ts
} satisfies NextAuthConfig;
