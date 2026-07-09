import type { NextAuthOptions } from "next-auth";
import GitHub from "next-auth/providers/github";

const providers = process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
  ? [GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })]
  : [];

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    }
  }
};
