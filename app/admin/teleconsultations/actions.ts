"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultations } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const saveNotesSchema = z.object({
  consultationId: z.coerce.number().int().positive("Identifiant de consultation invalide"),
  notes: z.string().max(10_000, "Notes trop volumineuses").optional().default(""),
});

const endConsultationSchema = z.object({
  consultationId: z.coerce.number().int().positive("Identifiant de consultation invalide"),
});

export async function saveConsultationNotes(formData: FormData) {
  await requireAdmin();

  // Support both consultationId and id for robust backwards-compatibility
  const rawId = formData.get("consultationId") ?? formData.get("id");
  const rawNotes = formData.get("notes");

  const parsed = saveNotesSchema.safeParse({
    consultationId: rawId,
    notes: typeof rawNotes === "string" ? rawNotes : "",
  });

  if (!parsed.success) {
    console.error("saveConsultationNotes validation failed:", parsed.error);
    return;
  }

  const { consultationId, notes } = parsed.data;

  await db
    .update(consultations)
    .set({ notes: notes.trim() || null })
    .where(eq(consultations.id, consultationId));

  // Revalidate both admin and parent spaces
  revalidatePath("/admin/teleconsultations");
  revalidatePath("/admin");
  revalidatePath("/espace-parent");
  revalidatePath("/espace-parent/teleconsultations");
}

export async function endConsultation(formData: FormData) {
  await requireAdmin();

  const rawId = formData.get("consultationId") ?? formData.get("id");
  const parsed = endConsultationSchema.safeParse({ consultationId: rawId });

  if (!parsed.success) {
    console.error("endConsultation validation failed:", parsed.error);
    return;
  }

  const { consultationId } = parsed.data;

  await db
    .update(consultations)
    .set({ status: "completed", endedAt: new Date() })
    .where(eq(consultations.id, consultationId));

  // Revalidate both admin and parent spaces
  revalidatePath("/admin/teleconsultations");
  revalidatePath("/admin");
  revalidatePath("/espace-parent");
  revalidatePath("/espace-parent/teleconsultations");
}
