import type { JobProviderResult } from "./types";
export function manualJobProvider(input: Omit<JobProviderResult, "provider">): JobProviderResult { return { ...input, provider: "manual" }; }
