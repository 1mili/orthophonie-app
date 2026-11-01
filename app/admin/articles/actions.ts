"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/require-admin";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "langage");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const premium = formData.get("premium") === "true";

  if (!title || !excerpt || !content) return;

  await db.insert(articles).values({
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    title,
    excerpt,
    content,
    category,
    videoUrl: videoUrl || null,
    premium,
    published: true,
  });

  revalidatePath("/admin/articles");
  revalidatePath("/blog");
}

export async function toggleArticlePublished(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";
  await db.update(articles).set({ published: !published }).where(eq(articles.id, id));
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
}
