import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { WaveDivider } from "@/components/Waveform";
import { addToCartAction } from "@/app/panier/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boutique — Lisen Wa Kalem",
  description: "Jeux et outils pédagogiques pour stimuler le langage à la maison.",
};

export const dynamic = "force-dynamic";

export default async function BoutiquePage() {
  const catalog = await db.select().from(products);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-coral">
            Boutique
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Jeux &amp; outils pédagogiques
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
            Sélectionnés pour prolonger le travail des séances à la maison.
          </p>
        </div>
        <Link
          href="/panier"
          className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink/30"
        >
          <ShoppingBag className="h-4 w-4" /> Panier
        </Link>
      </div>

      <WaveDivider className="mt-8 max-w-xs" />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((p) => (
          <div key={p.id} className="flex flex-col rounded-2xl border border-line bg-white p-6">
            <Link href={`/boutique/${p.slug}`}>
              <div className="flex h-32 items-center justify-center rounded-xl bg-paper-warm text-5xl">
                {p.imageEmoji}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                {p.name}
              </h3>
              <p className="mt-1.5 text-sm text-ink/60 line-clamp-2">{p.description}</p>
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono-num text-lg font-semibold text-ink">
                {(p.priceCents / 100).toFixed(2)} DT
              </span>
              <form action={addToCartAction}>
                <input type="hidden" name="productId" value={p.id} />
                <button
                  type="submit"
                  className="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-white hover:brightness-95"
                >
                  Ajouter
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
