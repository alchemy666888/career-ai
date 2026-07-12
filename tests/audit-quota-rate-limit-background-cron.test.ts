import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "@/lib/audit";
import { quotaWindowStart } from "@/lib/rate-limit/quota";

describe("audit quota background and cron infrastructure", () => {
  it("redacts audit metadata with action allowlists", () => {
    const metadata = sanitizeAuditMetadata("application_status_changed", { fromStatus: "saved", toStatus: "applied", email: "person@example.test", resumeText: "private" });
    expect(metadata).toEqual({ fromStatus: "saved", toStatus: "applied" });
  });

  it("computes deterministic quota windows", () => {
    const now = new Date("2026-07-11T12:34:56Z");
    expect(quotaWindowStart(now, "daily").toISOString()).toBe("2026-07-11T00:00:00.000Z");
    expect(quotaWindowStart(now, "monthly").toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("uses skip-locked claiming, dedupe, retries, cron secret verification, and observed wrappers", () => {
    const queue = readFileSync("lib/background/queue.ts", "utf8");
    expect(queue.toLowerCase()).toContain("for update skip locked");
    expect(queue).toContain("dedupeKey");
    expect(queue).toContain("retryAfter");
    expect(readFileSync("lib/server/cron.ts", "utf8")).toContain("CRON_SECRET");
    expect(readFileSync("lib/server/wrappers.ts", "utf8")).toContain("observedServerAction");
  });
});
