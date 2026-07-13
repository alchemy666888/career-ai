import type { NormalizedJobInput } from "@/lib/jobs/normalize";
export type JobProviderResult = NormalizedJobInput & { externalId?: string; provider: string };
export type JobProviderQuery = { query: string; location?: string; limit?: number };
export type JobProvider = { name: string; search(query: JobProviderQuery): Promise<JobProviderResult[]> };
