"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "jeux");
  const price = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const imageEmoji = String(formData.get("imageEmoji") ?? "🧩");

  if (!name || !description || price <= 0) return;

  await db.insert(products).values({
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    name,
    description,
    category,
    priceCents: Math.round(price * 100),
    stock,
    imageEmoji,
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}
