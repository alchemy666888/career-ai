import { describe, expect, it } from "vitest";
import { FakeAiProvider } from "@/lib/ai/fake";
import { verifyEvidenceIds } from "@/lib/ai/evidence";
import { aiSummarySchema } from "@/lib/ai/schemas/summary";
import { promptVersions } from "@/lib/ai/prompts/versions";

describe("ai-provider deepseek fake prompts schemas evidence", () => {
  it("fake provider satisfies text and structured contracts deterministically", async () => {
    const provider = new FakeAiProvider();
    const evidence = [{ id: "e1", title: "Evidence", content: "Approved evidence content" }];
    await expect(provider.generateText({ operation: "fit", promptVersion: promptVersions.fitSummary, system: "safe", user: "safe", evidence })).resolves.toMatchObject({ usage: { provider: "fake" } });
    await expect(provider.generateStructured({ operation: "fit", promptVersion: promptVersions.fitSummary, system: "safe", user: "safe", evidence }, aiSummarySchema)).resolves.toMatchObject({ data: { evidenceIds: ["e1"] } });
  });

  it("rejects malformed structured output and unsupported evidence ids", () => {
    expect(() => aiSummarySchema.parse({ evidenceIds: [] })).toThrow();
    expect(() => verifyEvidenceIds(["missing"], [{ id: "e1", title: "Evidence", content: "Approved" }])).toThrow("unsupported evidence");
  });
});
