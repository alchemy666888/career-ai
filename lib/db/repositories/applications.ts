import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { applicationArtifacts, applications, interviewSessions, outcomes } from "@/lib/db/schema";
import type { OwnerScope } from "./types";

export function createApplicationRepository(db: Database) {
  return {
    findApplicationForUser(applicationId: string, scope: OwnerScope) {
      return db.query.applications.findFirst({ where: and(eq(applications.id, applicationId), eq(applications.userId, scope.userId)) });
    },
    findArtifactForUser(artifactId: string, scope: OwnerScope) {
      return db.query.applicationArtifacts.findFirst({ where: and(eq(applicationArtifacts.id, artifactId), eq(applicationArtifacts.userId, scope.userId)) });
    },
    findInterviewSessionForUser(sessionId: string, scope: OwnerScope) {
      return db.query.interviewSessions.findFirst({ where: and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, scope.userId)) });
    },
    findOutcomeForUser(outcomeId: string, scope: OwnerScope) {
      return db.query.outcomes.findFirst({ where: and(eq(outcomes.id, outcomeId), eq(outcomes.userId, scope.userId)) });
    }
  };
}
