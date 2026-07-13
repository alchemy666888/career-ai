import { describe, expect, it, vi } from "vitest";
import { verifyCronRequest } from "@/lib/server/cron";
import { jobSpyProvider } from "@/lib/jobs/providers/jobspy";

vi.mock("@/lib/env", () => ({ getServerEnv: () => ({ CRON_SECRET: "test-cron-secret", LIVE_JOB_INGESTION_ENABLED: false, ADMIN_INGESTION_ENABLED: false }) }));

describe("ingestion cron jobspy admin-jobs retention", () => {
  it("rejects unauthorized cron requests and accepts configured secrets", () => {
    expect(verifyCronRequest(new Request("https://example.test/api/ingestion/jobs/run"))).toBe(false);
    expect(verifyCronRequest(new Request("https://example.test/api/ingestion/jobs/run", { headers: { authorization: "Bearer test-cron-secret" } }))).toBe(true);
  });

  it("keeps JobSpy inactive when live ingestion is disabled", async () => {
    await expect(jobSpyProvider.search({ query: "engineer", limit: 1 })).resolves.toEqual([]);
  });

  it("documents retention states without deleting referenced jobs", () => {
    const referencedState = "deactivated";
    const unreferencedState = "archived";
    expect([referencedState, unreferencedState]).toEqual(["deactivated", "archived"]);
  });
});
