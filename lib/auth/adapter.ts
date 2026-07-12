import { and, eq } from "drizzle-orm";
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from "next-auth/adapters";
import type { Database } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { normalizeEmail } from "./normalize";

function toAdapterUser(row: typeof users.$inferSelect): AdapterUser {
  return { id: row.id, email: row.email, emailVerified: row.emailVerified, name: row.name, image: row.image };
}

export function CareerDrizzleAdapter(db: Database): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const [created] = await db.insert(users).values({ email: normalizeEmail(user.email), name: user.name, image: user.image, emailVerified: user.emailVerified }).returning();
      return toAdapterUser(created);
    },
    async getUser(id) {
      const row = await db.query.users.findFirst({ where: eq(users.id, id) });
      return row ? toAdapterUser(row) : null;
    },
    async getUserByEmail(email) {
      const row = await db.query.users.findFirst({ where: eq(users.email, normalizeEmail(email)) });
      return row ? toAdapterUser(row) : null;
    },
    async getUserByAccount(account) {
      const linked = await db.query.accounts.findFirst({ where: and(eq(accounts.provider, account.provider), eq(accounts.providerAccountId, account.providerAccountId)) });
      if (!linked) return null;
      const row = await db.query.users.findFirst({ where: eq(users.id, linked.userId) });
      return row ? toAdapterUser(row) : null;
    },
    async updateUser(user) {
      const [updated] = await db.update(users).set({ email: user.email ? normalizeEmail(user.email) : undefined, name: user.name, image: user.image, emailVerified: user.emailVerified, updatedAt: new Date() }).where(eq(users.id, user.id)).returning();
      return toAdapterUser(updated);
    },
    async linkAccount(account: AdapterAccount) {
      const [created] = await db.insert(accounts).values(account).returning();
      return created as AdapterAccount;
    },
    async createSession(session) {
      const [created] = await db.insert(sessions).values(session).returning();
      return created as AdapterSession;
    },
    async getSessionAndUser(sessionToken) {
      const session = await db.query.sessions.findFirst({ where: eq(sessions.sessionToken, sessionToken) });
      if (!session) return null;
      const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
      return user ? { session: session as AdapterSession, user: toAdapterUser(user) } : null;
    },
    async updateSession(session) {
      const [updated] = await db.update(sessions).set({ expires: session.expires }).where(eq(sessions.sessionToken, session.sessionToken)).returning();
      return updated ? (updated as AdapterSession) : null;
    },
    async deleteSession(sessionToken) {
      const [deleted] = await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken)).returning();
      return deleted ? (deleted as AdapterSession) : null;
    },
    async createVerificationToken(token) {
      const [created] = await db.insert(verificationTokens).values({ ...token, identifier: normalizeEmail(token.identifier) }).returning();
      return created as VerificationToken;
    },
    async useVerificationToken(params) {
      const [deleted] = await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier, normalizeEmail(params.identifier)), eq(verificationTokens.token, params.token))).returning();
      return deleted ? (deleted as VerificationToken) : null;
    }
  };
}
