import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { profiles, resumeSources } from "@/lib/db/schema";
import type { OwnerScope } from "./types";

export function createProfileRepository(db: Database) {
  return {
    findProfileForUser(profileId: string, scope: OwnerScope) {
      return db.query.profiles.findFirst({ where: and(eq(profiles.id, profileId), eq(profiles.userId, scope.userId)) });
    },
    listProfilesForUser(scope: OwnerScope) {
      return db.query.profiles.findMany({ where: eq(profiles.userId, scope.userId), orderBy: (table, { desc }) => [desc(table.updatedAt)] });
    },
    findResumeSourceForUser(resumeSourceId: string, scope: OwnerScope) {
      return db.query.resumeSources.findFirst({ where: and(eq(resumeSources.id, resumeSourceId), eq(resumeSources.userId, scope.userId)) });
    }
  };
}
