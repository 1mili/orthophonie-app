import { desc } from "drizzle-orm";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { approveReview, rejectReview } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAvisPage() {
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  const pending = rows.filter((r) => !r.approved);
  const approved = rows.filter((r) => r.approved);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Avis</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-coral">
          En attente ({pending.length})
        </h2>
        <div className="mt-4 space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex gap-0.5 text-marigold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5" fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-ink/75">{r.comment}</p>
                  <p className="mt-2 text-xs font-semibold text-ink/45">{r.authorName}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-full bg-sage px-3 py-1.5 text-xs font-semibold text-white">
                      Approuver
                    </button>
                  </form>
                  <form action={rejectReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink/60">
                      Rejeter
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-ink/40">Aucun avis en attente.</p>}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sage-deep">
          Publiés ({approved.length})
        </h2>
        <div className="mt-4 space-y-3">
          {approved.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-ink/75">{r.comment}</p>
              <p className="mt-2 text-xs font-semibold text-ink/45">{r.authorName}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
