import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { requireParent } from "@/lib/require-parent";
import { db } from "@/lib/db";
import { users, children } from "@/lib/db/schema";
import { ProfileForm, PasswordForm } from "./ClientForms";
import { addChild, deleteChild } from "./actions";
import { ExportDataButton } from "./ExportDataButton";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { ArrowLeft, Trash2, User, Key, Users, Sparkles, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await requireParent();

  let user: typeof users.$inferSelect | null = null;
  let myChildren: (typeof children.$inferSelect)[] = [];

  try {
    const res = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, session.userId) }),
      db.select().from(children).where(eq(children.parentId, session.userId)),
    ]);
    user = res[0] ?? null;
    myChildren = res[1];
  } catch (error) {
    console.warn("DB offline in ProfilPage", error);
  }

  if (!user) redirect("/espace-parent/connexion");

  return (
    <div className="w-full min-h-screen px-6 lg:px-12 py-8 space-y-8 bg-[#fbfdfa]">
      <Link
        href="/espace-parent"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a4f] hover:text-[#e0684b] transition"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour à l&apos;espace parent
      </Link>

      <div className="rounded-[2.5rem] border-2 border-[#d4ebd0] bg-gradient-to-r from-[#e8f5e5] via-[#f0f9ff]/70 to-[#fff3f0] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#d4ebd0] text-[#2d6a4f]">
            <User className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              <Sparkles className="h-3 w-3" />
              Compte & Sécurité
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              Mon Profil Parent
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Gérez vos informations de contact, vos enfants et la sécurité de votre compte
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations personnelles */}
        <section className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#2d3748]">
            <User className="h-5 w-5 text-[#2d6a4f]" /> Informations personnelles
          </h2>
          <ProfileForm fullName={user.fullName} phone={user.phone ?? ""} email={user.email} />
        </section>

        {/* Mot de passe */}
        <section className="rounded-3xl border-2 border-[#bae6fd] bg-white p-6 shadow-xs space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#2d3748]">
            <Key className="h-5 w-5 text-[#0284c7]" /> Sécurité & Mot de passe
          </h2>
          <PasswordForm />
        </section>
      </div>

      {/* Mes enfants */}
      <section className="rounded-3xl border-2 border-[#fcd5ce] bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#2d3748]">
            <Users className="h-5 w-5 text-[#e0684b]" /> Mes enfants ({myChildren.length})
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {myChildren.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between rounded-2xl border-2 border-[#e2ede0] bg-[#f4faf2]/50 p-4"
            >
              <div>
                <div className="font-display text-sm font-bold text-[#2d3748]">👦 {c.name}</div>
                {c.age && (
                  <span className="mt-1 inline-block rounded-full bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold text-[#713f12]">
                    {c.age}
                  </span>
                )}
                {c.notes && <p className="mt-1 text-xs text-[#64748b]">{c.notes}</p>}
              </div>

              <form action={deleteChild}>
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  aria-label="Supprimer cet enfant"
                  className="rounded-full p-1.5 text-gray-400 hover:bg-[#fff3f0] hover:text-[#e0684b] transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Formulaire ajout rapide d'un enfant */}
        <form
          action={async (formData: FormData) => {
            "use server";
            await addChild(formData);
          }}
          className="rounded-2xl border-2 border-dashed border-[#fcd5ce] bg-[#fff3f0]/40 p-4 space-y-3"
        >
          <div className="text-xs font-bold text-[#e0684b] uppercase tracking-wider">
            + Ajouter un nouvel enfant
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="name"
              placeholder="Prénom de l'enfant"
              required
              className="rounded-full border-2 border-[#e2ede0] bg-white px-4 py-2 text-xs text-[#2d3748] focus:border-[#f8a98c] focus:outline-hidden"
            />
            <input
              name="age"
              placeholder="Âge (ex: 5 ans)"
              className="rounded-full border-2 border-[#e2ede0] bg-white px-4 py-2 text-xs text-[#2d3748] focus:border-[#f8a98c] focus:outline-hidden"
            />
            <input
              name="notes"
              placeholder="Notes (ex: zozotement, articulation)"
              className="rounded-full border-2 border-[#e2ede0] bg-white px-4 py-2 text-xs text-[#2d3748] focus:border-[#f8a98c] focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-[#f8a98c] px-5 py-2 text-xs font-bold text-white hover:bg-[#e0684b] active:scale-95 transition"
          >
            Enregistrer l&apos;enfant
          </button>
        </form>
      </section>

      {/* Conformité RGPD & Données */}
      <section className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-display text-base font-bold text-[#2d3748]">
            <Shield className="h-5 w-5 text-[#2d6a4f]" /> Données personnelles & RGPD
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Vous pouvez exporter une copie intégrale de vos données ou supprimer votre compte définitivement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportDataButton />
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
