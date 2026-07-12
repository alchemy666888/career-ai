import type { Database } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";
import { logEvent } from "@/lib/observability/logger";
import { redactValue } from "@/lib/observability/redact";

const auditAllowlist: Record<string, Set<string>> = {
  application_status_changed: new Set(["fromStatus", "toStatus", "applicationId"]),
  artifact_approved: new Set(["artifactId", "applicationId"]),
  quota_consumed: new Set(["key", "used", "limit"]),
  background_job_completed: new Set(["backgroundJobId", "kind", "status"]),
  admin_action: new Set(["operation", "entityId"])
};

export function sanitizeAuditMetadata(action: string, metadata: Record<string, unknown>) {
  const allowed = auditAllowlist[action] ?? new Set<string>();
  const output: Record<string, unknown> = {};
  for (const key of allowed) if (key in metadata) output[key] = metadata[key];
  for (const [key, value] of Object.entries(output)) output[key] = redactValue(value);
  return output;
}

export async function writeAuditEvent(db: Database, input: { userId?: string; action: string; entityType: string; entityId?: string; correlationId?: string; metadata?: Record<string, unknown> }) {
  const metadata = sanitizeAuditMetadata(input.action, input.metadata ?? {});
  try {
    const [event] = await db.insert(auditEvents).values({ userId: input.userId, action: input.action, entityType: input.entityType, entityId: input.entityId, correlationId: input.correlationId, metadata }).returning();
    return event;
  } catch (error) {
    logEvent({ severity: "error", event: "audit_write_failed", code: "AUDIT_WRITE_FAILED", correlationId: input.correlationId, error });
    return null;
  }
}
