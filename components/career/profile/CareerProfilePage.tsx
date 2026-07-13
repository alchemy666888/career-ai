"use client";
import { useActionState } from "react";
import { saveProfileAction } from "@/app/(dashboard)/profile/actions";
import { correctResumeClaimAction, deleteResumeSourceAction, importResumeAction, previewResumeReplacementAction, replaceResumeAction } from "@/app/(dashboard)/profile/resume-actions";
import { Progress } from "../ui/Primitives";

type Evidence = { id: string; title: string; content: string; sourceType: string; claimState: string };
type ResumeSource = { id: string; fileName: string; deletedAt?: Date | string | null };

type Props = {
  profile: { id: string; name?: string | null; headline?: string | null; summary?: string | null; location?: string | null; workStyle: string; targetRoles: unknown; preferredLocations: unknown; skills: string[]; experience: string[]; education: string[]; nextRecommendedAction: string };
  completeness: { score: number; nextRecommendedAction: string };
  evidence?: Evidence[];
  resumes?: ResumeSource[];
};

const join = (value: unknown) => Array.isArray(value) ? value.join(", ") : "";

export function CareerProfilePage({ profile, completeness, evidence = [], resumes = [] }: Props) {
  const [state, formAction, pending] = useActionState(saveProfileAction, null);
  const [resumeState, resumeAction, resumePending] = useActionState(importResumeAction, null);
  const [previewState, previewAction, previewPending] = useActionState(previewResumeReplacementAction, null);
  const [replaceState, replaceAction, replacePending] = useActionState(replaceResumeAction, null);
  const [correctState, correctAction, correctPending] = useActionState(correctResumeClaimAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteResumeSourceAction, null);
  const activeResumes = resumes.filter((resume) => !resume.deletedAt);
  const importedEvidence = evidence.filter((item) => item.sourceType === "resume_import" && item.claimState !== "archived");
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
      <section className="cj-card" aria-labelledby="resume-management-title">
        <h2 id="resume-management-title">Résumé source management</h2>
        <p>Preview replacements before confirming. Imported claims can be corrected or deleted without removing user-authored evidence.</p>
        <form action={previewAction} aria-describedby="replacement-preview-status">
          <h3>Replacement preview</h3>
          <label>Replacement résumé<input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
          <button className="career-btn" type="submit" disabled={previewPending}>{previewPending ? "Previewing…" : "Preview replacement"}</button>
          <p id="replacement-preview-status" role="status">{previewState?.message}</p>
          {previewState?.preview ? <div className="cj-empty" aria-label="Résumé replacement summary"><h4>Bounded change summary</h4><ul>{previewState.preview.changeSummary.map((item) => <li key={item}>{item}</li>)}</ul><details><summary>Extracted text preview</summary><pre>{previewState.preview.parsedText.slice(0, 2000)}</pre></details></div> : null}
        </form>
        <form action={replaceAction} aria-describedby="replace-status">
          <h3>Confirm replacement</h3>
          <label>Replacement résumé<input name="resume" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
          <label><input name="confirm" type="checkbox" value="yes" /> Archive current imported résumé data and replace it; preserve user-authored evidence.</label>
          <button className="career-btn" type="submit" disabled={replacePending}>{replacePending ? "Replacing…" : "Replace résumé"}</button>
          <p id="replace-status" role="status">{replaceState?.message}</p>
        </form>
        {activeResumes.length > 0 ? <form action={deleteAction} aria-describedby="delete-resume-status">
          <h3>Delete résumé source</h3>
          <label>Résumé source<select name="resumeSourceId">{activeResumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.fileName}</option>)}</select></label>
          <p>Deletion clears extracted source text, archives dependent imported evidence, removes imported sections, and excludes the data from future AI context.</p>
          <label><input name="confirm" type="checkbox" value="yes" /> I understand dependent imported data will be removed.</label>
          <button className="career-btn" type="submit" disabled={deletePending}>{deletePending ? "Deleting…" : "Delete résumé source"}</button>
          <p id="delete-resume-status" role="status">{deleteState?.message}</p>
        </form> : <p>No active résumé sources have been imported yet.</p>}
      </section>
      {importedEvidence.length > 0 ? <section className="cj-card" aria-labelledby="imported-claims-title"><h2 id="imported-claims-title">Imported claims</h2>{importedEvidence.map((item) => <form key={item.id} action={correctAction} className="cj-card" aria-describedby={`claim-status-${item.id}`}><input type="hidden" name="evidenceId" value={item.id} /><label>Claim title<input name="title" defaultValue={item.title} /></label><label>Claim content<textarea name="content" defaultValue={item.content} /></label><button className="career-btn" type="submit" disabled={correctPending}>Save correction</button><p id={`claim-status-${item.id}`} role="status">{correctState?.message}</p></form>)}</section> : null}
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
