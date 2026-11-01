"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bilans } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function createBilan(formData: FormData) {
  await requireAdmin();

  const parentId = Number(formData.get("parentId"));
  let childName = String(formData.get("childName") ?? "").trim();
  if (childName === "__autre__") {
    childName = String(formData.get("childNameOther") ?? "").trim();
  }
  const assessmentDate = String(formData.get("assessmentDate") ?? "").trim();
  const languageScore = formData.get("languageScore")
    ? Number(formData.get("languageScore"))
    : null;
  const readingScore = formData.get("readingScore")
    ? Number(formData.get("readingScore"))
    : null;
  const expressionScore = formData.get("expressionScore")
    ? Number(formData.get("expressionScore"))
    : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const recommendations =
    String(formData.get("recommendations") ?? "").trim() || null;

  if (!parentId || !childName || !assessmentDate) return;

  await db.insert(bilans).values({
    parentId,
    childName,
    assessmentDate,
    languageScore,
    readingScore,
    expressionScore,
    notes,
    recommendations,
  });

  revalidatePath(`/admin/patients/${parentId}`);
  redirect(`/admin/patients/${parentId}`);
}
