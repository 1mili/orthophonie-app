import Link from "next/link";
import { eq, inArray, or } from "drizzle-orm";
import { requireParent } from "@/lib/require-parent";
import { db } from "@/lib/db";
import { appointments, consultations, consultationDocuments } from "@/lib/db/schema";
import { ArrowLeft, Video, FileText, Clock, Sparkles } from "lucide-react";
import { getTeleconsultationWindowStatus } from "@/lib/teleconsultation-window";

export const dynamic = "force-dynamic";

function formatDuration(startedAt: Date | null, endedAt: Date | null): string {
  if (!startedAt) return "—";
  const end = endedAt ?? new Date();
  const diffMs = end.getTime() - startedAt.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return endedAt
    ? `${minutes} min ${seconds} s`
    : `En cours (${minutes} min)`;
}

export default async function TeleconsultationsParentPage() {
  const session = await requireParent();

  let parentAppointments: (typeof appointments.$inferSelect)[] = [];
  let myConsultations: {
    id: number;
    roomCode: string;
    status: "scheduled" | "ongoing" | "completed" | "cancelled";
    notes: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
    appointmentId: number;
  }[] = [];
  let allDocs: (typeof consultationDocuments.$inferSelect)[] = [];

  try {
    parentAppointments = await db
      .select()
      .from(appointments)
      .where(
        or(
          eq(appointments.parentId, session.userId),
          eq(appointments.email, session.email)
        )
      );

    const appointmentIds = parentAppointments.map((a) => a.id);
    if (appointmentIds.length > 0) {
      myConsultations = await db
        .select({
          id: consultations.id,
          roomCode: consultations.roomCode,
          status: consultations.status,
          notes: consultations.notes,
          startedAt: consultations.startedAt,
          endedAt: consultations.endedAt,
          appointmentId: consultations.appointmentId,
        })
        .from(consultations)
        .where(inArray(consultations.appointmentId, appointmentIds));

      const consultationIds = myConsultations.map((c) => c.id);
      if (consultationIds.length > 0) {
        allDocs = await db
          .select()
          .from(consultationDocuments)
          .where(inArray(consultationDocuments.consultationId, consultationIds));
      }
    }
  } catch (error) {
    console.warn("DB offline in TeleconsultationsParentPage", error);
  }

  const appointmentMap = new Map(parentAppointments.map((a) => [a.id, a]));

  const sorted = myConsultations.sort((a, b) => {
    const aAppt = appointmentMap.get(a.appointmentId);
    const bAppt = appointmentMap.get(b.appointmentId);
    return (bAppt?.date ?? "") > (aAppt?.date ?? "") ? 1 : -1;
  });

  const statusLabel: Record<string, string> = {
    scheduled: "Programmée",
    ongoing: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  const statusColor: Record<string, string> = {
    scheduled: "bg-[#fef9c3] text-[#713f12] border border-[#fef08a]",
    ongoing: "bg-[#fff3f0] text-[#e0684b] border border-[#fcd5ce]",
    completed: "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]",
    cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
  };

  return (
    <div className="w-full min-h-screen px-6 lg:px-12 py-8 space-y-6 bg-[#fbfdfa]">
      <Link
        href="/espace-parent"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#2d6a4f] hover:text-[#e0684b] transition"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour à l&apos;espace parent
      </Link>

      <div className="rounded-[2.5rem] border-2 border-[#bae6fd] bg-gradient-to-r from-[#f0f9ff] via-[#e8f5e5]/50 to-[#fff3f0] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#bae6fd] text-[#0284c7]">
            <Video className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              <Sparkles className="h-3 w-3" />
              Séances Vidéo WebRTC
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              Mes Téléconsultations
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Accédez aux séances vidéo en direct avec votre orthophoniste et téléchargez les documents partagés
            </p>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#bae6fd] bg-[#f0f9ff]/40 p-10 text-center text-xs text-[#64748b]">
          <Video className="mx-auto mb-3 h-8 w-8 text-[#0284c7]/40" />
          Aucune téléconsultation pour le moment.{" "}
          <Link href="/rdv" className="font-bold text-[#e0684b] hover:underline">
            Prendre un rendez-vous →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((c) => {
            const appt = appointmentMap.get(c.appointmentId);
            const docs = allDocs.filter((d) => d.consultationId === c.id);
            const windowStatus = getTeleconsultationWindowStatus(
              appt?.date ?? "",
              appt?.time ?? "",
              c.status,
              appt?.mode
            );

            return (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 shadow-xs hover:border-[#2d6a4f]/40 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display text-base font-bold text-[#2d3748]">
                        {appt?.childName ? `Séance pour ${appt.childName}` : "Téléconsultation"}
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono-num text-xs text-[#64748b]">
                        📅 {appt?.date} à {appt?.time}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusColor[c.status]
                      }`}
                    >
                      {statusLabel[c.status]}
                    </span>
                  </div>

                  {c.startedAt && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748b]">
                      <Clock className="h-3.5 w-3.5 text-[#2d6a4f]" />
                      Durée : {formatDuration(c.startedAt, c.endedAt)}
                    </div>
                  )}

                  {docs.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[11px] font-bold text-[#64748b] mb-1.5">
                        Documents partagés ({docs.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {docs.map((d) => (
                          <a
                            key={d.id}
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-[#d4ebd0] bg-[#f4faf2] px-3 py-1 text-xs font-semibold text-[#2d6a4f] hover:bg-[#e8f5e5]"
                          >
                            <FileText className="h-3 w-3" />
                            {d.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#e2ede0]">
                  {windowStatus.joinable ? (
                    <Link
                      href={`/teleconsultation/${c.roomCode}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f8a98c] py-3 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition"
                    >
                      <Video className="h-4 w-4" />
                      Rejoindre la séance en vidéo (1-clic)
                    </Link>
                  ) : (
                    <div className="rounded-full bg-gray-50 border border-gray-200 py-2.5 text-center text-xs font-semibold text-gray-500">
                      {windowStatus.labelFr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
