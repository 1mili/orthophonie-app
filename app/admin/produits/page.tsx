import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { createProduct, deleteProduct } from "./actions";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  const rows = await db.select().from(products);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Produits</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.imageEmoji}</span>
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="font-mono-num text-xs text-ink/50">
                    {(p.priceCents / 100).toFixed(2)} DT · stock {p.stock}
                  </div>
                </div>
              </div>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-ink/30 hover:text-coral">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Nouveau produit</h2>
          <form action={createProduct} className="mt-4 space-y-4">
            <input name="name" placeholder="Nom du produit" required className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <textarea name="description" placeholder="Description" required rows={3} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <select name="category" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral">
              <option value="jeux">Jeux</option>
              <option value="cartes">Cartes</option>
              <option value="outils">Outils</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input name="price" type="number" step="0.01" placeholder="Prix (DT)" required className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
              <input name="stock" type="number" placeholder="Stock" required className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            </div>
            <input name="imageEmoji" placeholder="Emoji (ex: 🧩)" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <button className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95">
              Ajouter le produit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
