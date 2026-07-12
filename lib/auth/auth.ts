import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { CareerDrizzleAdapter } from "./adapter";
import { createDb } from "@/lib/db";
import { normalizeEmail, parseAdminEmails } from "./normalize";

const providers: NextAuthOptions["providers"] = [];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }));
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, allowDangerousEmailAccountLinking: false }));
if (process.env.EMAIL_AUTH_ENABLED === "true") {
  providers.push({
    id: "email",
    type: "email",
    name: "Email",
    from: process.env.EMAIL_FROM!,
    server: {},
    maxAge: 24 * 60 * 60,
    options: {},
    normalizeIdentifier(identifier: string) { return normalizeEmail(identifier); },
    async sendVerificationRequest() { /* Real email transport is configured in a later integration task and mocked in tests. */ }
  });
}

export const authOptions: NextAuthOptions = {
  adapter: process.env.DATABASE_URL ? CareerDrizzleAdapter(createDb(process.env.DATABASE_URL)) : undefined,
  providers,
  session: { strategy: process.env.DATABASE_URL ? "database" : "jwt" },
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      user.email = normalizeEmail(user.email);
      return true;
    },
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
        session.user.email = user?.email ?? session.user.email;
        session.user.role = parseAdminEmails(process.env.ADMIN_EMAILS).has(normalizeEmail(session.user.email ?? "")) ? "admin" : "user";
      }
      return session;
    }
  }
};
