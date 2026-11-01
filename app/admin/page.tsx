import Link from "next/link";
import { db } from "@/lib/db";
import {
  appointments,
  consultations,
  users,
  children,
  bilans,
  orders,
  products,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";
import {
  Plus,
  Users,
  Video,
  Sparkles,
} from "lucide-react";
import {
  TherapistMascot,
  CuteSun,
  CuteCloud,
} from "@/components/CuteIllustrations";
import { type SessionRow } from "@/components/OrthoSessionsTable";
import {
  OrthoDashboardTabs,
  type ParentUser,
  type ChildRecord,
  type OrderRecord,
  type ProductRecord,
} from "@/components/OrthoDashboardTabs";
import type { BilanData } from "@/components/BilanReportModal";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const oDict = t(locale).orthoDashboard;

  const todayStr = new Date().toISOString().slice(0, 10);

  let allAppointments: (typeof appointments.$inferSelect)[] = [];
  let allConsultations: (typeof consultations.$inferSelect)[] = [];
  let parents: ParentUser[] = [];
  let allChildren: ChildRecord[] = [];
  let allBilans: BilanData[] = [];
  let allOrders: OrderRecord[] = [];
  let allProducts: ProductRecord[] = [];

  try {
    const res = await Promise.all([
      db.select().from(appointments).orderBy(desc(appointments.date)),
      db.select().from(consultations),
      db.select().from(users).where(eq(users.role, "parent")).orderBy(desc(users.createdAt)),
      db.select().from(children),
      db.select().from(bilans).orderBy(desc(bilans.createdAt)),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(products),
    ]);

    allAppointments = res[0];
    allConsultations = res[1];
    parents = res[2].map((p) => ({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      createdAt: p.createdAt,
    }));
    allChildren = res[3].map((c) => ({
      id: c.id,
      parentId: c.parentId,
      name: c.name,
      age: c.age,
      notes: c.notes,
    }));
    allBilans = res[4].map((b) => ({
      id: b.id,
      parentId: b.parentId,
      childName: b.childName,
      assessmentDate: b.assessmentDate,
      languageScore: b.languageScore,
      readingScore: b.readingScore,
      expressionScore: b.expressionScore,
      notes: b.notes,
      recommendations: b.recommendations,
    }));
    allOrders = res[5].map((o) => ({
      id: o.id,
      parentId: o.parentId,
      customerName: o.customerName,
      email: o.email,
      phone: o.phone,
      address: o.address,
      totalCents: o.totalCents,
      status: o.status,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
    }));
    allProducts = res[6].map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      priceCents: p.priceCents,
      stock: p.stock,
      imageEmoji: p.imageEmoji,
    }));
  } catch (error) {
    console.warn("DB offline or unavailable in AdminDashboard, using fallbacks", error);
  }

  const teleMap = new Map(allConsultations.map((c) => [c.appointmentId, c]));

  // Build rows for OrthoSessionsTable
  const sessionRows: SessionRow[] = allAppointments.map((a) => {
    const tele = teleMap.get(a.id);
    return {
      id: a.id,
      date: a.date,
      time: a.time,
      childName: a.childName,
      childAge: a.childAge,
      parentName: a.parentName,
      phone: a.phone,
      email: a.email,
      service: a.service,
      mode: a.mode,
      parentId: a.parentId,
      roomCode: tele?.roomCode ?? null,
      consultationStatus: tele?.status ?? null,
    };
  });

  return (
    <div className="space-y-8">
      {/* 1. Bannière d'accueil Orthophoniste Vert Menthe Doux & Saumon */}
      <section className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#d4ebd0] bg-gradient-to-r from-[#e8f5e5] via-[#f0f9ff]/70 to-[#fff3f0]/90 p-6 md:p-8 shadow-xs">
        <div className="pointer-events-none absolute -top-4 end-32 opacity-70 hidden sm:block">
          <CuteCloud size={85} className="animate-float" />
        </div>
        <div className="pointer-events-none absolute top-3 end-6 opacity-85 hidden md:block">
          <CuteSun size={65} className="animate-wiggle" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white p-2 shadow-xs border-2 border-[#d4ebd0]">
              <TherapistMascot size={72} className="animate-float" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#d4ebd0] px-3.5 py-1 text-xs font-bold text-[#2d6a4f]">
                <Sparkles className="h-3.5 w-3.5 text-[#2d6a4f]" />
                {oDict.title}
              </div>
              <h1 className="mt-2 font-display text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
                {isRtl ? "مرحباً بك د. سارة بن عمار" : "Bienvenue, Mme Sarra Ben Ammar"} 🩺
              </h1>
              <p className="mt-1 text-xs md:text-sm text-[#64748b] font-medium">
                {oDict.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/patients"
              className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 transition hover:bg-[#e0684b] active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {isRtl ? "+ مريض جديد" : "+ Nouveau Patient"}
            </Link>
            <Link
              href="/admin/patients"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2.5 text-xs font-bold text-[#2d6a4f] shadow-xs transition hover:bg-[#d4ebd0] active:scale-95"
            >
              <Users className="h-4 w-4" />
              {oDict.patientsTab}
            </Link>
            <Link
              href="/admin/teleconsultations"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#bae6fd] bg-[#f0f9ff] px-4 py-2.5 text-xs font-bold text-[#0284c7] shadow-xs transition hover:bg-[#e0f2fe] active:scale-95"
            >
              <Video className="h-4 w-4" />
              {oDict.scheduledTele}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ONGLETS ET MODULES INTERACTIFS DU DASHBOARD ORTHOPHONISTE */}
      <OrthoDashboardTabs
        sessions={sessionRows}
        parents={parents}
        childrenList={allChildren}
        bilansList={allBilans}
        ordersList={allOrders}
        productsList={allProducts}
        todayStr={todayStr}
        isRtl={isRtl}
      />
    </div>
  );
}
