import Link from "next/link";
import { eq, or, inArray, desc } from "drizzle-orm";
import { requireParent } from "@/lib/require-parent";
import { db } from "@/lib/db";
import {
  appointments,
  children,
  consultations,
  bilans,
  orders,
  products,
} from "@/lib/db/schema";
import { logout } from "@/lib/actions/auth-actions";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";
import { getCart } from "@/lib/cart";
import { EvaluationQuiz } from "./EvaluationQuiz";
import {
  SmilingChildMascot,
  CuteSun,
  CuteCloud,
} from "@/components/CuteIllustrations";
import {
  LogOut,
  User,
  Sparkles,
  Calendar,
  FileText,
  Star,
  ArrowRight,
  Home,
} from "lucide-react";
import {
  ParentDashboardTabs,
  type ChildItem,
  type AppointmentItem,
  type OrderItem,
  type ProductItem,
} from "@/components/ParentDashboardTabs";
import type { BilanData } from "@/components/BilanReportModal";

export const dynamic = "force-dynamic";

const defaultEducationalProducts: ProductItem[] = [
  {
    id: 1,
    slug: "cartes-imagier-vocabulaire",
    name: "Cartes imagier — Premier vocabulaire",
    description: "50 cartes illustrées pour enrichir le vocabulaire des tout-petits (2-4 ans).",
    category: "cartes",
    priceCents: 2900,
    stock: 40,
    imageEmoji: "🗂️",
  },
  {
    id: 2,
    slug: "jeu-syllabes-magnetiques",
    name: "Jeu de syllabes magnétiques",
    description: "Un jeu ludique pour travailler la conscience syllabique et la lecture (5-8 ans).",
    category: "jeux",
    priceCents: 3900,
    stock: 25,
    imageEmoji: "🧲",
  },
  {
    id: 3,
    slug: "cahier-exercices-articulation",
    name: "Cahier d'exercices — Articulation",
    description: "Exercices progressifs pour travailler l'articulation des sons difficiles.",
    category: "outils",
    priceCents: 1900,
    stock: 60,
    imageEmoji: "📘",
  },
  {
    id: 4,
    slug: "loto-des-sons",
    name: "Loto des sons",
    description: "Jeu de loto sonore pour discriminer les sons proches, en famille (4-7 ans).",
    category: "jeux",
    priceCents: 3200,
    stock: 30,
    imageEmoji: "🎲",
  },
  {
    id: 5,
    slug: "cartes-emotions",
    name: "Cartes des émotions",
    description: "40 cartes pour nommer et exprimer les émotions, support au langage oral.",
    category: "cartes",
    priceCents: 2500,
    stock: 35,
    imageEmoji: "😊",
  },
  {
    id: 6,
    slug: "sablier-parole",
    name: "Sablier de parole",
    description: "Outil visuel pour travailler le tour de parole et le débit chez l'enfant qui bégaie.",
    category: "outils",
    priceCents: 1500,
    stock: 50,
    imageEmoji: "⏳",
  },
];

