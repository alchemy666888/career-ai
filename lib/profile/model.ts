import { z } from "zod";
export const profileSections = [
  { title: "Experience", description: "Roles, scope, achievements, and measurable impact." },
  { title: "Evidence", description: "Resume snippets, projects, certifications, and examples that support claims." },
  { title: "Preferences", description: "Target roles, locations, compensation, work style, and constraints." }
];
export const evidenceSchema = z.object({ sourceType: z.string().min(2), title: z.string().min(2), content: z.string().min(10), claimState: z.enum(["user_approved", "ai_suggested", "unsupported", "archived"]).default("user_approved") });
