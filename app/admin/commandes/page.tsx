import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { updateOrderStatus } from "./actions";
import { ShoppingBag, Package } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export default async function AdminCommandesPage() {
  let rows: (typeof orders.$inferSelect)[] = [];
  try {
    rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (error) {
    console.warn("DB offline in AdminCommandesPage", error);
  }

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-[2.5rem] border-2 border-[#fcd5ce] bg-gradient-to-r from-[#fff3f0] via-[#fef9c3]/50 to-[#e8f5e5] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#fcd5ce] text-[#e0684b]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#e0684b]">
              Gestion E-Commerce
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              Commandes de la Boutique
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Suivi et gestion des colis expédiés aux familles de patients
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((o) => (
          <div key={o.id} className="rounded-3xl border-2 border-[#e2ede0] bg-white p-5 shadow-xs hover:border-[#2d6a4f]/30 transition">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-[#2d3748]">
                  Commande #{o.id} — {o.customerName}
                </div>
                <div className="mt-1 text-xs text-[#64748b]">{o.email} · {o.phone} · 📍 {o.address}</div>
                {o.trackingNumber && (
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#0284c7]">
                    <Package className="h-3.5 w-3.5" />
                    Suivi: {o.trackingNumber}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono-num text-base font-bold text-[#2d3748] bg-[#e8f5e5] border border-[#d4ebd0] px-3 py-1 rounded-full">
                  {(o.totalCents / 100).toFixed(2)} DT
                </span>
                <form action={updateOrderStatus} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <select
                    name="status"
                    defaultValue={o.status}
                    className="rounded-full border-2 border-[#d4ebd0] px-3.5 py-1.5 text-xs font-bold text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    name="trackingNumber"
                    defaultValue={o.trackingNumber ?? ""}
                    placeholder="N° suivi"
                    className="rounded-full border-2 border-[#e2ede0] px-3.5 py-1.5 text-xs focus:border-[#f8a98c] focus:outline-hidden"
                  />
                  <button className="rounded-full bg-[#f8a98c] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e0684b] active:scale-95 transition">
                    Valider
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-[#d4ebd0] bg-[#e8f5e5]/40 p-8 text-center text-xs text-[#64748b]">
            Aucune commande pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
