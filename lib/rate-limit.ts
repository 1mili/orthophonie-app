import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

/**
 * Simple fixed-window rate limiter backed by Postgres.
 * Not distributed-lock-safe under heavy concurrency, but more than enough
 * to slow down basic brute-force/spam attempts on public forms.
 */
export async function checkRateLimit(
  key: string,
  { max, windowSeconds }: { max: number; windowSeconds: number }
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  const recent = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.bucketKey, key), gt(rateLimits.windowStart, windowStart)));

  const totalCount = recent.reduce((sum, r) => sum + r.count, 0);

  if (totalCount >= max) {
    const oldest = recent.reduce((min, r) => (r.windowStart < min ? r.windowStart : min), new Date());
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest.getTime() + windowSeconds * 1000 - Date.now()) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  if (recent.length > 0) {
    await db
      .update(rateLimits)
      .set({ count: recent[0].count + 1 })
      .where(eq(rateLimits.id, recent[0].id));
  } else {
    await db.insert(rateLimits).values({ bucketKey: key, count: 1 });
  }

  return { allowed: true };
}
