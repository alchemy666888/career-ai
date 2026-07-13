import { describe, expect, it } from "vitest";
import { AiProviderError } from "@/lib/ai/contracts";
import { FakeAiProvider } from "@/lib/ai/fake";
import { aiQuotaDefaults } from "@/lib/ai/usage";
import { quotaWindowStart } from "@/lib/rate-limit/quota";

describe("ai-quota concurrency usage kill-switch", () => {
  it("defines bounded approved defaults", () => {
    expect(aiQuotaDefaults.userDailyRequests).toBeLessThanOrEqual(25);
    expect(aiQuotaDefaults.monthlyGlobalUsage).toBeGreaterThan(0);
  });

  it("keeps deterministic fake available without live quota", async () => {
    const provider = new FakeAiProvider();
    const result = await provider.generateText({ operation: "demo", promptVersion: "test", system: "safe", user: "safe", evidence: [] });
    expect(result.usage.provider).toBe("fake");
  });

  it("uses stable quota windows and safe kill switch errors", () => {
    expect(quotaWindowStart(new Date("2026-07-12T12:00:00Z"), "daily").toISOString()).toBe("2026-07-12T00:00:00.000Z");
    expect(new AiProviderError("AI_DISABLED").code).toBe("AI_DISABLED");
  });
});
