import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { addToCartAction } from "@/app/panier/actions";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  return { title: product ? `${product.name} — Boutique` : "Produit" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/boutique" className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour à la boutique
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="flex h-72 items-center justify-center rounded-3xl bg-paper-warm text-8xl">
          {product.imageEmoji}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-deep">
            {product.category}
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/70">{product.description}</p>
          <div className="mt-6 font-mono-num text-2xl font-semibold text-ink">
            {(product.priceCents / 100).toFixed(2)} DT
          </div>
          <p className="mt-1 text-xs text-ink/45">
            {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
          </p>

          <form action={addToCartAction} className="mt-6">
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              disabled={product.stock === 0}
              className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-40"
            >
              Ajouter au panier
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
