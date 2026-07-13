import { z } from "zod";
export const aiSummarySchema = z.object({ summary: z.string().min(1), evidenceIds: z.array(z.string()).default([]) });