export default async function EspaceParentPage() {
  const session = await requireParent();

  const locale = await getLocale();
  const isRtl = locale === "ar";
  const pDict = t(locale).espaceParent;

  // Real parent display name
  const parentDisplayName =
    session.fullName?.trim().split(" ")[0] || (isRtl ? "ولي أمر" : "Parent");

  // Safe DB queries with try/catch to avoid crash if DB is temporarily offline
  let myChildren: ChildItem[] = [];
  let allAppointments: AppointmentItem[] = [];
  let teleRows: (typeof consultations.$inferSelect)[] = [];
  let myBilans: BilanData[] = [];
  let myOrders: OrderItem[] = [];
  let catalogProducts: ProductItem[] = defaultEducationalProducts;
  let cartData: { items: unknown[]; total: number } = { items: [], total: 0 };

  try {
    const [kidsRes, apptsRes, bilansRes, ordersRes, prodsRes, cartRes] = await Promise.all([
      db.select().from(children).where(eq(children.parentId, session.userId)),
      db
        .select()
        .from(appointments)
        .where(
          or(
            eq(appointments.parentId, session.userId),
            eq(appointments.email, session.email)
          )
        ),
      db.select().from(bilans).where(eq(bilans.parentId, session.userId)),
      db
        .select()
        .from(orders)
        .where(
          or(
            eq(orders.parentId, session.userId),
            eq(orders.email, session.email)
          )
        )
        .orderBy(desc(orders.createdAt)),
      db.select().from(products),
      getCart().catch(() => ({ items: [], total: 0 })),
    ]);

    myChildren = kidsRes;
    allAppointments = apptsRes;
    myBilans = bilansRes.map((b) => ({
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
    myOrders = ordersRes;
    if (prodsRes && prodsRes.length > 0) {
      catalogProducts = prodsRes;
    }
    cartData = cartRes;

    const apptIds = allAppointments.map((a) => a.id);
    teleRows =
      apptIds.length > 0
        ? await db
            .select()
            .from(consultations)
            .where(inArray(consultations.appointmentId, apptIds))
        : [];
  } catch (error) {
    console.warn("DB unreachable, fallback in EspaceParentPage", error);
  }

  const teleMap: Record<number, { roomCode: string; status: string }> = {};
  for (const c of teleRows) {
    teleMap[c.appointmentId] = { roomCode: c.roomCode, status: c.status };
  }

  return (
    <div className="min-h-screen bg-[#fbfdfa]">
      {/* ── Centred container for comfortable reading ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-6">

        {/* ─────────────────────────────────────────────
            1. COMPACT APP BAR — logo · badge · actions
           ───────────────────────────────────────────── */}
        <header className="flex items-center justify-between rounded-2xl border border-[#d4ebd0] bg-white px-5 py-3 shadow-sm">
          {/* Left: brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5e5] border border-[#d4ebd0]">
              <SmilingChildMascot size={28} />
            </div>
            <div className="leading-tight">
              <span className="font-display text-sm font-bold text-[#2d3748]">
                Lisen Wa Kalem
              </span>
              <span className="ml-2 rounded-full bg-[#fcd5ce] px-2 py-[1px] text-[10px] font-bold text-[#e0684b]">
                {isRtl ? "فضاء الأولياء" : "Espace Parent"}
              </span>
            </div>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#d4ebd0] bg-[#f4faf2] px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#e8f5e5] transition"
            >
              <Home className="h-3 w-3" />
              <span>{isRtl ? "الرئيسية" : "Accueil"}</span>
            </Link>

            <Link
              href="/rdv"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f8a98c] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#e0684b] active:scale-95 transition"
            >
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">{pDict.bookNow}</span>
            </Link>

            <Link
              href="/espace-parent/profil"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d4ebd0] bg-[#e8f5e5] px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
            >
              <User className="h-3 w-3" />
              <span className="hidden md:inline">{parentDisplayName}</span>
            </Link>

            <form action={logout}>
              <button
                type="submit"
                aria-label={pDict.logout}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#fcd5ce] bg-white text-[#e0684b] hover:bg-[#fff3f0] transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </header>

        {/* ─────────────────────────────────────────────
            2. WELCOME BANNER — compact, airy, warm
           ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[#fcd5ce] bg-gradient-to-r from-[#fff3f0] via-[#fef9c3]/20 to-[#e8f5e5]/60 px-6 py-5 shadow-sm">
          {/* Decorative illustrations */}
          <div className="pointer-events-none absolute -top-3 end-28 opacity-60 hidden sm:block">
            <CuteCloud size={60} className="animate-float" />
          </div>
          <div className="pointer-events-none absolute top-2 end-4 opacity-70 hidden md:block">
            <CuteSun size={48} className="animate-wiggle" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 border border-[#fcd5ce] shadow-sm">
                <SmilingChildMascot size={44} className="animate-float" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fcd5ce]/80 px-3 py-0.5 text-[10px] font-bold text-[#e0684b]">
                  <Sparkles className="h-3 w-3 text-[#f8a98c]" />
                  {pDict.title}
                </div>
                <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-[#2d3748]">
                  {pDict.greeting}, {parentDisplayName} ! 🎈
                </h1>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  {pDict.welcomeSub}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-white border border-[#d4ebd0] px-3.5 py-1.5 text-[11px] font-bold text-[#2d6a4f] shadow-sm">
              👦 {myChildren.length}{" "}
              {myChildren.length === 1
                ? (isRtl ? "طفل مسجل" : "enfant suivi")
                : (isRtl ? "أطفال مسجلون" : "enfants suivis")}
            </span>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            3. TABBED WORKSPACE
           ───────────────────────────────────────────── */}
        <ParentDashboardTabs
          user={{
            id: session.userId,
            fullName: parentDisplayName,
            email: session.email,
          }}
          childrenList={myChildren}
          appointmentsList={allAppointments}
          teleMap={teleMap}
          bilansList={myBilans}
          ordersList={myOrders}
          productsList={catalogProducts}
          cartCount={cartData.items.length}
          cartTotalCents={cartData.total}
          isRtl={isRtl}
        />

        {/* ─────────────────────────────────────────────
            4. COMPLEMENTARY — Quiz & Resources
           ───────────────────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Quiz Card */}
          <div className="rounded-3xl border border-[#d4ebd0] bg-[#e8f5e5]/40 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#d4ebd0] text-[#2d6a4f]">
                <Star className="h-4 w-4 fill-[#fef08a] text-[#ca8a04]" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#2d3748]">
                  {pDict.quiz}
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  {isRtl
                    ? "اختبار سريع لتقييم تطور النطق واللغة لدى طفلك"
                    : "Un premier repère indicatif sur le développement du langage"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <EvaluationQuiz />
            </div>
          </div>

          {/* Resources Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#fcd5ce] bg-[#fff3f0]/50 p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#fcd5ce] text-[#e0684b]">
                  <FileText className="h-4 w-4 text-[#e0684b]" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2d3748]">
                    {pDict.personalContent}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    {isRtl
                      ? "مقالات وأدوات مختارة لتطبيقها في المنزل"
                      : "Articles et outils pédagogiques sélectionnés pour vous"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <Link
                  href="/blog?category=langage"
                  className="flex items-center justify-between rounded-2xl border border-[#fcd5ce] bg-white p-3.5 transition hover:border-[#f8a98c] hover:shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-[#2d3748]">
                      {isRtl ? "مقالات حول تطور اللغة والكلام" : "Articles sur le langage oral"}
                    </div>
                    <div className="text-[10px] text-[#64748b]">
                      {isRtl ? "نصائح عملية للأولياء" : "Conseils pratiques pour la maison"}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#e0684b] rtl:rotate-180" />
                </Link>

                <Link
                  href="/boutique"
                  className="flex items-center justify-between rounded-2xl border border-[#fcd5ce] bg-white p-3.5 transition hover:border-[#f8a98c] hover:shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-[#2d3748]">
                      {isRtl ? "أدوات وبطاقات تعليمية للأطفال" : "Outils et cartes pédagogiques"}
                    </div>
                    <div className="text-[10px] text-[#64748b]">
                      {isRtl ? "ألعاب معتمدة من الأخصائية" : "Sélectionnés par des orthophonistes"}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#e0684b] rtl:rotate-180" />
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#fcd5ce] flex items-center justify-between text-[11px] text-[#64748b]">
              <span className="flex items-center gap-1.5 font-medium">
                <SmilingChildMascot size={22} />
                {isRtl ? "مرافقة خطوة بخطوة" : "Accompagnement bienveillant"}
              </span>
              <Link
                href="/espace-parent/teleconsultations"
                className="font-bold text-[#e0684b] hover:underline"
              >
                {pDict.teleconsultations} →
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
