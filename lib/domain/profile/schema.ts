import { z } from "zod";

const csv = z.preprocess((value) => value ?? "", z.string()).transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean));

export const profileFormSchema = z.object({
  profileId: z.string().uuid().optional(),
  name: z.string().max(120).optional(),
  headline: z.string().max(160).optional(),
  summary: z.string().max(2000).optional(),
  location: z.string().max(160).optional(),
  targetRoles: csv,
  preferredLocations: csv,
  skills: csv,
  experience: csv,
  education: csv,
  workStyle: z.enum(["remote", "hybrid", "onsite", "unknown"]).default("unknown")
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
