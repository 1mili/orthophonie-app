import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, children, appointments } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminParentsPage() {
  const parents = await db
    .select()
    .from(users)
    .where(eq(users.role, "parent"))
    .orderBy(desc(users.createdAt));

  const [allChildren, allAppointments] = await Promise.all([
    db.select().from(children),
    db.select().from(appointments),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Comptes parents</h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-line bg-paper-warm text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Enfants</th>
              <th className="px-4 py-3">RDV</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((p) => {
              const kids = allChildren.filter((c) => c.parentId === p.id);
              const rdvCount = allAppointments.filter((a) => a.parentId === p.id).length;
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold">{p.fullName}</td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{kids.map((k) => k.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3 font-mono-num">{rdvCount}</td>
                  <td className="px-4 py-3 font-mono-num text-xs text-ink/50">
                    {p.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="text-xs font-semibold text-coral hover:underline"
                    >
                      Voir le dossier →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {parents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/40">
                  Aucun parent inscrit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
