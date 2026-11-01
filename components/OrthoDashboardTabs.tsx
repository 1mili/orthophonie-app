"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  ShoppingBag,
  MessageCircle,
  Plus,
  Search,
  Video,
  Phone,
  Mail,
  FileText,
  Clock,
  Send,
  Package,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  TherapistMascot,
  RabbitMascot,
  BearMascot,
  BirdMascot,
  SmilingChildMascot,
} from "./CuteIllustrations";
import { OrthoSessionsTable, type SessionRow } from "./OrthoSessionsTable";
import { BilanReportModal, type BilanData } from "./BilanReportModal";
import { updateOrderStatus } from "@/app/admin/commandes/actions";

export interface ParentUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: Date;
}

export interface ChildRecord {
  id: number;
  parentId: number;
  name: string;
  age: string | null;
  notes: string | null;
}

export interface OrderRecord {
  id: number;
  parentId: number | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalCents: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string | null;
  createdAt: Date;
}

export interface ProductRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  stock: number;
  imageEmoji: string | null;
}

export interface OrthoDashboardTabsProps {
  sessions: SessionRow[];
  parents: ParentUser[];
  childrenList: ChildRecord[];
  bilansList: BilanData[];
  ordersList: OrderRecord[];
  productsList: ProductRecord[];
  todayStr: string;
  isRtl?: boolean;
}

type OrthoTabKey =
  | "stats"
  | "patients"
  | "agenda"
  | "finances"
  | "commandes"
  | "messagerie";

