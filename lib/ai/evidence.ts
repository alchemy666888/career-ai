import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { evidenceItems } from "@/lib/db/schema";
import type { AiEvidence } from "./contracts";

export async function assembleEvidencePacket(db: Database, userId: string, profileId: string): Promise<AiEvidence[]> {
  const evidence = await db.query.evidenceItems.findMany({ where: and(eq(evidenceItems.userId, userId), eq(evidenceItems.profileId, profileId), eq(evidenceItems.claimState, "user_approved")) });
  return evidence.map((item) => ({ id: item.id, title: item.title, content: item.content }));
}

export function verifyEvidenceIds(outputIds: string[], packet: AiEvidence[]) {
  const allowed = new Set(packet.map((item) => item.id));
  const invalid = outputIds.filter((id) => !allowed.has(id));
  if (invalid.length > 0) throw new Error("AI response referenced unsupported evidence");
}
