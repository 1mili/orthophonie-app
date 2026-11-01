"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function approveReview(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id));
  revalidatePath("/admin/avis");
  revalidatePath("/avis");
}

export async function rejectReview(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/avis");
  revalidatePath("/avis");
}
