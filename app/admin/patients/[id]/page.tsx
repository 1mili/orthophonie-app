import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  children,
  appointments,
  consultations,
  consultationDocuments,
  bilans,
} from "@/lib/db/schema";
import {
  ArrowLeft,
  User,
  CalendarDays,
  Video,
  FileText,
  ClipboardList,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PatientDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parentId = Number(id);
  if (isNaN(parentId)) notFound();

  const [parent, myChildren, allAppointments, allBilans] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, parentId) }),
    db.select().from(children).where(eq(children.parentId, parentId)),
    db
      .select()
      .from(appointments)
      .where(eq(appointments.parentId, parentId)),
    db.select().from(bilans).where(eq(bilans.parentId, parentId)),
  ]);

  if (!parent) notFound();

  // Fetch consultations for these appointments
  const appointmentIds = allAppointments.map((a) => a.id);
  const myConsultations =
    appointmentIds.length > 0
      ? await db
          .select()
          .from(consultations)
          .where(inArray(consultations.appointmentId, appointmentIds))
      : [];

  const consultationIds = myConsultations.map((c) => c.id);
  const myDocs =
    consultationIds.length > 0
      ? await db
          .select()
          .from(consultationDocuments)
          .where(inArray(consultationDocuments.consultationId, consultationIds))
      : [];

  const appointmentMap = new Map(allAppointments.map((a) => [a.id, a]));

  const STATUS_LABEL: Record<string, string> = {
    scheduled: "Programmée",
    ongoing: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  const STATUS_COLOR: Record<string, string> = {
    scheduled: "bg-marigold/15 text-marigold",
    ongoing: "bg-coral/10 text-coral",
    completed: "bg-sage/10 text-sage-deep",
    cancelled: "bg-line text-ink/50",
  };

  return (
    <div>
      <Link
        href="/admin/patients"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour aux dossiers
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dossier patient
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {parent.fullName} · {parent.email}
          </p>
        </div>
        <Link
          href={`/admin/patients/${parentId}/bilan`}
          className="flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
          Nouveau bilan
        </Link>
      </div>

      {/* Personal info */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <User className="h-4 w-4 text-coral" /> Informations personnelles
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Nom</dt>
            <dd className="mt-1 font-semibold">{parent.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Email</dt>
            <dd className="mt-1 text-ink/70">{parent.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Téléphone</dt>
            <dd className="mt-1 text-ink/70">{parent.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-ink/45">Inscrit le</dt>
            <dd className="mt-1 font-mono-num text-xs text-ink/60">
              {parent.createdAt.toLocaleDateString("fr-FR")}
            </dd>
          </div>
        </dl>

        {myChildren.length > 0 && (
          <div className="mt-5 border-t border-line pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45">
              Enfants
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {myChildren.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-line bg-paper-warm px-4 py-2 text-sm"
                >
                  <span className="font-semibold">{c.name}</span>
                  {c.age && <span className="ms-2 text-ink/50">{c.age}</span>}
                  {c.notes && (
                    <p className="mt-1 text-xs text-ink/50">{c.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Appointments history */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <CalendarDays className="h-4 w-4 text-coral" /> Rendez-vous ({allAppointments.length})
        </h2>
        {allAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-ink/40">Aucun rendez-vous.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="pb-3 pe-4">Date</th>
                  <th className="pb-3 pe-4">Enfant</th>
                  <th className="pb-3 pe-4">Service</th>
                  <th className="pb-3 pe-4">Mode</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments
                  .sort((a, b) => (b.date > a.date ? 1 : -1))
                  .map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-0">
                      <td className="py-3 pe-4 font-mono-num">{a.date} {a.time}</td>
                      <td className="py-3 pe-4">{a.childName}</td>
                      <td className="py-3 pe-4 text-ink/70">{a.service}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-semibold text-sage-deep">
                          {a.mode === "teleconsultation" ? "Télé" : "Cabinet"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Consultations */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Video className="h-4 w-4 text-coral" /> Téléconsultations ({myConsultations.length})
        </h2>
        {myConsultations.length === 0 ? (
          <p className="mt-4 text-sm text-ink/40">Aucune téléconsultation.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {myConsultations
              .sort((a, b) => {
                const aDate = appointmentMap.get(a.appointmentId)?.date ?? "";
                const bDate = appointmentMap.get(b.appointmentId)?.date ?? "";
                return bDate > aDate ? 1 : -1;
              })
              .map((c) => {
                const appt = appointmentMap.get(c.appointmentId);
                const docs = myDocs.filter((d) => d.consultationId === c.id);
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-line p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono-num text-sm font-semibold">
                          {appt?.date} · {appt?.time}
                        </span>
                        <span
                          className={`ms-2 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[c.status]}`}
                        >
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      <Link
                        href={`/teleconsultation/${c.roomCode}`}
                        className="text-xs font-semibold text-coral hover:underline"
                      >
                        Rejoindre →
                      </Link>
                    </div>
                    {c.notes && (
                      <p className="mt-2 rounded-lg bg-sage/5 p-2 text-xs text-ink/70">
                        📝 {c.notes}
                      </p>
                    )}
                    {docs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {docs.map((d) => (
                          <a
                            key={d.id}
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full border border-line bg-paper-warm px-2.5 py-1 text-xs text-ink/60 hover:text-coral"
                          >
                            <FileText className="h-3 w-3" />
                            {d.fileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Bilans */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ClipboardList className="h-4 w-4 text-coral" /> Bilans orthophoniques ({allBilans.length})
          </h2>
          <Link
            href={`/admin/patients/${parentId}/bilan`}
            className="text-xs font-semibold text-coral hover:underline"
          >
            + Nouveau bilan
          </Link>
        </div>
        {allBilans.length === 0 ? (
          <p className="mt-4 text-sm text-ink/40">Aucun bilan enregistré.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {allBilans
              .sort((a, b) => (b.assessmentDate > a.assessmentDate ? 1 : -1))
              .map((b) => (
                <div key={b.id} className="rounded-xl border border-line p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-semibold">{b.childName}</span>
                      <span className="ms-2 font-mono-num text-xs text-ink/50">
                        {b.assessmentDate}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono-num">
                      {b.languageScore != null && (
                        <span>
                          <span className="text-ink/40">Langage</span>{" "}
                          <strong>{b.languageScore}/100</strong>
                        </span>
                      )}
                      {b.readingScore != null && (
                        <span>
                          <span className="text-ink/40">Lecture</span>{" "}
                          <strong>{b.readingScore}/100</strong>
                        </span>
                      )}
                      {b.expressionScore != null && (
                        <span>
                          <span className="text-ink/40">Expression</span>{" "}
                          <strong>{b.expressionScore}/100</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  {b.notes && (
                    <p className="mt-2 text-xs text-ink/65">{b.notes}</p>
                  )}
                  {b.recommendations && (
                    <div className="mt-2 rounded-lg bg-marigold/5 p-2 text-xs text-ink/70">
                      <strong className="text-marigold">Recommandations :</strong>{" "}
                      {b.recommendations}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