export function OrthoDashboardTabs({
  sessions,
  parents,
  childrenList,
  bilansList,
  ordersList,
  productsList,
  todayStr,
  isRtl = false,
}: OrthoDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<OrthoTabKey>("stats");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedBilan, setSelectedBilan] = useState<BilanData | null>(null);

  // Communication center state
  const [activeParentChatId, setActiveParentChatId] = useState<number>(
    parents[0]?.id ?? 1
  );
  const [chatMessages, setChatMessages] = useState<
    Record<
      number,
      Array<{
        id: string;
        sender: "parent" | "orthophoniste";
        content: string;
        time: string;
      }>
    >
  >({
    [parents[0]?.id ?? 1]: [
      {
        id: "1",
        sender: "parent",
        content: isRtl
          ? "صباح الخير دكتورة، قمنا بتمارين التنفس والنفخ كما طلبتِ ولاحظت تحسناً ملحوظاً في تركيز الطفل."
          : "Bonjour Madame Ben Ammar, nous avons fait l'exercice du Souffle Magique tous les soirs, l'enfant est beaucoup plus calme et attentif !",
        time: "Hier, 15:45",
      },
      {
        id: "2",
        sender: "orthophoniste",
        content: isRtl
          ? "أحسنتِ صنعاً! الاستمرارية اليومية هي المفتاح. سنواصل العمل على مخارج الحروف في جلستنا القادمة."
          : "C'est une excellente nouvelle ! La régularité de 5 minutes par jour fait toute la différence. On continue sur cette belle lancée lors de notre prochaine séance.",
        time: "Hier, 16:10",
      },
    ],
  });
  const [replyInput, setReplyInput] = useState("");

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "orthophoniste" as const,
      content: replyInput.trim(),
      time: isRtl ? "الآن" : "À l'instant",
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeParentChatId]: [...(prev[activeParentChatId] || []), newMsg],
    }));
    setReplyInput("");
  };

  const applyTemplate = (templateText: string) => {
    setReplyInput(templateText);
  };

  // Financial calculations
  const SESSION_PRICE_DT = 60; // Prix standard d'une séance d'orthophonie en DT
  const totalConsultationsRevenue = sessions.length * SESSION_PRICE_DT;
  const totalBoutiqueRevenue = ordersList.reduce(
    (sum, o) => sum + o.totalCents / 100,
    0
  );
  const totalGlobalRevenue = totalConsultationsRevenue + totalBoutiqueRevenue;

  // Session stats
  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const teleSessions = sessions.filter((s) => s.mode === "teleconsultation");

  // Mascots pool
  const childMascots = [
    <RabbitMascot key="r" size={36} />,
    <BearMascot key="b" size={36} />,
    <BirdMascot key="bi" size={36} />,
    <SmilingChildMascot key="c" size={36} />,
  ];

  // Filtered patients for Patients Tab
  const filteredParents = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter((p) => {
      const matchParent =
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q));
      const matchChild = childrenList.some(
        (c) => c.parentId === p.id && c.name.toLowerCase().includes(q)
      );
      return matchParent || matchChild;
    });
  }, [parents, childrenList, patientSearch]);

  const tabsConfig = [
    {
      key: "stats" as const,
      labelFr: "Vue d'ensemble & Stats",
      labelAr: "لوحة التحكم والإحصائيات",
      icon: LayoutDashboard,
    },
    {
      key: "patients" as const,
      labelFr: "Patients & Bilans",
      labelAr: "المرضى والتقييمات",
      icon: Users,
      badge: parents.length,
    },
    {
      key: "agenda" as const,
      labelFr: "Agenda & WebRTC",
      labelAr: "المواعيد واستشارات WebRTC",
      icon: Video,
      badge: todaySessions.length > 0 ? todaySessions.length : undefined,
    },
    {
      key: "finances" as const,
      labelFr: "Module Financier",
      labelAr: "المالية والمداخيل",
      icon: DollarSign,
    },
    {
      key: "commandes" as const,
      labelFr: "Commandes Boutique",
      labelAr: "طلبات المتجر",
      icon: ShoppingBag,
      badge: ordersList.length > 0 ? ordersList.length : undefined,
    },
    {
      key: "messagerie" as const,
      labelFr: "Centre de Communication",
      labelAr: "مركز التواصل مع الأولياء",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Bilan Modal for the Practitioner */}
      <BilanReportModal
        bilan={selectedBilan}
        onClose={() => setSelectedBilan(null)}
        isRtl={isRtl}
      />

      {/* Tabs Switcher Navigation Pastel */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#f4faf2] border-2 border-[#d4ebd0] w-max min-w-full sm:min-w-0">
          {tabsConfig.map((t) => {
            const isActive = activeTab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2.5 rounded-full px-5 py-3 text-xs md:text-sm font-bold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-[#2d6a4f] text-white shadow-md shadow-[#2d6a4f]/20 scale-[1.02]"
                    : "text-[#2d6a4f] hover:bg-[#e8f5e5] hover:text-[#1b4332]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{isRtl ? t.labelAr : t.labelFr}</span>
                {t.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-[#f8a98c] text-white"
                        : "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: VUE D'ENSEMBLE & STATISTIQUES */}
      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in">
          {/* 4 Pastel Cards (Jaune Soleil, Saumon, Vert Menthe, Bleu Ciel) */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Carte 1 : Séances du jour */}
            <div className="rounded-3xl border-2 border-[#fef08a] bg-[#fef9c3]/70 p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#713f12]">
                  {isRtl ? "جلسات اليوم" : "Séances aujourd'hui"}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fef08a] text-[#713f12]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#713f12]">
                {todaySessions.length}
              </div>
              <p className="mt-1 text-[11px] text-[#854d0e] font-medium">
                {isRtl ? `تاريخ اليوم: ${todayStr}` : `Pour aujourd'hui (${todayStr})`}
              </p>
            </div>

            {/* Carte 2 : Téléconsultations WebRTC */}
            <div className="rounded-3xl border-2 border-[#fcd5ce] bg-[#fff3f0] p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
                  {isRtl ? "الاستشارات المرئية" : "Téléconsultations"}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fcd5ce] text-[#e0684b]">
                  <Video className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#2d3748]">
                {teleSessions.length}
              </div>
              <p className="mt-1 text-[11px] text-[#e0684b] font-medium">
                {isRtl ? "استشارات مرئية WebRTC" : "Séances vidéo WebRTC actives"}
              </p>
            </div>

            {/* Carte 3 : Patients & Familles */}
            <div className="rounded-3xl border-2 border-[#d4ebd0] bg-[#e8f5e5] p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
                  {isRtl ? "المرضى المتابعون" : "Patients suivis"}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#d4ebd0] text-[#2d6a4f]">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#2d6a4f]">
                {parents.length}
              </div>
              <p className="mt-1 text-[11px] text-[#2d6a4f]/80 font-medium">
                {childrenList.length} {isRtl ? "أطفال مسجلون" : "enfants suivis en cabinet"}
              </p>
            </div>

            {/* Carte 4 : Chiffre d'affaires estimé */}
            <div className="rounded-3xl border-2 border-[#bae6fd] bg-[#f0f9ff] p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                  {isRtl ? "المداخيل الإجمالية" : "Chiffre d'Affaires"}
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#e0f2fe] text-[#0284c7]">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#0284c7]">
                {totalGlobalRevenue.toFixed(0)} <span className="text-sm">DT</span>
              </div>
              <p className="mt-1 text-[11px] text-[#0284c7]/80 font-medium">
                {isRtl ? "جلسات ومبيعات المتجر" : "Séances + Ventes boutique"}
              </p>
            </div>
          </section>

          {/* Today's immediate sessions alert if any */}
          {todaySessions.length > 0 && (
            <div className="rounded-3xl border-2 border-[#fcd5ce] bg-gradient-to-r from-[#fff3f0] via-[#fef9c3]/40 to-[#e8f5e5] p-6 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-[#fcd5ce]">
                    <Clock className="h-6 w-6 text-[#e0684b] animate-spin-slow" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcd5ce] px-3 py-0.5 text-xs font-bold text-[#e0684b]">
                      ⚡ {isRtl ? "جلسات اليوم المستعجلة" : "Séances prévues aujourd'hui"}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-[#2d3748]">
                      {todaySessions.length} {isRtl ? "مواعيد مبرمجة لليوم" : "rendez-vous planifiés aujourd'hui"}
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      {isRtl
                        ? "ابدأ جلسات الاستشارة المرئية بضغطة زر واحدة بدون الحاجة لتثبيت أي برامج"
                        : "Rejoignez instantanément la salle WebRTC en direct avec l'enfant et ses parents"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {todaySessions.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-center gap-2 rounded-2xl bg-white border-2 border-[#d4ebd0] p-2.5 shadow-xs"
                    >
                      <span className="font-bold text-xs text-[#2d3748]">
                        {ts.time} · {ts.childName}
                      </span>
                      {ts.mode === "teleconsultation" && ts.roomCode && (
                        <Link
                          href={`/teleconsultation/${ts.roomCode}`}
                          className="rounded-full bg-[#f8a98c] px-3 py-1 text-xs font-bold text-white hover:bg-[#e0684b] animate-pulse"
                        >
                          {isRtl ? "اتصال WebRTC" : "Rejoindre WebRTC"}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Session Overview Table */}
          <div className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2ede0]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5e5] text-[#2d6a4f]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#2d3748]">
                    {isRtl ? "نظرة عامة على الجلسات القادمة" : "Vue rapide des prochaines consultations"}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {sessions.length} {isRtl ? "جلسة مسجلة في النظام" : "séances répertoriées"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("agenda")}
                className="text-xs font-bold text-[#e0684b] hover:underline"
              >
                {isRtl ? "فتح وحدة التحكم الكاملة WebRTC ←" : "Ouvrir la console WebRTC complète →"}
              </button>
            </div>

            <OrthoSessionsTable
              sessions={sessions.slice(0, 5)}
              todayStr={todayStr}
              isRtl={isRtl}
            />
          </div>
        </div>
      )}

      {/* TAB 2: PATIENTS & BILANS CLINIQUES */}
      {activeTab === "patients" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Live Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                {isRtl ? "ملفات المرضى والتقييمات الإكلينيكية" : "Dossiers Cliniques des Patients & Bilans"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {isRtl
                  ? "متابعة دقيقة للأطفال، نتائج مقاييس اللغة، وإصدار التقارير الطبية المعتمدة"
                  : "Consultez les fiches, visualisez les scores de langage et éditez de nouveaux bilans"}
              </p>
            </div>

            {/* Live Search */}
            <div className="relative min-w-[280px]">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder={
                  isRtl ? "البحث بالاسم أو البريد..." : "Rechercher un enfant, un parent..."
                }
                className="w-full rounded-full border-2 border-[#d4ebd0] bg-white ps-10 pe-4 py-2 text-xs text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden shadow-xs"
              />
            </div>
          </div>

          {/* Patients Grid Full-Width */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredParents.map((parent, pIdx) => {
              const kids = childrenList.filter((c) => c.parentId === parent.id);
              const parentBilans = bilansList.filter((b) => b.parentId === parent.id);
              const lastBilan = parentBilans[parentBilans.length - 1];

              return (
                <div
                  key={parent.id}
                  className="flex flex-col justify-between rounded-3xl border-2 border-[#d4ebd0] bg-white p-5 shadow-xs hover:border-[#2d6a4f]/50 hover:shadow-md transition"
                >
                  <div>
                    {/* Header: Parent and Child Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8f5e5] border-2 border-[#d4ebd0] p-1 shadow-xs">
                        {childMascots[pIdx % childMascots.length]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-base font-bold text-[#2d3748] truncate">
                            {parent.fullName}
                          </h3>
                          <span className="rounded-full bg-[#f4faf2] border border-[#d4ebd0] px-2.5 py-0.5 text-[11px] font-bold text-[#2d6a4f]">
                            {kids.length} {kids.length === 1 ? (isRtl ? "طفل" : "enfant") : (isRtl ? "أطفال" : "enfants")}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3 text-[#94a3b8]" />
                            {parent.email}
                          </span>
                          {parent.phone && (
                            <span className="inline-flex items-center gap-1 font-mono-num">
                              <Phone className="h-3 w-3 text-[#94a3b8]" />
                              {parent.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Children List within Parent */}
                    <div className="mt-4 space-y-2 border-t border-[#e2ede0] pt-3">
                      {kids.map((kid) => (
                        <div
                          key={kid.id}
                          className="rounded-2xl border border-[#d4ebd0] bg-[#f4faf2]/60 p-3"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="font-bold text-[#2d3748] flex items-center gap-1.5">
                              <span>👦 {kid.name}</span>
                              {kid.age && (
                                <span className="rounded-full bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold text-[#713f12]">
                                  {kid.age}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#64748b]">
                              {kid.notes || (isRtl ? "متابعة عامة" : "Suivi général")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Clinical Bilans Scores Bar */}
                    {lastBilan && (
                      <div className="mt-4 rounded-2xl border-2 border-[#bae6fd] bg-[#f0f9ff]/50 p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0284c7] flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            {isRtl ? `أحدث تقييم (${lastBilan.assessmentDate})` : `Dernier bilan (${lastBilan.assessmentDate})`}
                          </span>
                          <button
                            onClick={() => setSelectedBilan(lastBilan)}
                            className="font-bold text-[#0284c7] hover:underline text-[11px]"
                          >
                            {isRtl ? "عرض التقرير" : "Voir le rapport"}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                          <div className="rounded-xl bg-white p-2 border border-[#bae6fd] text-center">
                            <div className="text-[#64748b]">Langage</div>
                            <div className="font-mono-num font-bold text-[#2d3748]">
                              {lastBilan.languageScore ?? "—"}/100
                            </div>
                          </div>
                          <div className="rounded-xl bg-white p-2 border border-[#bae6fd] text-center">
                            <div className="text-[#64748b]">Lecture</div>
                            <div className="font-mono-num font-bold text-[#2d3748]">
                              {lastBilan.readingScore ?? "—"}/100
                            </div>
                          </div>
                          <div className="rounded-xl bg-white p-2 border border-[#bae6fd] text-center">
                            <div className="text-[#64748b]">Débit</div>
                            <div className="font-mono-num font-bold text-[#2d3748]">
                              {lastBilan.expressionScore ?? "—"}/100
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-[#e2ede0] flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/patients/${parent.id}`}
                      className="inline-flex items-center gap-1 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-3.5 py-1.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {isRtl ? "فتح الملف الطبي" : "Dossier médical"}
                    </Link>

                    <Link
                      href={`/admin/patients/${parent.id}/bilan`}
                      className="inline-flex items-center gap-1 rounded-full bg-[#f8a98c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#e0684b] transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {isRtl ? "+ تحرير تقييم جديد" : "+ Nouveau bilan"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AGENDA & CONSOLE WEBRTC */}
      {activeTab === "agenda" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e5] border-2 border-[#d4ebd0] text-[#2d6a4f]">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                  {isRtl ? "وحدة تحكم الجلسات واستشارات WebRTC" : "Console des Séances & Téléconsultations WebRTC"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "بدء المكالمات المرئية المباشرة بضغطة زر واحدة وإدارة جدول المواعيد"
                    : "Lancement instantané des salles vidéo sécurisées et suivi des rendez-vous"}
                </p>
              </div>
            </div>

            <Link
              href="/admin/rendez-vous"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
            >
              <Calendar className="h-4 w-4" />
              {isRtl ? "جدول المواعيد الموسع" : "Calendrier complet des RDV"}
            </Link>
          </div>

          <OrthoSessionsTable
            sessions={sessions}
            todayStr={todayStr}
            isRtl={isRtl}
          />
        </div>
      )}

      {/* TAB 4: MODULE FINANCIER & REVENUS */}
      {activeTab === "finances" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f2fe] border-2 border-[#bae6fd] text-[#0284c7]">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                {isRtl ? "المحاسبة والمداخيل المالية" : "Module Financier & Suivi des Revenus"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {isRtl
                  ? "متابعة مداخيل جلسات العلاج الطبي ومبيعات المتجر التربوي"
                  : "Synthèse des honoraires de consultations et des ventes de matériel orthophonique"}
              </p>
            </div>
          </div>

          {/* 3 Summary Revenue Cards */}
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Chiffre d'Affaires Global */}
            <div className="rounded-3xl border-2 border-[#d4ebd0] bg-[#e8f5e5] p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
                {isRtl ? "إجمالي المداخيل" : "Chiffre d'Affaires Global"}
              </span>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#2d6a4f]">
                {totalGlobalRevenue.toFixed(2)} <span className="text-base">DT</span>
              </div>
              <p className="mt-1 text-xs text-[#2d6a4f]/80">
                {isRtl ? "مجموع المداخيل المحققة" : "Revenus cumulés (Consultations + E-commerce)"}
              </p>
            </div>

            {/* Revenus Consultations */}
            <div className="rounded-3xl border-2 border-[#bae6fd] bg-[#f0f9ff] p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                {isRtl ? "مداخيل الاستشارات" : "Honoraires Consultations"}
              </span>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#0284c7]">
                {totalConsultationsRevenue.toFixed(2)} <span className="text-base">DT</span>
              </div>
              <p className="mt-1 text-xs text-[#0284c7]/80">
                {sessions.length} {isRtl ? `جلسة × ${SESSION_PRICE_DT} د.ت` : `séances × ${SESSION_PRICE_DT} DT`}
              </p>
            </div>

            {/* Revenus Boutique */}
            <div className="rounded-3xl border-2 border-[#fcd5ce] bg-[#fff3f0] p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
                {isRtl ? "مبيعات المتجر التربوي" : "Ventes Boutique En Ligne"}
              </span>
              <div className="mt-3 font-mono-num text-3xl font-bold text-[#e0684b]">
                {totalBoutiqueRevenue.toFixed(2)} <span className="text-base">DT</span>
              </div>
              <p className="mt-1 text-xs text-[#e0684b]/80">
                {ordersList.length} {isRtl ? "طلبات مواد تربوية" : "commandes de matériel passées"}
              </p>
            </div>
          </div>

          {/* Transactions / History Table */}
          <div className="rounded-3xl border-2 border-[#e2ede0] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-[#2d3748]">
              {isRtl ? "أحدث المعاملات المسجلة" : "Dernières transactions enregistrées"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="border-b-2 border-[#e2ede0] bg-[#f8f9fa] text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                  <tr>
                    <th className="px-4 py-3">{isRtl ? "النوع" : "Type"}</th>
                    <th className="px-4 py-3">{isRtl ? "العميل / المريض" : "Patient / Client"}</th>
                    <th className="px-4 py-3">{isRtl ? "التاريخ" : "Date"}</th>
                    <th className="px-4 py-3">{isRtl ? "المبلغ" : "Montant"}</th>
                    <th className="px-4 py-3 text-end">{isRtl ? "الحالة" : "Statut"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2ede0]">
                  {ordersList.slice(0, 5).map((o) => (
                    <tr key={`ord-${o.id}`} className="hover:bg-[#f4faf2]/50">
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#fef08a] px-2.5 py-0.5 text-[10px] font-bold text-[#713f12]">
                          🛍️ Boutique
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#2d3748]">
                        {o.customerName}
                      </td>
                      <td className="px-4 py-3 text-[#64748b] font-mono-num">
                        {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 font-mono-num font-bold text-[#2d3748]">
                        {(o.totalCents / 100).toFixed(2)} DT
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className="rounded-full bg-[#e8f5e5] px-2.5 py-0.5 text-[11px] font-bold text-[#2d6a4f] border border-[#d4ebd0]">
                          Payé
                        </span>
                      </td>
                    </tr>
                  ))}

                  {sessions.slice(0, 5).map((s) => (
                    <tr key={`sess-${s.id}`} className="hover:bg-[#f4faf2]/50">
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[10px] font-bold text-[#0284c7]">
                          🩺 Séance
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#2d3748]">
                        {s.childName} ({s.parentName})
                      </td>
                      <td className="px-4 py-3 text-[#64748b] font-mono-num">
                        {s.date} {s.time}
                      </td>
                      <td className="px-4 py-3 font-mono-num font-bold text-[#2d3748]">
                        {SESSION_PRICE_DT}.00 DT
                      </td>
                      <td className="px-4 py-3 text-end">
                        <span className="rounded-full bg-[#e8f5e5] px-2.5 py-0.5 text-[11px] font-bold text-[#2d6a4f] border border-[#d4ebd0]">
                          Honoraires
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMANDES BOUTIQUE */}
      {activeTab === "commandes" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcd5ce] border-2 border-[#f8a98c] text-[#e0684b]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                  {isRtl ? "إدارة طلبات المتجر التربوي والتوصيل" : "Gestion des Commandes Boutique & Livraisons"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "تتبع طلبات الأولياء، تحديث حالات الشحن وإدخال أرقام التتبع"
                    : "Mise à jour des statuts (en préparation, expédiée, livrée) et suivi des colis"}
                </p>
              </div>
            </div>

            <Link
              href="/admin/produits"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
            >
              <Package className="h-4 w-4" />
              {isRtl ? "إدارة كتالوج المنتجات" : "Catalogue & Stocks"}
            </Link>
          </div>

          {/* Orders Table with Status Update Form */}
          <div className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 shadow-xs space-y-4">
            {ordersList.length === 0 ? (
              <p className="text-center text-xs text-[#64748b] py-8">
                {isRtl ? "لا توجد طلبات مسجلة بعد." : "Aucune commande enregistrée pour le moment."}
              </p>
            ) : (
              <div className="space-y-4">
                {ordersList.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-2xl border-2 border-[#e2ede0] p-4 bg-[#fbfdfa] hover:bg-white transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#2d3748]">
                          {isRtl ? `طلب #${order.id}` : `Commande #${order.id}`} — {order.customerName}
                        </span>
                        <span className="font-mono-num font-bold text-xs text-[#2d6a4f] bg-[#e8f5e5] px-2.5 py-0.5 rounded-full border border-[#d4ebd0]">
                          {(order.totalCents / 100).toFixed(2)} DT
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-[#64748b]">
                        {order.email} · {order.phone} · 📍 {order.address}
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-1 text-[11px] font-bold text-[#0284c7]">
                          📦 N° Suivi : {order.trackingNumber}
                        </div>
                      )}
                    </div>

                    {/* Server Action Form to update order status */}
                    <form
                      action={updateOrderStatus}
                      className="flex flex-wrap items-center gap-2 self-end lg:self-auto"
                    >
                      <input type="hidden" name="id" value={order.id} />

                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-full border-2 border-[#d4ebd0] bg-white px-3 py-1.5 text-xs font-bold text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
                      >
                        <option value="pending">En attente (pending)</option>
                        <option value="processing">En préparation (processing)</option>
                        <option value="shipped">Expédiée (shipped)</option>
                        <option value="delivered">Livrée (delivered)</option>
                        <option value="cancelled">Annulée (cancelled)</option>
                      </select>

                      <input
                        type="text"
                        name="trackingNumber"
                        defaultValue={order.trackingNumber ?? ""}
                        placeholder="N° suivi colis"
                        className="w-32 rounded-full border-2 border-[#e2ede0] px-3 py-1.5 text-xs focus:border-[#f8a98c] focus:outline-hidden"
                      />

                      <button
                        type="submit"
                        className="rounded-full bg-[#f8a98c] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e0684b] active:scale-95 transition"
                      >
                        OK
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product stock levels alert */}
          {productsList.length > 0 && (
            <div className="rounded-3xl border-2 border-[#bae6fd] bg-[#f0f9ff]/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-[#0284c7] flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {isRtl ? "مخزون المنتجات والأدوات التربوية" : "État des stocks en boutique"}
                </span>
                <span className="text-xs text-[#64748b]">
                  {productsList.length} {isRtl ? "منتج" : "références"}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {productsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-white border border-[#bae6fd] p-2.5 text-xs"
                  >
                    <span className="font-medium text-[#2d3748] truncate me-2">
                      {p.imageEmoji} {p.name}
                    </span>
                    <span
                      className={`font-mono-num font-bold rounded-full px-2 py-0.5 text-[10px] ${
                        p.stock <= 5
                          ? "bg-[#fff3f0] text-[#e0684b] border border-[#fcd5ce]"
                          : "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]"
                      }`}
                    >
                      {p.stock} {isRtl ? "قطعة" : "en stock"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CENTRE DE COMMUNICATION */}
      {activeTab === "messagerie" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e5] border-2 border-[#d4ebd0]">
                <MessageCircle className="h-6 w-6 text-[#2d6a4f]" />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                  {isRtl ? "مركز التواصل والرسائل مع الأولياء" : "Centre de Communication avec les Familles"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "إرسال التوجيهات، الرد على استفسارات الأولياء وتقديم الدعم المستمر"
                    : "Répondez aux questions des parents sur les exercices et le suivi clinique"}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#e8f5e5] border border-[#d4ebd0] px-3.5 py-1 text-xs font-bold text-[#2d6a4f]">
              {parents.length} {isRtl ? "محادثة مفعلة" : "conversations actives"}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {/* Left: Parents List */}
            <div className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-4 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f] px-2 py-1">
                {isRtl ? "قائمة الأولياء" : "Conversations Parents"}
              </h3>
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                {parents.map((parent) => {
                  const isSelected = activeParentChatId === parent.id;
                  const kids = childrenList.filter((c) => c.parentId === parent.id);
                  return (
                    <button
                      key={parent.id}
                      onClick={() => setActiveParentChatId(parent.id)}
                      className={`w-full text-start rounded-2xl p-3 transition flex items-center justify-between ${
                        isSelected
                          ? "bg-[#e8f5e5] border-2 border-[#d4ebd0]"
                          : "hover:bg-[#f8f9fa] border-2 border-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#2d3748] truncate">
                          {parent.fullName}
                        </div>
                        <div className="text-[11px] text-[#64748b] truncate">
                          {kids.length > 0 ? `Enfant: ${kids[0].name}` : parent.email}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#94a3b8] rtl:rotate-180" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right cols: Chat Thread and Reply Box */}
            <div className="lg:col-span-2 xl:col-span-3 space-y-4">
              <div className="rounded-3xl border-2 border-[#d4ebd0] bg-[#fbfdfa] p-5 shadow-xs space-y-4 max-h-[360px] overflow-y-auto">
                {(chatMessages[activeParentChatId] || [
                  {
                    id: "default",
                    sender: "orthophoniste",
                    content: isRtl
                      ? "مرحباً بكم، أنا جاهزة للرد على استفساراتكم ومتابعة التمارين."
                      : "Bonjour ! N'hésitez pas à me poser vos questions concernant les séances et les exercices à la maison.",
                    time: "9:00",
                  },
                ]).map((msg) => {
                  const isTherapist = msg.sender === "orthophoniste";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isTherapist ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 shadow-xs ${
                          isTherapist
                            ? "border-[#d4ebd0] bg-[#e8f5e5]"
                            : "border-[#fcd5ce] bg-[#fff3f0]"
                        }`}
                      >
                        {isTherapist ? (
                          <TherapistMascot size={26} />
                        ) : (
                          <SmilingChildMascot size={26} />
                        )}
                      </div>

                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isTherapist
                            ? "bg-[#2d6a4f] text-white"
                            : "bg-white border-2 border-[#e2ede0] text-[#2d3748]"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`mt-1 text-[10px] text-end ${
                            isTherapist ? "text-white/70" : "text-[#94a3b8]"
                          }`}
                        >
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Templates */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-[#64748b]">
                  {isRtl ? "نماذج سريعة :" : "Modèles rapides :"}
                </span>
                <button
                  onClick={() =>
                    applyTemplate(
                      isRtl
                        ? "أحسنتِ صنعاً! واصلي على نفس المنوال مع التمارين اليومية."
                        : "Bravo pour les progrès ! Continuez les exercices quotidiens de 5 minutes."
                    )
                  }
                  className="rounded-full bg-white border border-[#d4ebd0] px-3 py-1 text-[11px] font-semibold text-[#2d6a4f] hover:bg-[#e8f5e5] transition"
                >
                  👏 Encouragements
                </button>
                <button
                  onClick={() =>
                    applyTemplate(
                      isRtl
                        ? "تذكير بموعد الجلسة القادمة. يرجى الدخول قبل الموعد بـ 5 دقائق."
                        : "Rappel : Rendez-vous confirmé. Merci de vous connecter 5 minutes avant l'heure."
                    )
                  }
                  className="rounded-full bg-white border border-[#d4ebd0] px-3 py-1 text-[11px] font-semibold text-[#2d6a4f] hover:bg-[#e8f5e5] transition"
                >
                  📅 Rappel RDV
                </button>
                <button
                  onClick={() =>
                    applyTemplate(
                      isRtl
                        ? "تم تحديث تقرير التقييم الإكلينيكي وهو متاح الآن في فضاء الأولياء."
                        : "Le bilan orthophonique a été mis à jour et est téléchargeable dans votre espace."
                    )
                  }
                  className="rounded-full bg-white border border-[#d4ebd0] px-3 py-1 text-[11px] font-semibold text-[#2d6a4f] hover:bg-[#e8f5e5] transition"
                >
                  📋 Bilan disponible
                </button>
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendReply}
                className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-4 shadow-xs space-y-3"
              >
                <textarea
                  rows={2}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={
                    isRtl
                      ? "اكتبي رسالتك إلى الولي هنا..."
                      : "Écrivez votre message à la famille..."
                  }
                  className="w-full rounded-2xl border-2 border-[#e2ede0] p-3 text-xs text-[#2d3748] placeholder:text-[#94a3b8] focus:border-[#2d6a4f] focus:outline-hidden resize-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b]">
                    {isRtl
                      ? "سيتم إرسال الرسالة مباشرة إلى فضاء الولي"
                      : "Le parent recevra une notification dans son espace"}
                  </span>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[#2d6a4f] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#2d6a4f]/20 hover:bg-[#1b4332] active:scale-95 transition"
                  >
                    <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                    {isRtl ? "إرسال الرد" : "Envoyer la réponse"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
