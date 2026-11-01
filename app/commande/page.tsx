import { getCart } from "@/lib/cart";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CommandePage() {
  const { items, total } = await getCart();
  if (items.length === 0) redirect("/boutique");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Finaliser la commande
      </h1>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm text-ink/70">
              <span>{item.quantity} × {item.product.name}</span>
              <span className="font-mono-num">
                {((item.product.priceCents * item.quantity) / 100).toFixed(2)} DT
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-semibold">
          <span>Total</span>
          <span className="font-mono-num">{(total / 100).toFixed(2)} DT</span>
        </div>
      </div>

      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
