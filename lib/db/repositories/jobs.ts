import { and, eq, lt } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { jobPostings, userJobStates } from "@/lib/db/schema";
import { boundedLimit, type OwnerScope, type PageRequest } from "./types";

export function createJobRepository(db: Database) {
  return {
    findUserJobStateForUser(stateId: string, scope: OwnerScope) {
      return db.query.userJobStates.findFirst({ where: and(eq(userJobStates.id, stateId), eq(userJobStates.userId, scope.userId)) });
    },
    async listSavedJobsForUser(scope: OwnerScope, page: PageRequest = {}) {
      const limit = boundedLimit(page.limit);
      const rows = await db.query.userJobStates.findMany({
        where: page.cursor ? and(eq(userJobStates.userId, scope.userId), lt(userJobStates.id, page.cursor)) : eq(userJobStates.userId, scope.userId),
        limit: limit + 1,
        orderBy: (table, { desc }) => [desc(table.updatedAt)]
      });
      return { items: rows.slice(0, limit), nextCursor: rows.length > limit ? rows[limit]?.id : undefined };
    },
    findGlobalJob(jobId: string) {
      return db.query.jobPostings.findFirst({ where: eq(jobPostings.id, jobId) });
    }
  };
}
