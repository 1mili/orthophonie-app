import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";
import { getCart } from "@/lib/cart";
import { removeFromCartAction, updateQuantityAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PanierPage() {
  const { items, total } = await getCart();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Votre panier</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-sm text-ink/50">Votre panier est vide.</p>
          <Link href="/boutique" className="mt-3 inline-block text-sm font-semibold text-coral">
            Découvrir la boutique →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper-warm text-2xl">
                  {item.product.imageEmoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.product.name}</div>
                  <div className="font-mono-num text-xs text-ink/50">
                    {(item.product.priceCents / 100).toFixed(2)} DT
                  </div>
                </div>
                <form action={updateQuantityAction} className="flex items-center gap-2">
                  <input type="hidden" name="cartItemId" value={item.id} />
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    defaultValue={item.quantity}
                    className="w-14 rounded-lg border border-line px-2 py-1 text-center font-mono-num text-sm"
                  />
                  <button className="text-xs font-semibold text-sage-deep">Mettre à jour</button>
                </form>
                <form action={removeFromCartAction}>
                  <input type="hidden" name="cartItemId" value={item.id} />
                  <button className="text-ink/40 hover:text-coral">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <span className="text-sm font-semibold text-ink/70">Total</span>
            <span className="font-mono-num text-xl font-semibold">
              {(total / 100).toFixed(2)} DT
            </span>
          </div>

          <Link
            href="/commande"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Passer la commande <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}
