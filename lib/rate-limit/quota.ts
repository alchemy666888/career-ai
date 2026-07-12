import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { quotaBuckets } from "@/lib/db/schema";
import { withObservedSpan } from "@/lib/observability/tracing";

export type QuotaWindow = "daily" | "monthly";

export function quotaWindowStart(now: Date, window: QuotaWindow) {
  return window === "daily" ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function consumeFeatureQuota(db: Database, input: { userId: string; key: string; limit: number; window: QuotaWindow; now?: Date }) {
  return withObservedSpan("quota.consume", async () => {
    const windowStart = quotaWindowStart(input.now ?? new Date(), input.window);
    const [bucket] = await db.insert(quotaBuckets).values({ userId: input.userId, key: input.key, windowStart, used: 1, limit: input.limit }).onConflictDoUpdate({ target: [quotaBuckets.userId, quotaBuckets.key, quotaBuckets.windowStart], set: { used: sql`${quotaBuckets.used} + 1` } }).returning();
    if (bucket.used > bucket.limit) throw new Error("Quota exceeded");
    return bucket;
  });
}

export async function hasActiveConcurrencyLock(db: Database, userId: string, key: string) {
  const existing = await db.query.quotaBuckets.findFirst({ where: and(eq(quotaBuckets.userId, userId), eq(quotaBuckets.key, `lock:${key}`)) });
  return Boolean(existing);
}
