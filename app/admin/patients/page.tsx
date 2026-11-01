import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { FolderOpen, ClipboardList, Users, Sparkles, Phone, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { users, children, appointments, bilans } from "@/lib/db/schema";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";
import { RabbitMascot, BearMascot, BirdMascot, SmilingChildMascot } from "@/components/CuteIllustrations";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage() {
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const oDict = t(locale).orthoDashboard;

  let parents: (typeof users.$inferSelect)[] = [];
  let allChildren: (typeof children.$inferSelect)[] = [];
  let allAppointments: (typeof appointments.$inferSelect)[] = [];
  let allBilans: (typeof bilans.$inferSelect)[] = [];

  try {
    parents = await db
      .select()
      .from(users)
      .where(eq(users.role, "parent"))
      .orderBy(desc(users.createdAt));

    const res = await Promise.all([
      db.select().from(children),
      db.select().from(appointments),
      db.select().from(bilans),
    ]);
    allChildren = res[0];
    allAppointments = res[1];
    allBilans = res[2];
  } catch (error) {
    console.warn("DB offline or unavailable in AdminPatientsPage", error);
  }

  const childMascots = [
    <RabbitMascot key="r" size={32} />,
    <BearMascot key="b" size={32} />,
    <BirdMascot key="bi" size={32} />,
    <SmilingChildMascot key="c" size={32} />,
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner Vert Menthe Doux & Saumon */}
      <div className="rounded-[2.5rem] border-2 border-[#d4ebd0] bg-gradient-to-r from-[#e8f5e5] via-[#f0f9ff]/70 to-[#fff3f0] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs border-2 border-[#d4ebd0]">
              <Users className="h-7 w-7 text-[#2d6a4f]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f]">
                <Sparkles className="h-3 w-3 text-[#2d6a4f]" />
                {isRtl ? "سجل المرضى والملفات الطبية" : "Dossiers cliniques & Suivi médical"}
              </div>
              <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
                {oDict.patientsTab}
              </h1>
              <p className="mt-1 text-xs text-[#64748b] font-medium">
                {isRtl
                  ? "الوصول السريع إلى تاريخ المواعيد، التقييمات، والخطط العلاجية للأطفال"
                  : "Accès aux bilans orthophoniques, historiques de séances et synthèses d'évolution"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white border-2 border-[#d4ebd0] px-4 py-2 text-xs font-bold text-[#2d6a4f] shadow-xs">
              {parents.length} {isRtl ? "ملف عائلة" : "Familles"} · {allChildren.length} {isRtl ? "طفل" : "Enfants"}
            </span>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto rounded-3xl border-2 border-[#d4ebd0] bg-white shadow-xs">
        <table className="w-full text-start text-xs">
          <thead className="border-b-2 border-[#d4ebd0] bg-[#e8f5e5] text-[11px] font-bold uppercase tracking-wider text-[#2d6a4f]">
            <tr>
              <th className="px-5 py-4">{isRtl ? "الولي / جهة الاتصال" : "Parent / Contact"}</th>
              <th className="px-5 py-4">{isRtl ? "الأطفال المسجلون" : "Enfants suivis"}</th>
              <th className="px-5 py-4">{isRtl ? "عدد الجلسات" : "RDV"}</th>
              <th className="px-5 py-4">{isRtl ? "التقييمات" : "Bilans"}</th>
              <th className="px-5 py-4">{isRtl ? "أحدث تقييم" : "Dernier bilan"}</th>
              <th className="px-5 py-4 text-end">{isRtl ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2ede0]">
            {parents.map((p, pIdx) => {
              const kids = allChildren.filter((c) => c.parentId === p.id);
              const rdvCount = allAppointments.filter((a) => a.parentId === p.id).length;
              const parentBilans = allBilans
                .filter((b) => b.parentId === p.id)
                .sort((a, b) => (b.assessmentDate > a.assessmentDate ? 1 : -1));
              const lastBilan = parentBilans[0];

              return (
                <tr key={p.id} className="transition hover:bg-[#f4faf2]">
                  {/* Parent / Contact */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#2d3748] text-sm">{p.fullName}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748b]">
                      <span className="flex items-center gap-1 font-mono-num">
                        <Mail className="h-3 w-3 text-[#94a3b8]" /> {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1 font-mono-num">
                          <Phone className="h-3 w-3 text-[#94a3b8]" /> {p.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Children */}
                  <td className="px-5 py-4">
                    {kids.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {kids.map((k, kIdx) => (
                          <span
                            key={k.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e5] border-2 border-[#d4ebd0] px-3 py-1 text-xs font-bold text-[#2d6a4f]"
                          >
                            <span className="shrink-0">
                              {childMascots[(pIdx + kIdx) % childMascots.length]}
                            </span>
                            {k.name} {k.age ? `(${k.age})` : ""}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#94a3b8] italic">
                        {isRtl ? "لم يسجل أطفالاً بعد" : "Aucun enfant déclaré"}
                      </span>
                    )}
                  </td>

                  {/* RDV Count */}
                  <td className="px-5 py-4 font-mono-num font-bold text-[#2d3748]">
                    <span className="inline-block rounded-full bg-[#f4faf2] border border-[#d4ebd0] px-3 py-0.5 text-xs text-[#2d6a4f]">
                      {rdvCount}
                    </span>
                  </td>

                  {/* Bilans Count */}
                  <td className="px-5 py-4 font-mono-num font-bold text-[#2d3748]">
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                        parentBilans.length > 0
                          ? "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]"
                          : "bg-slate-100 text-[#94a3b8]"
                      }`}
                    >
                      {parentBilans.length}
                    </span>
                  </td>

                  {/* Last Bilan */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {lastBilan ? (
                      <div>
                        <div className="font-bold text-[#2d3748]">{lastBilan.childName}</div>
                        <div className="font-mono-num text-[11px] text-[#64748b]">
                          📅 {lastBilan.assessmentDate}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#94a3b8]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/patients/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-3.5 py-1.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        {isRtl ? "فتح الملف" : "Dossier"}
                      </Link>

                      <Link
                        href={`/admin/patients/${p.id}/bilan`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f8a98c] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0684b] transition"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        {isRtl ? "تقييم جديد" : "+ Bilan"}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}

            {parents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#64748b]">
                  {isRtl
                    ? "لا توجد ملفات مرضى مسجلة حالياً."
                    : "Aucun dossier patient. Les dossiers s'ajouteront automatiquement avec les inscriptions."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
