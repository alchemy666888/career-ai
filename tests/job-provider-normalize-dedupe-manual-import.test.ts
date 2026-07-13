import { describe, expect, it } from "vitest";
import { normalizeJob, normalizeJobUrl, renderTextOnlyDescription } from "@/lib/jobs/normalize";
import { mockJobProvider } from "@/lib/jobs/providers/mock";
import { manualJobProvider } from "@/lib/jobs/providers/manual";

describe("job provider normalize dedupe manual-import", () => {
  it("normalizes canonical URLs and stores text-only descriptions", () => {
    expect(normalizeJobUrl("https://example.com/job?utm_source=x&b=2&a=1#section")).toBe("https://example.com/job?a=1&b=2");
    expect(renderTextOnlyDescription("<p>Hello <strong>candidate</strong></p>")).toBe("Hello candidate");
  });

  it("creates stable fingerprints for duplicate detection", () => {
    const a = normalizeJob({ title: "Engineer", company: "Acme", description: "This is a long safe description for a role.", canonicalUrl: "https://example.com/job?utm_campaign=x" });
    const b = normalizeJob({ title: "Engineer", company: "Acme", description: "This is a long safe description for a role.", canonicalUrl: "https://example.com/job" });
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.fingerprint).toBe(b.fingerprint);
  });

  it("provides deterministic mock and manual provider records without fetching URLs", async () => {
    await expect(mockJobProvider.search({ query: "Designer", limit: 2 })).resolves.toEqual(await mockJobProvider.search({ query: "Designer", limit: 2 }));
    expect(manualJobProvider({ title: "Designer", company: "Acme", description: "A manual description long enough to validate.", canonicalUrl: "https://example.com/job" }).provider).toBe("manual");
  });
});
