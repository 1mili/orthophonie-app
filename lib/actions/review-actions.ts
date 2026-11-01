"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { reviewSchema, firstZodError } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export type ReviewState = { error?: string; success?: boolean };

export async function submitReview(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`review:${ip}`, { max: 5, windowSeconds: 3600 });
  if (!rl.allowed) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const session = await getSession();

  await db.insert(reviews).values({
    authorName: parsed.data.authorName,
    parentId: session?.userId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    approved: false,
  });

  revalidatePath("/avis");
  return { success: true };
}
