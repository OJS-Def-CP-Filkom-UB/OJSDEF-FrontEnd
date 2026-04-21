import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // In production, fetch from your database here
        // For OJSDef prototype, we use hardcoded credentials
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (email === "admin@ojsdef.com" && password === "password123") {
          return {
            id: "saas-admin-01",
            name: "OJSDef Security Admin",
            email: "admin@ojsdef.com",
            role: "saas_admin",
          };
        }

        return null;
      },
    }),
  ],
});
