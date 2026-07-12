import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertTestOwnerCleanup, parallelSafeId, uniqueTestUser } from "../../helpers/database";

describe("repository and transaction foundations", () => {
  it("requires owner-scoped private repository methods", () => {
    const source = readFileSync("lib/db/repositories/applications.ts", "utf8") + readFileSync("lib/db/repositories/profiles.ts", "utf8") + readFileSync("lib/db/repositories/jobs.ts", "utf8");
    expect(source).toContain("findApplicationForUser");
    expect(source).toContain("findProfileForUser");
    expect(source).toContain("findUserJobStateForUser");
    expect(source).not.toContain("findApplicationById");
  });

  it("keeps state transitions and paired events in transactions", () => {
    const source = readFileSync("lib/db/transactions/index.ts", "utf8");
    expect(source.match(/db\.transaction/g)?.length).toBeGreaterThanOrEqual(7);
    expect(source).toContain("createApplicationWithFirstEvent");
    expect(source).toContain("changeApplicationStatus");
    expect(source).toContain("approveArtifact");
  });

  it("provides parallel-safe test identities and owner-only cleanup guards", () => {
    const user = uniqueTestUser();
    expect(user.email).toContain("@example.test");
    expect(parallelSafeId("repo")).toMatch(/^repo-/);
    expect(() => assertTestOwnerCleanup(user.id, "other")).toThrow(/different test owner/);
  });
});
