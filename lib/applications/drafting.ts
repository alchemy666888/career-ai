export type Evidence = { title: string; content: string; claimState: "user_approved" | "ai_suggested" | "unsupported" | "archived" };
export function approvedEvidenceOnly(items: Evidence[]) { return items.filter((item) => item.claimState === "user_approved"); }
export function draftClaimSummary(items: Evidence[]) { return approvedEvidenceOnly(items).map((item) => `${item.title}: ${item.content}`).join("\n"); }
