import { describe, expect, it } from "vitest";
import { buildResumeReplacementPreview } from "@/lib/domain/resume/service";
import { sanitizeAuditMetadata } from "@/lib/audit";

describe("resume replacement deletion reconciliation", () => {
  it("builds a bounded replacement summary that preserves user evidence", () => {
    const preview = buildResumeReplacementPreview({ parsedText: "Synthetic extracted text", newSectionTitles: ["Summary", "Experience"], activeSourceCount: 1, importedEvidenceToArchive: 3, importedSectionsToReplace: 2, preservedUserEvidence: 4 });
    expect(preview.changeSummary).toEqual([
      "1 active résumé source(s) will be archived before the new import is saved.",
      "3 imported evidence item(s) and 2 imported section(s) will be replaced.",
      "4 user-authored evidence item(s) will be preserved.",
      "New import contains 2 detected section(s)."
    ]);
    expect(preview.parsedText).toBe("Synthetic extracted text");
  });

  it("redacts replacement and deletion audit metadata to safe fields", () => {
    expect(sanitizeAuditMetadata("admin_action", { operation: "resume_replaced", entityId: "source-1", extractedText: "private resume" })).toEqual({ operation: "resume_replaced", entityId: "source-1" });
    expect(sanitizeAuditMetadata("admin_action", { operation: "resume_deleted", entityId: "source-1", content: "private resume" })).toEqual({ operation: "resume_deleted", entityId: "source-1" });
  });
});
