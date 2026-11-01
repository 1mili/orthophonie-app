import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { consultations, appointments } from "@/lib/db/schema";
import { saveConsultationNotes, endConsultation } from "./actions";
import { Video, StickyNote, CheckCircle, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Programmée",
  ongoing: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
};
const STATUS_COLOR: Record<string, string> = {
  scheduled: "bg-[#fef9c3] text-[#713f12] border border-[#fef08a]",
  ongoing: "bg-[#fff3f0] text-[#e0684b] border border-[#fcd5ce]",
  completed: "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]",
  cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default async function AdminTeleconsultationsPage() {
  let rows: {
    id: number;
    roomCode: string;
    status: "scheduled" | "ongoing" | "completed" | "cancelled";
    notes: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
    date: string;
    time: string;
    childName: string;
    parentName: string;
    email: string;
  }[] = [];

  try {
    rows = await db
      .select({
        id: consultations.id,
        roomCode: consultations.roomCode,
        status: consultations.status,
        notes: consultations.notes,
        startedAt: consultations.startedAt,
        endedAt: consultations.endedAt,
        date: appointments.date,
        time: appointments.time,
        childName: appointments.childName,
        parentName: appointments.parentName,
        email: appointments.email,
      })
      .from(consultations)
      .innerJoin(appointments, eq(consultations.appointmentId, appointments.id))
      .orderBy(desc(appointments.date));
  } catch (error) {
    console.warn("DB offline in AdminTeleconsultationsPage", error);
  }

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-[2.5rem] border-2 border-[#bae6fd] bg-gradient-to-r from-[#f0f9ff] via-[#e8f5e5]/50 to-[#fff3f0] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#bae6fd] text-[#0284c7]">
            <Video className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0284c7]">
              <Sparkles className="h-3 w-3" />
              Console Vidéo Haute Définition
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              Téléconsultations WebRTC
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Gestion et lancement direct des séances cliniques vidéo chiffrées de bout en bout
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rows.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-[#bae6fd] bg-[#f0f9ff]/40 p-10 text-center text-xs text-[#64748b]">
            <Video className="mx-auto mb-3 h-8 w-8 text-[#0284c7]/40" />
            Aucune téléconsultation programmée pour le moment.
          </div>
        )}

        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-3xl border-2 border-[#bae6fd] bg-white p-6 shadow-xs hover:shadow-md transition"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-[#2d3748]">
                    {r.childName}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      STATUS_COLOR[r.status]
                    }`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[#64748b]">
                  Parent : {r.parentName} ({r.email})
                </div>
                <div className="mt-1 font-mono-num text-xs font-bold text-[#2d6a4f]">
                  📅 {r.date} à {r.time}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/teleconsultation/${r.roomCode}`}
                  className="rounded-full bg-[#f8a98c] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition"
                >
                  Lancer la consultation →
                </Link>

                {r.status === "ongoing" && (
                  <form action={endConsultation}>
                    <input type="hidden" name="consultationId" value={r.id} />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0]"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Terminer
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Notes form */}
            <form action={saveConsultationNotes} className="mt-5 border-t border-[#e2ede0] pt-4">
              <input type="hidden" name="consultationId" value={r.id} />
              <label
                htmlFor={`notes-${r.id}`}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2d6a4f]"
              >
                <StickyNote className="h-3.5 w-3.5" /> Notes de séance & observations
              </label>
              <div className="mt-2 flex gap-2">
                <textarea
                  id={`notes-${r.id}`}
                  name="notes"
                  defaultValue={r.notes ?? ""}
                  placeholder="Notes cliniques, exercices recommandés pour la maison..."
                  rows={2}
                  className="w-full rounded-2xl border-2 border-[#e2ede0] p-3 text-xs text-[#2d3748] placeholder:text-gray-400 focus:border-[#2d6a4f] focus:outline-hidden resize-none"
                />
                <button
                  type="submit"
                  className="self-end shrink-0 rounded-full bg-[#2d6a4f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4332] active:scale-95 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
