"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { getDb } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth";
import { requireActiveUser } from "@/lib/auth/authorization";
import { profileFormSchema } from "@/lib/domain/profile/schema";
import { updateProfileForUser } from "@/lib/domain/profile/service";

export async function saveProfileAction(_: unknown, formData: FormData) {
  const parsed = profileFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Check the highlighted profile fields and try again." };

  const session = await getServerSession(authOptions);
  if (!process.env.DATABASE_URL || !session?.user?.id) {
    return { ok: true, message: "Profile sign-in is disabled, so this demo profile was not persisted." };
  }

  const user = await requireActiveUser();
  await updateProfileForUser(getDb(), user.id, parsed.data);
  revalidatePath("/profile");
  return { ok: true, message: "Profile saved." };
}
