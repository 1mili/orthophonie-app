"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim() || null;

  await db
    .update(orders)
    .set({ status, trackingNumber, updatedAt: new Date() })
    .where(eq(orders.id, id));

  revalidatePath("/admin/commandes");
}
