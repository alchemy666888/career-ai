import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as schema from "@/lib/db/schema";

describe("journey database schema", () => {
  it("exports ownership-scoped tables for private journey data", () => {
    expect(schema.users).toBeDefined();
    expect(schema.resumeSources).toBeDefined();
    expect(schema.userJobStates).toBeDefined();
    expect(schema.applicationArtifacts).toBeDefined();
    expect(schema.auditEvents).toBeDefined();
  });

  it("does not define a résumé binary storage column", () => {
    const source = readFileSync("lib/db/schema.ts", "utf8");
    expect(source).not.toMatch(/file_bytes|binary|bytea/i);
    expect(source).toMatch(/extractedText/);
  });

  it("defines constraints and full-text job search index", () => {
    const source = readFileSync("lib/db/schema.ts", "utf8");
    expect(source).toContain("fit_evaluations_score_check");
    expect(source).toContain("resume_sources_size_check");
    expect(source).toContain("job_postings_search_idx");
    expect(source).toContain("to_tsvector('english'");
  });
});
