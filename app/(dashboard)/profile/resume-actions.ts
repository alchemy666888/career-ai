"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { getOrCreateProfileForUser } from "@/lib/domain/profile/service";
import { correctImportedClaim, deleteResumeSourceForUser, importFirstResume, previewResumeReplacement, replaceResumeImport } from "@/lib/domain/resume/service";

async function readUpload(formData: FormData) {
  const file = formData.get("resume");
  if (!(file instanceof File)) throw new Error("Choose a PDF or DOCX résumé.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return { fileName: file.name, mimeType: file.type, sizeBytes: file.size, bytes };
}

export async function importResumeAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    await importFirstResume(getDb(), { userId: user.id, profileId: profile.id, upload: await readUpload(formData) });
    revalidatePath("/profile");
    return { ok: true, message: "Résumé imported. Review the extracted evidence below." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Résumé import failed safely. Your existing profile was not changed." };
  }
}

export async function previewResumeReplacementAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    const preview = await previewResumeReplacement(getDb(), { userId: user.id, profileId: profile.id, upload: await readUpload(formData) });
    return { ok: true, message: "Replacement preview generated. Re-upload and check confirmation to replace.", preview };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Replacement preview failed safely." };
  }
}

export async function replaceResumeAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    if (formData.get("confirm") !== "yes") return { ok: false, message: "Confirm that imported résumé data will be archived and replaced." };
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    await replaceResumeImport(getDb(), { userId: user.id, profileId: profile.id, upload: await readUpload(formData), confirmed: true });
    revalidatePath("/profile");
    return { ok: true, message: "Résumé replaced. User-authored evidence was preserved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Résumé replacement failed safely. No partial changes were saved." };
  }
}

export async function correctResumeClaimAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    await correctImportedClaim(getDb(), { userId: user.id, profileId: profile.id, evidenceId: String(formData.get("evidenceId") ?? ""), title: String(formData.get("title") ?? ""), content: String(formData.get("content") ?? "") });
    revalidatePath("/profile");
    return { ok: true, message: "Imported claim corrected and converted to user-approved evidence." };
  } catch {
    return { ok: false, message: "Claim correction failed safely." };
  }
}

export async function deleteResumeSourceAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    if (formData.get("confirm") !== "yes") return { ok: false, message: "Confirm deletion before removing imported résumé data." };
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    await deleteResumeSourceForUser(getDb(), { userId: user.id, profileId: profile.id, resumeSourceId: String(formData.get("resumeSourceId") ?? ""), confirmed: true });
    revalidatePath("/profile");
    return { ok: true, message: "Résumé source deleted. Dependent imported content is excluded from future AI context." };
  } catch {
    return { ok: false, message: "Résumé deletion failed safely." };
  }
}
