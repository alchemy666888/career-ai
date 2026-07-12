"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireActiveUser } from "@/lib/auth/authorization";
import { profileFormSchema } from "@/lib/domain/profile/schema";
import { updateProfileForUser } from "@/lib/domain/profile/service";

export async function saveProfileAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  const parsed = profileFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the highlighted profile fields and try again." };
  await updateProfileForUser(getDb(), user.id, parsed.data);
  revalidatePath("/profile");
  return { ok: true, message: "Profile saved." };
}
