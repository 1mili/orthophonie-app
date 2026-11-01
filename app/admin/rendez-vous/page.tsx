import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { appointments, consultations } from "@/lib/db/schema";
import { Calendar, Video, MapPin, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRendezVousPage() {
  let rows: (typeof appointments.$inferSelect)[] = [];
  let teleRows: (typeof consultations.$inferSelect)[] = [];

  try {
    const res = await Promise.all([
      db.select().from(appointments).orderBy(desc(appointments.date)),
      db.select().from(consultations),
    ]);
    rows = res[0];
    teleRows = res[1];
  } catch (error) {
    console.warn("DB offline in AdminRendezVousPage", error);
  }

  const roomByAppointment = new Map(teleRows.map((c) => [c.appointmentId, c.roomCode]));

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-[2.5rem] border-2 border-[#d4ebd0] bg-gradient-to-r from-[#e8f5e5] via-[#f0f9ff]/70 to-[#fff3f0] p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#d4ebd0] text-[#2d6a4f]">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              <Sparkles className="h-3 w-3" />
              Planning & Consultations
            </span>
            <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              Agenda des Rendez-vous
            </h1>
            <p className="mt-1 text-xs text-[#64748b]">
              Gestion complète des séances au cabinet et des téléconsultations
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border-2 border-[#d4ebd0] bg-white shadow-xs">
        <table className="w-full text-start text-xs">
          <thead className="border-b-2 border-[#d4ebd0] bg-[#e8f5e5] text-[11px] font-bold uppercase tracking-wider text-[#2d6a4f]">
            <tr>
              <th className="px-4 py-3.5">Date & Heure</th>
              <th className="px-4 py-3.5">Parent / Contact</th>
              <th className="px-4 py-3.5">Enfant</th>
              <th className="px-4 py-3.5">Service</th>
              <th className="px-4 py-3.5">Mode</th>
              <th className="px-4 py-3.5 text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2ede0]">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-[#f4faf2]/50 transition">
                <td className="px-4 py-3.5 font-mono-num font-bold text-[#2d3748]">
                  {a.date} à {a.time}
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-bold text-[#2d3748]">{a.parentName}</div>
                  <div className="text-[11px] text-[#64748b]">{a.phone}</div>
                </td>
                <td className="px-4 py-3.5 font-bold text-[#2d3748]">
                  👦 {a.childName}
                </td>
                <td className="px-4 py-3.5 text-[#64748b]">{a.service}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      a.mode === "teleconsultation"
                        ? "bg-[#fff3f0] text-[#e0684b] border border-[#fcd5ce]"
                        : "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]"
                    }`}
                  >
                    {a.mode === "teleconsultation" ? (
                      <>
                        <Video className="h-3 w-3 text-[#e0684b]" />
                        Téléconsultation
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 text-[#2d6a4f]" />
                        En cabinet
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-end">
                  <div className="flex items-center justify-end gap-2">
                    {a.parentId && (
                      <Link
                        href={`/admin/patients/${a.parentId}`}
                        className="rounded-full border border-[#d4ebd0] bg-[#f4faf2] px-3 py-1 font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
                      >
                        Dossier
                      </Link>
                    )}
                    {roomByAppointment.has(a.id) && (
                      <Link
                        href={`/teleconsultation/${roomByAppointment.get(a.id)}`}
                        className="rounded-full bg-[#f8a98c] px-3 py-1 font-bold text-white hover:bg-[#e0684b] transition"
                      >
                        WebRTC
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#64748b]">
                  Aucun rendez-vous enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
