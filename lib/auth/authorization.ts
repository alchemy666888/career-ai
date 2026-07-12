import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authOptions } from "./auth";
import { getServerEnv } from "@/lib/env";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { normalizeEmail, parseAdminEmails } from "./normalize";

export class AuthorizationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  return session.user;
}

export async function requireActiveUser() {
  const user = await requireUser();
  const row = await getDb().query.users.findFirst({ where: eq(users.id, user.id) });
  if (!row || row.status !== "active") throw new AuthorizationError("Account is not active");
  return { ...user, email: row.email, role: row.role };
}

export async function requireAdmin() {
  const user = await requireActiveUser();
  const admins = parseAdminEmails(getServerEnv().ADMIN_EMAILS);
  if (!user.email || !admins.has(normalizeEmail(user.email))) throw new AuthorizationError("Admin access required");
  if (user.role !== "admin") await getDb().update(users).set({ role: "admin", updatedAt: new Date() }).where(eq(users.id, user.id));
  return { ...user, role: "admin" as const };
}

export function assertOwner(record: { userId: string } | null | undefined, userId: string) {
  if (!record || record.userId !== userId) throw new AuthorizationError();
  return record;
}
