import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, children } from "@/lib/db/schema";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { createBilan } from "./actions";

export const dynamic = "force-dynamic";

export default async function NouveauBilanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parentId = Number(id);
  if (isNaN(parentId)) notFound();

  const [parent, myChildren] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, parentId) }),
    db.select().from(children).where(eq(children.parentId, parentId)),
  ]);

  if (!parent) notFound();

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Link
        href={`/admin/patients/${parentId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour au dossier
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-coral" />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Nouveau bilan orthophonique
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Patient : {parent.fullName}
          </p>
        </div>
      </div>

      <form
        action={createBilan}
        className="mt-8 rounded-2xl border border-line bg-white p-6 space-y-5"
      >
        <input type="hidden" name="parentId" value={parentId} />

        {/* Child name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Nom de l&apos;enfant
          </label>
          {myChildren.length > 0 ? (
            <>
              <select
                name="childName"
                required
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
              >
                {myChildren.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}{c.age ? ` (${c.age})` : ""}
                  </option>
                ))}
                <option value="__autre__">Autre</option>
              </select>
              <input
                name="childNameOther"
                placeholder="Prénom si « Autre »"
                className="mt-2 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
              />
            </>
          ) : (
            <input
              name="childName"
              required
              placeholder="Prénom de l'enfant"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
            />
          )}
        </div>

        {/* Assessment date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Date du bilan
          </label>
          <input
            name="assessmentDate"
            type="date"
            required
            defaultValue={today}
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
          />
        </div>

        {/* Scores */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Score langage (0–100)
            </label>
            <input
              name="languageScore"
              type="number"
              min={0}
              max={100}
              placeholder="ex: 72"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Score lecture (0–100)
            </label>
            <input
              name="readingScore"
              type="number"
              min={0}
              max={100}
              placeholder="ex: 68"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Score expression (0–100)
            </label>
            <input
              name="expressionScore"
              type="number"
              min={0}
              max={100}
              placeholder="ex: 80"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
            />
          </div>
        </div>

        {/* Clinical notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Observations cliniques
          </label>
          <textarea
            name="notes"
            rows={4}
            placeholder="Observations sur le déroulement du bilan, comportement, points forts / points de vigilance…"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
          />
        </div>

        {/* Recommendations */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Recommandations
          </label>
          <textarea
            name="recommendations"
            rows={3}
            placeholder="Séances hebdomadaires, exercices à la maison, orientation vers un autre spécialiste…"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
          <Link
            href={`/admin/patients/${parentId}`}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink/60 hover:border-ink/30"
          >
            Annuler
          </Link>
          <button className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95">
            Enregistrer le bilan
          </button>
        </div>
      </form>
    </div>
  );
}
