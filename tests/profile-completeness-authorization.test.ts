import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateProfileCompleteness } from "@/lib/domain/profile/completeness";

describe("profile completeness authorization", () => {
  it("scores broad professional profiles deterministically", () => {
    const result = calculateProfileCompleteness({ name: "A", headline: "Marketing leader", summary: "Experienced growth marketer with global launch and sales enablement evidence.", location: "Kuala Lumpur", targetRoles: ["Marketing Manager"], preferredLocations: ["Remote"], skills: ["Positioning"], experience: ["Campaign launch"], evidenceCount: 1 });
    expect(result.score).toBe(100);
    expect(result.nextRecommendedAction).toBe("Review job matches");
  });

  it("requires owner-scoped updates and active users", () => {
    const service = readFileSync("lib/domain/profile/service.ts", "utf8");
    const action = readFileSync("app/(dashboard)/profile/actions.ts", "utf8");
    expect(service).toContain("current.userId !== userId");
    expect(action).toContain("requireActiveUser");
  });

  it("does not import fixture journey state in the production profile component", () => {
    const component = readFileSync("components/career/profile/CareerProfilePage.tsx", "utf8");
    expect(component).not.toContain("useJourney");
    expect(component).not.toContain("fixtures");
  });
});
