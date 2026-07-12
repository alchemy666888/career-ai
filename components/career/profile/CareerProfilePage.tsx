"use client";
import { useActionState } from "react";
import { saveProfileAction } from "@/app/(dashboard)/profile/actions";
import { importResumeAction } from "@/app/(dashboard)/profile/resume-actions";
import { Progress } from "../ui/Primitives";

type Props = {
  profile: {
    id: string;
    name?: string | null;
    headline?: string | null;
    summary?: string | null;
    location?: string | null;
    workStyle: string;
    targetRoles: unknown;
    preferredLocations: unknown;
    skills: string[];
    experience: string[];
    education: string[];
    nextRecommendedAction: string;
  };
  completeness: { score: number; nextRecommendedAction: string };
};

const join = (value: unknown) => Array.isArray(value) ? value.join(", ") : "";

export function CareerProfilePage({ profile, completeness }: Props) {
  const [state, formAction, pending] = useActionState(saveProfileAction, null);
  const [resumeState, resumeAction, resumePending] = useActionState(importResumeAction, null);
  return (
    <section className="career-container cj-page-head" aria-labelledby="profile-title">
      <h1 id="profile-title">Profile</h1>
      <p>Your profile is saved securely and used as evidence for job matching and application materials.</p>
      <Progress value={completeness.score} label="Profile completeness" />
      <article className="cj-card" aria-live="polite"><h2>Next useful field</h2><p>{completeness.nextRecommendedAction}</p></article>
      <form action={resumeAction} className="cj-card" aria-describedby="resume-status">
        <h2>Import résumé</h2>
        <p>Upload a PDF or DOCX up to 10 MB. Original file bytes are processed transiently and not stored.</p>
        <label>Résumé file<input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
        <button className="career-btn" type="submit" disabled={resumePending}>{resumePending ? "Importing…" : "Import résumé"}</button>
        <p id="resume-status" role="status">{resumeState?.message}</p>
      </form>
      <form action={formAction} className="cj-card" aria-describedby="profile-status">
        <input type="hidden" name="profileId" value={profile.id} />
        <h2>Professional profile</h2>
        <label>Name<input name="name" defaultValue={profile.name ?? ""} /></label>
        <label>Headline<textarea name="headline" defaultValue={profile.headline ?? ""} /></label>
        <label>Summary<textarea name="summary" defaultValue={profile.summary ?? ""} /></label>
        <label>Location<input name="location" defaultValue={profile.location ?? ""} /></label>
        <label>Target roles<input name="targetRoles" defaultValue={join(profile.targetRoles)} placeholder="Marketing manager, Product designer" /></label>
        <label>Preferred locations<input name="preferredLocations" defaultValue={join(profile.preferredLocations)} placeholder="United States, Singapore, Remote" /></label>
        <label>Skills<input name="skills" defaultValue={join(profile.skills)} /></label>
        <label>Experience highlights<input name="experience" defaultValue={join(profile.experience)} /></label>
        <label>Education<input name="education" defaultValue={join(profile.education)} /></label>
        <label>Work style<select name="workStyle" defaultValue={profile.workStyle}><option value="unknown">Flexible</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
        <button className="career-btn" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
        <p id="profile-status" role="status">{state?.message}</p>
      </form>
    </section>
  );
}
