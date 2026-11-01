import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

function viewKey(articleId: number) {
  return `article-view:${articleId}`;
}

/** Persist a page view using the existing rate_limits table (no extra migration). */
export async function recordArticleView(articleId: number) {
  const key = viewKey(articleId);
  const existing = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.bucketKey, key))
    .limit(1);

  if (existing[0]) {
    await db
      .update(rateLimits)
      .set({ count: existing[0].count + 1 })
      .where(eq(rateLimits.id, existing[0].id));
  } else {
    await db.insert(rateLimits).values({ bucketKey: key, count: 1 });
  }
}

export async function getArticleViewCounts(): Promise<Record<number, number>> {
  const rows = await db.select().from(rateLimits);
  const counts: Record<number, number> = {};
  for (const row of rows) {
    if (!row.bucketKey.startsWith("article-view:")) continue;
    const id = Number(row.bucketKey.slice("article-view:".length));
    if (!Number.isNaN(id)) counts[id] = row.count;
  }
  return counts;
}
