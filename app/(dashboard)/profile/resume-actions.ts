"use server";

import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { getOrCreateProfileForUser } from "@/lib/domain/profile/service";
import { importFirstResume } from "@/lib/domain/resume/service";

export async function importResumeAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  const file = formData.get("resume");
  if (!(file instanceof File)) return { ok: false, message: "Choose a PDF or DOCX résumé." };
  try {
    const profile = await getOrCreateProfileForUser(getDb(), user.id);
    const bytes = new Uint8Array(await file.arrayBuffer());
    await importFirstResume(getDb(), { userId: user.id, profileId: profile.id, upload: { fileName: file.name, mimeType: file.type, sizeBytes: file.size, bytes } });
    revalidatePath("/profile");
    return { ok: true, message: "Résumé imported. Review the extracted evidence below." };
  } catch {
    return { ok: false, message: "Résumé import failed safely. Your existing profile was not changed." };
  }
}
