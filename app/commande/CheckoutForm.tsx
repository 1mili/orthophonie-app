"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { checkout, type CheckoutState } from "./actions";

export function CheckoutForm() {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    checkout,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Nom complet</span>
        <input name="customerName" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Email</span>
        <input name="email" type="email" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Téléphone</span>
        <input name="phone" type="tel" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Adresse de livraison</span>
        <textarea name="address" required rows={3} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>

      {state.error && (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmer et payer
      </button>
      <p className="text-center text-xs text-ink/40">
        Paiement sécurisé via Stripe. En mode développement (sans clé Stripe live), la commande est enregistrée directement.
      </p>
    </form>
  );
}
