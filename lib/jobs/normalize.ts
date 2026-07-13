import { createHash } from "node:crypto";
import { z } from "zod";

export const normalizedJobSchema = z.object({
  title: z.string().min(2).max(160),
  company: z.string().min(2).max(160),
  location: z.string().max(160).optional(),
  workStyle: z.enum(["remote", "hybrid", "onsite", "unknown"]).default("unknown"),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  currency: z.string().length(3).default("USD").optional(),
  closingDate: z.coerce.date().optional(),
  canonicalUrl: z.string().url().optional(),
  description: z.string().min(20).max(20000)
});
export type NormalizedJobInput = z.input<typeof normalizedJobSchema>;
export type NormalizedJob = z.output<typeof normalizedJobSchema> & { contentHash: string; fingerprint: string; safeDescription: string };

export function normalizeJobUrl(url?: string) {
  if (!url) return undefined;
  const parsed = new URL(url);
  parsed.hash = "";
  for (const key of [...parsed.searchParams.keys()]) if (key.toLowerCase().startsWith("utm_")) parsed.searchParams.delete(key);
  parsed.searchParams.sort();
  return parsed.toString();
}

export function renderTextOnlyDescription(description: string) {
  return description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeJob(input: NormalizedJobInput): NormalizedJob {
  const parsed = normalizedJobSchema.parse({ ...input, canonicalUrl: normalizeJobUrl(input.canonicalUrl), description: renderTextOnlyDescription(input.description) });
  const contentHash = createHash("sha256").update(`${parsed.company.toLowerCase()}|${parsed.title.toLowerCase()}|${parsed.description.toLowerCase().replace(/\s+/g, " ")}`).digest("hex");
  const fingerprint = createHash("sha256").update(`${parsed.canonicalUrl ?? ""}|${contentHash}`).digest("hex");
  return { ...parsed, safeDescription: parsed.description, contentHash, fingerprint };
}
