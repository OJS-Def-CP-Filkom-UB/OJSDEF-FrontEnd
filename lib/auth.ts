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

        const MOCK_USERS = [
          { id: "admin-ojs-01", name: "Admin Universitas Brawijaya", email: "admin@ub.ac.id", password: "admin123", role: "admin_ojs" },
          { id: "it-admin-01", name: "Tim IT Universitas Brawijaya", email: "it@ub.ac.id", password: "admin123", role: "it_admin" },
          { id: "saas-admin-01", name: "OJSDef Administrator", email: "admin@ojsdef.com", password: "password123", role: "saas_admin" },
        ]

        const found = MOCK_USERS.find((u) => u.email === email && u.password === password)
        if (found) {
          return { id: found.id, name: found.name, email: found.email, role: found.role }
        }
        return null
      },
    }),
  ],
});
