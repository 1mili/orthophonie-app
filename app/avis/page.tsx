import { desc, eq } from "drizzle-orm";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { WaveDivider } from "@/components/Waveform";
import { ReviewForm } from "./ReviewForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avis — Lisen Wa Kalem",
};

export const dynamic = "force-dynamic";

export default async function AvisPage() {
  const approved = await db
    .select()
    .from(reviews)
    .where(eq(reviews.approved, true))
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-coral">Avis</span>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        L&apos;avis des familles
      </h1>
      <WaveDivider className="mt-8 max-w-xs" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {approved.length === 0 && (
          <p className="text-sm text-ink/50 sm:col-span-2">
            Aucun avis publié pour le moment.
          </p>
        )}
        {approved.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex gap-0.5 text-marigold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" fill={i < r.rating ? "currentColor" : "none"} />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">{r.comment}</p>
            <p className="mt-3 text-xs font-semibold text-ink/50">{r.authorName}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-xl font-semibold">Laisser un avis</h2>
        <div className="mt-4">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
