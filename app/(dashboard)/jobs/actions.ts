"use server";
import { revalidatePath } from "next/cache";
import { requireActiveUser } from "@/lib/auth/authorization";
import { getDb } from "@/lib/db";
import { importManualJobForUser } from "@/lib/jobs/service";

export async function importManualJobAction(_: unknown, formData: FormData) {
  const user = await requireActiveUser();
  try {
    const result = await importManualJobForUser(getDb(), { userId: user.id, title: String(formData.get("title") ?? ""), company: String(formData.get("company") ?? ""), location: String(formData.get("location") ?? "") || undefined, workStyle: String(formData.get("workStyle") ?? "unknown") as "remote" | "hybrid" | "onsite" | "unknown", salaryMin: String(formData.get("salaryMin") ?? "") || undefined, salaryMax: String(formData.get("salaryMax") ?? "") || undefined, closingDate: String(formData.get("closingDate") ?? "") || undefined, canonicalUrl: String(formData.get("canonicalUrl") ?? "") || undefined, description: String(formData.get("description") ?? "") });
    revalidatePath("/jobs");
    return { ok: true, message: result.duplicate ? "Duplicate warning: saved the existing matching job instead of creating another." : "Manual job imported and saved." };
  } catch {
    return { ok: false, message: "Manual import failed validation. No external URL was fetched." };
  }
}

export async function saveJobAction(formData: FormData) {
  const user = await requireActiveUser();
  await import("@/lib/jobs/service").then(({ setUserJobState }) => setUserJobState(getDb(), { userId: user.id, jobId: String(formData.get("jobId") ?? ""), action: "save", notes: String(formData.get("notes") ?? "") || undefined }));
  revalidatePath("/jobs");
}

export async function dismissJobAction(formData: FormData) {
  const user = await requireActiveUser();
  await import("@/lib/jobs/service").then(({ setUserJobState }) => setUserJobState(getDb(), { userId: user.id, jobId: String(formData.get("jobId") ?? ""), action: "dismiss" }));
  revalidatePath("/jobs");
}

export async function restoreJobAction(formData: FormData) {
  const user = await requireActiveUser();
  await import("@/lib/jobs/service").then(({ setUserJobState }) => setUserJobState(getDb(), { userId: user.id, jobId: String(formData.get("jobId") ?? ""), action: "restore" }));
  revalidatePath("/jobs");
}


export async function importManualJobFormAction(formData: FormData) {
  await importManualJobAction(null, formData);
  revalidatePath("/jobs");
}
