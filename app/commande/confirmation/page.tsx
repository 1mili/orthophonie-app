import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export default async function CommandeConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId
    ? await db.query.orders.findFirst({ where: eq(orders.id, Number(orderId)) })
    : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage-deep">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        Commande confirmée
      </h1>
      {order && (
        <p className="mt-3 text-sm leading-relaxed text-ink/65">
          Commande #{order.id} — {(order.totalCents / 100).toFixed(2)} DT.
          Un email de confirmation a été envoyé à {order.email}.
        </p>
      )}
      <Link
        href="/boutique"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
