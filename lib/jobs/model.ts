import { createHash } from "node:crypto";
import { z } from "zod";

export const jobStatuses = ["discovered", "saved", "evaluating", "rejected", "applying", "applied", "interviewing", "offered", "accepted", "declined", "archived"] as const;
export const createJobSchema = z.object({ title: z.string().min(2), company: z.string().min(2), location: z.string().optional(), canonicalUrl: z.string().url().optional(), description: z.string().min(20) });
export function normalizeJobUrl(url?: string) { if (!url) return undefined; const parsed = new URL(url); parsed.hash = ""; parsed.searchParams.sort(); return parsed.toString(); }
export function jobContentHash(input: { title: string; company: string; description: string }) { return createHash("sha256").update(`${input.company.toLowerCase()}|${input.title.toLowerCase()}|${input.description.replace(/\s+/g, " ").trim().toLowerCase()}`).digest("hex"); }
