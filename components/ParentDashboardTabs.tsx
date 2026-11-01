"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  Send,
  FileText,
  Printer,
  Plus,
  Phone,
  HelpCircle,
  Truck,
} from "lucide-react";
import {
  RabbitMascot,
  BearMascot,
  BirdMascot,
  SmilingChildMascot,
  CalendarMascot,
  ExerciseBoxMascot,
  TherapistMascot,
} from "./CuteIllustrations";
import { ExerciseBoxClient } from "./ExerciseBoxClient";
import { AddChildModal } from "./AddChildModal";
import { getTeleconsultationWindowStatus } from "@/lib/teleconsultation-window";
import { BilanReportModal, type BilanData } from "./BilanReportModal";
import { addToCartAction } from "@/app/panier/actions";

export interface ChildItem {
  id: number;
  parentId: number;
  name: string;
  age: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface AppointmentItem {
  id: number;
  date: string;
  time: string;
  childName: string;
  childAge: string | null;
  parentName: string;
  phone: string;
  email: string;
  service: string;
  mode: string;
  notes: string | null;
}

export interface OrderItem {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalCents: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber: string | null;
  createdAt: Date;
}

export interface ProductItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  stock: number;
  imageEmoji: string | null;
}

export interface ParentDashboardTabsProps {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  childrenList: ChildItem[];
  appointmentsList: AppointmentItem[];
  teleMap: Record<number, { roomCode: string; status: string }>;
  bilansList: BilanData[];
  ordersList: OrderItem[];
  productsList: ProductItem[];
  cartCount: number;
  cartTotalCents: number;
  isRtl?: boolean;
}

type TabKey = "enfants" | "agenda" | "exercices" | "boutique" | "messagerie";

export function ParentDashboardTabs({
  user,
  childrenList,
  appointmentsList,
  teleMap,
  bilansList,
  ordersList,
  productsList,
  cartCount,
  cartTotalCents,
  isRtl = false,
}: ParentDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("enfants");
  const [selectedBilan, setSelectedBilan] = useState<BilanData | null>(null);

  // Client messages thread state
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: "parent" | "orthophoniste";
      content: string;
      time: string;
      subject?: string;
    }>
  >([
    {
      id: "1",
      sender: "orthophoniste",
      content: isRtl
        ? "مرحباً بكم في فضاء الأولياء، تم تحديث برنامج التمارين الخاصة بطفلكم مع التركيز على مخارج الحروف والتنفس الهادئ."
        : "Bonjour ! J'ai mis à jour les exercices de prononciation recommandés pour votre enfant. N'hésitez pas à faire 5 minutes par jour dans la boîte à exercices !",
      time: "Hier, 16:30",
      subject: isRtl ? "متابعة التمارين" : "Exercices de la semaine",
    },
  ]);
  const [newMessageText, setNewMessageText] = useState("");
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [messageSentFeedback, setMessageSentFeedback] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: "parent" as const,
      content: newMessageText.trim(),
      time: isRtl ? "الآن" : "À l'instant",
      subject: newMessageSubject.trim() || (isRtl ? "استفسار للأخصائية" : "Question au praticien"),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");
    setNewMessageSubject("");
    setMessageSentFeedback(true);
    setTimeout(() => setMessageSentFeedback(false), 4000);
  };

  // Sorting appointments
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = appointmentsList
    .filter((a) => a.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const pastAppointments = appointmentsList
    .filter((a) => a.date < todayStr)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const nextAppointment = upcomingAppointments[0];

  // Child mascots pool
  const childMascots = [
    <RabbitMascot key="rabbit" size={54} className="animate-bounce-soft" />,
    <BearMascot key="bear" size={54} className="animate-wiggle" />,
    <BirdMascot key="bird" size={54} className="animate-float" />,
    <SmilingChildMascot key="child" size={54} className="animate-bounce-soft" />,
  ];

  const tabsConfig: { key: TabKey; labelFr: string; labelAr: string; icon: React.ElementType; badge?: number }[] = [
    {
      key: "enfants",
      labelFr: "Mes Enfants & Bilans",
      labelAr: "أطفالي والتقييمات",
      icon: Users,
      badge: childrenList.length,
    },
    {
      key: "agenda",
      labelFr: "Agenda & Téléconsultation",
      labelAr: "المواعيد والاستشارة المرئية",
      icon: Calendar,
      badge: upcomingAppointments.length,
    },
    {
      key: "exercices",
      labelFr: "Boîte à Exercices & Jeux",
      labelAr: "صندوق التمارين والألعاب",
      icon: ExerciseBoxMascot,
    },
    {
      key: "boutique",
      labelFr: "Boutique & Commandes",
      labelAr: "المتجر وطلباتي",
      icon: ShoppingBag,
      badge: ordersList.length > 0 ? ordersList.length : undefined,
    },
    {
      key: "messagerie",
      labelFr: "Messagerie & Support",
      labelAr: "الرسائل والدعم",
      icon: MessageCircle,
      badge: messages.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Bilan Modal */}
      <BilanReportModal
        bilan={selectedBilan}
        onClose={() => setSelectedBilan(null)}
        isRtl={isRtl}
      />

      {/* Tabs Navigation Bar — clean, well-spaced, comfortable */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4faf2] border border-[#d4ebd0] shadow-sm w-max min-w-full sm:min-w-0">
          {tabsConfig.map((t) => {
            const isActive = activeTab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-[#f8a98c] text-white shadow-sm"
                    : "text-[#2d6a4f] hover:bg-[#e8f5e5]"
                }`}
              >
                {t.key === "exercices" ? (
                  <ExerciseBoxMascot size={18} />
                ) : (
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{isRtl ? t.labelAr : t.labelFr}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      isActive
                        ? "bg-white/90 text-[#e0684b]"
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

      {/* TAB 1: MES ENFANTS & SUIVI CLINIQUE */}
      {activeTab === "enfants" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                {isRtl ? "ملفات أطفالي ومتابعة النطق" : "Profils de mes enfants & Suivi clinique"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {isRtl
                  ? "متابعة تقدم طفلك، نتائج التقييمات، والتقارير المعتمدة من الأخصائية"
                  : "Suivez les progrès, consultez les bilans cliniques et téléchargez les comptes-rendus"}
              </p>
            </div>
            <AddChildModal isRtl={isRtl} />
          </div>

          {childrenList.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-dashed border-[#d4ebd0] bg-[#e8f5e5]/40 p-6 text-center sm:text-start">
              <BearMascot size={90} className="animate-wiggle" />
              <div className="space-y-2 flex-1">
                <h3 className="font-display text-lg font-bold text-[#2d3748]">
                  {isRtl ? "لم تسجل أي طفل بعد" : "Aucun enfant enregistré pour le moment"}
                </h3>
                <p className="text-xs text-[#64748b] max-w-md font-medium">
                  {isRtl
                    ? "سجل ملف طفلك الآن للاستفادة من ألعاب وتمارين مخصصة ومتابعة دقيقة مع الأخصائية."
                    : "Enregistrez le profil de votre enfant pour personnaliser ses jeux, ses exercices et suivre ses progrès."}
                </p>
                <div className="pt-2">
                  <AddChildModal isRtl={isRtl} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {childrenList.map((child, idx) => {
                const childBilans = bilansList.filter(
                  (b) =>
                    b.childName.trim().toLowerCase() === child.name.trim().toLowerCase()
                );
                const lastBilan = childBilans[childBilans.length - 1];

                // Progression percentage
                const progressionPct = lastBilan?.languageScore ?? 75;

                return (
                  <div
                    key={child.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#d4ebd0] bg-white p-5 shadow-sm hover:border-[#2d6a4f]/40 hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Top Bar with Mascot and Name */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#fbfdfa] p-2 border-4 shadow-xs ${
                            idx % 2 === 0 ? "border-[#fcd5ce]" : "border-[#d4ebd0]"
                          }`}
                        >
                          {childMascots[idx % childMascots.length]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-xl font-bold text-[#2d3748] truncate">
                              {child.name}
                            </h3>
                            {child.age && (
                              <span className="shrink-0 rounded-full bg-[#fef08a] px-3 py-1 text-xs font-bold text-[#713f12]">
                                {child.age}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[#2d6a4f] font-medium">
                            {child.notes || (isRtl ? "متابعة النطق والتواصل" : "Suivi orthophonique général")}
                          </p>
                        </div>
                      </div>

                      {/* Progression Gauge Pastel */}
                      <div className="mt-5 rounded-2xl border-2 border-[#e8f5e5] bg-[#f4faf2]/80 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2d6a4f] flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#f8a98c]" />
                            {isRtl ? "نسبة التطور والتحسن" : "Score de progression globale"}
                          </span>
                          <span className="font-mono-num font-bold text-[#2d3748]">
                            {progressionPct}%
                          </span>
                        </div>
                        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white border border-[#d4ebd0]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#d4ebd0] via-[#f8a98c] to-[#2d6a4f] transition-all duration-500"
                            style={{ width: `${progressionPct}%` }}
                          />
                        </div>

                        {/* Progression Skills Pills */}
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#2d6a4f] border border-[#d4ebd0]">
                            {isRtl ? "النطق: ممتاز" : "Articulation: En progrès"}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#0284c7] border border-[#bae6fd]">
                            {isRtl ? "المفردات: غنية" : "Vocabulaire: Riche"}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-[#e0684b] border border-[#fcd5ce]">
                            {isRtl ? "الطلاقة: تدريب يومي" : "Fluence: Régulière"}
                          </span>
                        </div>
                      </div>

                      {/* Bilans Section */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#2d3748] mb-2">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-[#2d6a4f]" />
                            {isRtl ? "التقييمات الإكلينيكية المسجلة" : "Bilans orthophoniques"}
                          </span>
                          <span className="text-[11px] text-[#64748b]">
                            {childBilans.length} {isRtl ? "تقرير" : "document(s)"}
                          </span>
                        </div>

                        {childBilans.length === 0 ? (
                          <div className="rounded-2xl border-2 border-dashed border-[#e2ede0] bg-[#fbfdfa] p-3 text-center text-xs text-[#64748b]">
                            {isRtl
                              ? "في انتظار أول تقييم مع الأخصائية."
                              : "Premier bilan complet à planifier avec l'orthophoniste."}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {childBilans.map((b) => (
                              <div
                                key={b.id}
                                className="flex items-center justify-between rounded-2xl border border-[#d4ebd0] bg-[#e8f5e5]/40 p-3"
                              >
                                <div>
                                  <div className="font-bold text-xs text-[#2d3748]">
                                    {isRtl ? `تقييم بتاريخ ${b.assessmentDate}` : `Bilan du ${b.assessmentDate}`}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748b]">
                                    {b.languageScore !== null && (
                                      <span>Langage: {b.languageScore}/100</span>
                                    )}
                                    {b.expressionScore !== null && (
                                      <span>· Débit: {b.expressionScore}/100</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedBilan(b)}
                                  className="inline-flex items-center gap-1 rounded-full bg-[#f8a98c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#e0684b] transition shadow-xs"
                                >
                                  <Printer className="h-3 w-3" />
                                  {isRtl ? "عرض وطباعة" : "Consulter / Imprimer"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-6 pt-4 border-t border-[#e2ede0] flex items-center justify-between">
                      <Link
                        href="/rdv"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e0684b] hover:underline"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {isRtl ? "حجز جلسة جديدة" : "Prendre un RDV"}
                      </Link>
                      <Link
                        href="/espace-parent/profil"
                        className="text-xs font-bold text-[#2d6a4f] hover:underline"
                      >
                        {isRtl ? "تعديل الملف" : "Modifier le profil"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGENDA & TÉLÉCONSULTATION */}
      {activeTab === "agenda" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f2fe] border-2 border-[#bae6fd]">
                <CalendarMascot size={34} />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                  {isRtl ? "جدول المواعيد والاستشارات المرئية" : "Agenda & Téléconsultation WebRTC"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "انضم إلى جلستك المرئية بضغطة زر واحدة أو راجع المواعيد القادمة في العيادة"
                    : "Rejoignez votre consultation vidéo en 1 clic ou gérez vos rendez-vous en cabinet"}
                </p>
              </div>
            </div>

            <Link
              href="/rdv"
              className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              {isRtl ? "حجز جلسة جديدة" : "Prendre un nouveau RDV"}
            </Link>
          </div>

          {/* Featured Next Session Banner */}
          {nextAppointment ? (
            <div className="overflow-hidden rounded-3xl border-2 border-[#d4ebd0] bg-gradient-to-br from-[#e8f5e5] via-[#f0f9ff] to-white p-6 md:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs border-2 border-[#d4ebd0]">
                    <BirdMascot size={52} className="animate-float" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fcd5ce] px-3 py-1 text-xs font-bold text-[#e0684b]">
                      <Clock className="h-3 w-3" />
                      {isRtl ? "الجلسة القادمة" : "Prochaine séance"} · 📅 {nextAppointment.date}
                    </span>
                    <h3 className="mt-2 font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                      {nextAppointment.service} — {nextAppointment.childName}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
                      <span className="font-bold text-[#2d3748] font-mono-num">
                        ⏰ {nextAppointment.time}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#2d3748] border border-[#d4ebd0] font-semibold">
                        {nextAppointment.mode === "teleconsultation" ? (
                          <>
                            <Video className="h-3.5 w-3.5 text-[#e0684b]" />
                            {isRtl ? "استشارة مرئية عن بعد (WebRTC)" : "Téléconsultation Vidéo WebRTC"}
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-[#2d6a4f]" />
                            {isRtl ? "في العيادة (تونس)" : "En cabinet (Tunis, Tunisie)"}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct 1-Click Action */}
                {nextAppointment.mode === "teleconsultation" ? (
                  (() => {
                    const tele = teleMap[nextAppointment.id];
                    const windowStatus = getTeleconsultationWindowStatus(
                      nextAppointment.date,
                      nextAppointment.time,
                      tele?.status,
                      nextAppointment.mode
                    );

                    if (windowStatus.joinable && tele?.roomCode) {
                      return (
                        <Link
                          href={`/teleconsultation/${tele.roomCode}`}
                          className="inline-flex items-center gap-2.5 rounded-full bg-[#f8a98c] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#f8a98c]/40 hover:bg-[#e0684b] active:scale-95 transition-all"
                        >
                          <Video className="h-5 w-5" />
                          <span>{isRtl ? windowStatus.labelAr : windowStatus.labelFr}</span>
                        </Link>
                      );
                    }

                    return (
                      <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#e2ede0] bg-[#f8faf8] px-5 py-3 text-xs font-bold text-[#64748b]">
                        <Clock className="h-4 w-4 text-[#94a3b8]" />
                        <span>{isRtl ? windowStatus.labelAr : windowStatus.labelFr}</span>
                      </div>
                    );
                  })()
                ) : (
                  <div className="rounded-2xl bg-white border-2 border-[#d4ebd0] p-4 text-xs font-semibold text-[#2d6a4f]">
                    <div className="font-bold">{isRtl ? "عيادة د. سارة بن عمار" : "Cabinet d'Orthophonie"}</div>
                    <div className="text-[11px] text-[#64748b]">{isRtl ? "المركز الطبي، تونس" : "Centre médical, Tunis"}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border-2 border-dashed border-[#bae6fd] bg-[#f0f9ff]/50 p-8 text-center sm:text-start">
              <CalendarMascot size={80} />
              <div className="space-y-2 flex-1">
                <h3 className="font-display text-base font-bold text-[#2d3748]">
                  {isRtl ? "لا توجد مواعيد مبرمجة حالياً" : "Aucun rendez-vous à venir"}
                </h3>
                <p className="text-xs text-[#64748b] font-medium">
                  {isRtl
                    ? "احجز موعداً أولياً مع الأخصائية في العيادة أو عبر الاستشارة المرئية عن بعد."
                    : "Prenez rendez-vous en ligne en 2 minutes pour un bilan complet ou une séance de suivi."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/rdv"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e0684b]"
                  >
                    <Calendar className="h-4 w-4" />
                    {isRtl ? "حجز موعد الآن" : "Prendre un rendez-vous"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* List of other upcoming appointments */}
          {upcomingAppointments.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d3748]">
                {isRtl ? "المواعيد الأخرى المبرمجة" : "Autres séances à venir"}
              </h3>
              {upcomingAppointments.slice(1).map((a) => {
                const tele = teleMap[a.id];
                return (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border-2 border-[#d4ebd0] bg-white p-4 shadow-xs hover:border-[#2d6a4f]/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5e5] text-[#2d6a4f]">
                        {a.mode === "teleconsultation" ? (
                          <Video className="h-5 w-5 text-[#e0684b]" />
                        ) : (
                          <Calendar className="h-5 w-5 text-[#2d6a4f]" />
                        )}
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold text-[#2d3748]">
                          {a.service} — {a.childName}
                        </div>
                        <div className="font-mono-num text-xs text-[#64748b]">
                          {a.date} à {a.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          a.mode === "teleconsultation"
                            ? "bg-[#fff3f0] text-[#e0684b] border border-[#fcd5ce]"
                            : "bg-[#e8f5e5] text-[#2d6a4f] border border-[#d4ebd0]"
                        }`}
                      >
                        {a.mode === "teleconsultation"
                          ? isRtl ? "عن بعد" : "Téléconsultation"
                          : isRtl ? "في العيادة" : "Cabinet"}
                      </span>

                      {a.mode === "teleconsultation" && (
                        (() => {
                          const windowStatus = getTeleconsultationWindowStatus(
                            a.date,
                            a.time,
                            tele?.status,
                            a.mode
                          );
                          if (windowStatus.joinable && tele?.roomCode) {
                            return (
                              <Link
                                href={`/teleconsultation/${tele.roomCode}`}
                                className="rounded-full bg-[#f8a98c] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#e0684b] transition"
                              >
                                {isRtl ? "دخول" : "Rejoindre"}
                              </Link>
                            );
                          }
                          return (
                            <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500">
                              {isRtl ? windowStatus.labelAr : windowStatus.labelFr}
                            </span>
                          );
                        })()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past sessions history */}
          {pastAppointments.length > 0 && (
            <details className="group rounded-3xl border-2 border-[#e2ede0] bg-[#fbfdfa] p-5">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332]">
                <span>
                  {isRtl
                    ? `سجل الجلسات السابقة (${pastAppointments.length})`
                    : `Historique des séances passées (${pastAppointments.length})`}
                </span>
                <span className="text-[#2d6a4f] group-open:rotate-90 transition-transform">
                  ▶
                </span>
              </summary>
              <div className="mt-4 divide-y divide-[#e2ede0] space-y-2 pt-2">
                {pastAppointments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between pt-3 text-xs text-[#64748b]"
                  >
                    <div>
                      <span className="font-bold text-[#2d3748]">
                        {p.childName} — {p.service}
                      </span>
                      <div className="text-[11px] text-[#94a3b8] font-mono-num">
                        {p.date} · {p.time}
                      </div>
                    </div>
                    <span className="rounded-full bg-white border border-[#d4ebd0] px-3 py-0.5 text-[11px] font-semibold text-[#2d6a4f]">
                      {p.mode === "teleconsultation" ? "Télé" : "Cabinet"}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* TAB 3: BOÎTE À EXERCICES & JEUX */}
      {activeTab === "exercices" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef08a] border-2 border-[#fde047]">
              <ExerciseBoxMascot size={34} />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                {isRtl ? "صندوق التمارين والألعاب التفاعلية" : "Boîte à Exercices & Mini-Jeux de Prononciation"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {isRtl
                  ? "ألعاب تفاعلية وتمارين تنفس ونطق مرحة موصى بها من قِبل الأخصائية لتقوية اللغة"
                  : "Activités ludiques de souffle, phonologie, vocabulaire et articulation à réaliser à la maison"}
              </p>
            </div>
          </div>

          {/* Interactive exercise box launcher */}
          <ExerciseBoxClient isRtl={isRtl} />
        </div>
      )}

      {/* TAB 4: BOUTIQUE & COMMANDES */}
      {activeTab === "boutique" && (
        <div className="space-y-8 animate-in fade-in">
          {/* Header & Cart Summary Banner */}
          <div className="rounded-3xl border-2 border-[#fcd5ce] bg-gradient-to-r from-[#fff3f0] via-[#fef9c3]/50 to-[#e8f5e5] p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs border-2 border-[#fcd5ce] text-3xl">
                  🛍️
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fcd5ce] px-3 py-0.5 text-xs font-bold text-[#e0684b]">
                    <Sparkles className="h-3 w-3" />
                    {isRtl ? "المتجر التربوي للأولياء" : "Matériel éducatif certifié"}
                  </span>
                  <h2 className="mt-1 font-display text-2xl font-bold text-[#2d3748]">
                    {isRtl ? "أدوات وألعاب تحفيز النطق" : "Boutique & Mes Commandes"}
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    {isRtl
                      ? "ألعاب مختارة من طرف أخصائية النطق لمرافقة تقدم طفلك في المنزل"
                      : "Jeux, cartes syllabiques et outils sensoriels pour prolonger les séances"}
                  </p>
                </div>
              </div>

              {/* Cart Quick Status & Checkout Button */}
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white border-2 border-[#e2ede0] px-4 py-2.5 text-center shadow-xs">
                  <div className="text-[11px] text-[#64748b] font-medium">
                    {isRtl ? "السلة الحالية" : "Mon Panier"}
                  </div>
                  <div className="font-display text-base font-bold text-[#2d3748]">
                    {cartCount} {cartCount === 1 ? (isRtl ? "عنصر" : "article") : (isRtl ? "عناصر" : "articles")}
                    {cartTotalCents > 0 && ` (${(cartTotalCents / 100).toFixed(2)} DT)`}
                  </div>
                </div>
                <Link
                  href="/panier"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] transition"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isRtl ? "عرض السلة وإتمام الطلب" : "Voir le Panier"}
                </Link>
              </div>
            </div>
          </div>

          {/* Section 1: Mes Commandes & Historique d'achats */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-[#2d3748] flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#2d6a4f]" />
              {isRtl ? "سجل طلباتي ومتابعة التوصيل" : "Historique de mes commandes & Suivi de livraison"}
            </h3>

            {ordersList.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-[#d4ebd0] bg-[#e8f5e5]/30 p-6 text-center text-xs text-[#64748b]">
                {isRtl ? "لم تقم بأي طلب بعد من المتجر." : "Vous n'avez pas encore passé de commande."}
              </div>
            ) : (
              <div className="space-y-3">
                {ordersList.map((order) => {
                  const statusColors: Record<string, { bg: string; text: string; labelFr: string; labelAr: string }> = {
                    pending: {
                      bg: "bg-[#fef9c3] border-[#fef08a]",
                      text: "text-[#713f12]",
                      labelFr: "En attente de paiement",
                      labelAr: "في انتظار الدفع",
                    },
                    processing: {
                      bg: "bg-[#e0f2fe] border-[#bae6fd]",
                      text: "text-[#0284c7]",
                      labelFr: "En préparation",
                      labelAr: "قيد التحضير",
                    },
                    shipped: {
                      bg: "bg-[#e8f5e5] border-[#d4ebd0]",
                      text: "text-[#2d6a4f]",
                      labelFr: "Expédiée",
                      labelAr: "تم الشحن",
                    },
                    delivered: {
                      bg: "bg-[#d4ebd0] border-[#2d6a4f]/30",
                      text: "text-[#1b4332]",
                      labelFr: "Livrée",
                      labelAr: "تم التوصيل",
                    },
                    cancelled: {
                      bg: "bg-[#fff3f0] border-[#fcd5ce]",
                      text: "text-[#e0684b]",
                      labelFr: "Annulée",
                      labelAr: "ملغاة",
                    },
                  };

                  const s = statusColors[order.status] ?? statusColors.pending;

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-2 border-[#e2ede0] bg-white p-4 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-[#2d3748]">
                            {isRtl ? `طلب #${order.id}` : `Commande #${order.id}`}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${s.bg} ${s.text}`}
                          >
                            {isRtl ? s.labelAr : s.labelFr}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#64748b]">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.address}
                        </div>
                        {order.trackingNumber && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#2d6a4f]">
                            <Package className="h-3 w-3" />
                            {isRtl ? `رقم التتبع: ${order.trackingNumber}` : `N° de suivi: ${order.trackingNumber}`}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="font-mono-num text-base font-bold text-[#2d3748]">
                          {(order.totalCents / 100).toFixed(2)} DT
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Catalogue des articles d'orthophonie */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#2d3748] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#f8a98c]" />
                {isRtl ? "أدوات تعليمية مميزة للأطفال" : "Articles recommandés par l'orthophoniste"}
              </h3>
              <Link
                href="/boutique"
                className="text-xs font-bold text-[#e0684b] hover:underline"
              >
                {isRtl ? "تصفح كامل المتجر ←" : "Voir tout le catalogue →"}
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsList.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-3xl border-2 border-[#d4ebd0] bg-white p-5 shadow-xs hover:border-[#2d6a4f]/40 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex h-32 items-center justify-center rounded-2xl bg-[#e8f5e5]/50 text-5xl">
                      {product.imageEmoji || "🧩"}
                    </div>
                    <div className="mt-4">
                      <span className="rounded-full bg-[#fef08a] px-2.5 py-0.5 text-[10px] font-bold text-[#713f12]">
                        {product.category}
                      </span>
                      <h4 className="mt-1 font-display text-base font-bold text-[#2d3748] line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="mt-1 text-xs text-[#64748b] line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e2ede0] flex items-center justify-between">
                    <span className="font-mono-num text-base font-bold text-[#2d3748]">
                      {(product.priceCents / 100).toFixed(2)} DT
                    </span>

                    <form action={addToCartAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f8a98c] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0684b] active:scale-95 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isRtl ? "أضف للسلة" : "Ajouter"}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MESSAGERIE & SUPPORT */}
      {activeTab === "messagerie" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e5] border-2 border-[#d4ebd0]">
                <TherapistMascot size={40} />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-[#2d3748]">
                  {isRtl ? "المراسلة المباشرة مع الأخصائية" : "Messagerie Directe & Support Cabinet"}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "تواصل مباشرة مع د. سارة بن عمار لأي استفسار حول التمارين أو المواعيد"
                    : "Échangez directement avec Mme Sarra Ben Ammar pour toute question sur la rééducation"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e5] px-3.5 py-1 text-xs font-bold text-[#2d6a4f] border border-[#d4ebd0]">
                <span className="h-2 w-2 rounded-full bg-[#2d6a4f] animate-ping" />
                {isRtl ? "الأخصائية متصلة" : "Praticien joignable"}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Thread Area (Left/Main 2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border-2 border-[#d4ebd0] bg-[#fbfdfa] p-5 shadow-xs space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map((m) => {
                  const isTherapist = m.sender === "orthophoniste";
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${isTherapist ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-xs ${
                          isTherapist
                            ? "border-[#d4ebd0] bg-[#e8f5e5]"
                            : "border-[#fcd5ce] bg-[#fff3f0]"
                        }`}
                      >
                        {isTherapist ? (
                          <TherapistMascot size={28} />
                        ) : (
                          <SmilingChildMascot size={28} />
                        )}
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                          isTherapist
                            ? "bg-white border-2 border-[#d4ebd0] text-[#2d3748]"
                            : "bg-[#f8a98c] text-white font-medium"
                        }`}
                      >
                        {m.subject && (
                          <div
                            className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
                              isTherapist ? "text-[#2d6a4f]" : "text-white/90"
                            }`}
                          >
                            {m.subject}
                          </div>
                        )}
                        <p>{m.content}</p>
                        <div
                          className={`mt-2 text-[10px] text-end ${
                            isTherapist ? "text-[#94a3b8]" : "text-white/80"
                          }`}
                        >
                          {m.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="rounded-3xl border-2 border-[#fcd5ce] bg-white p-5 shadow-xs space-y-3"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
                  {isRtl ? `إرسال رسالة جديدة للأخصائية (${user.fullName})` : `Envoyer un message à l'orthophoniste (${user.fullName})`}
                </h4>

                <input
                  type="text"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  placeholder={
                    isRtl
                      ? "الموضوع (مثال: استفسار حول تمرين النطق)"
                      : "Objet (ex: Question sur l'exercice de souffle du lapin)"
                  }
                  className="w-full rounded-2xl border-2 border-[#e2ede0] px-4 py-2.5 text-xs text-[#2d3748] placeholder:text-[#94a3b8] focus:border-[#f8a98c] focus:outline-hidden"
                />

                <textarea
                  rows={3}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={
                    isRtl
                      ? "اكتب رسالتك هنا بكل وضوح..."
                      : "Écrivez votre message ici... (Mme Sarra Ben Ammar vous répondra dans les plus brefs délais)"
                  }
                  className="w-full rounded-2xl border-2 border-[#e2ede0] p-4 text-xs text-[#2d3748] placeholder:text-[#94a3b8] focus:border-[#f8a98c] focus:outline-hidden resize-none"
                />

                <div className="flex items-center justify-between">
                  {messageSentFeedback ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f]">
                      <CheckCircle2 className="h-4 w-4" />
                      {isRtl ? "تم إرسال رسالتك بنجاح !" : "Message envoyé avec succès !"}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#64748b]">
                      {isRtl ? "رد سريع خلال 24 ساعة" : "Réponse assurée sous 24h"}
                    </span>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition"
                  >
                    <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                    {isRtl ? "إرسال" : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>

            {/* Cabinet Support Info (Right Col) */}
            <div className="space-y-4">
              <div className="rounded-3xl border-2 border-[#d4ebd0] bg-[#e8f5e5]/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-[#d4ebd0] text-[#2d6a4f]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#2d3748]">
                      {isRtl ? "اتصال عاجل بالعيادة" : "Contact Cabinet & Urgences"}
                    </h4>
                    <p className="text-[11px] text-[#64748b]">
                      {isRtl ? "مفتوح من الاثنين إلى السبت" : "Du lundi au samedi (9h - 18h)"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#2d3748] pt-2 border-t border-[#d4ebd0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">{isRtl ? "الهاتف :" : "Tél :"}</span>
                    <strong className="font-mono-num">+216 71 000 000</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">{isRtl ? "البريد :" : "Email :"}</span>
                    <strong>contact@lisenwakalem.tn</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">{isRtl ? "العنوان :" : "Adresse :"}</span>
                    <span>Tunis, Tunisie</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border-2 border-[#bae6fd] bg-[#f0f9ff]/60 p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0284c7]">
                  <HelpCircle className="h-4 w-4" />
                  {isRtl ? "مساعدة في الاستشارة المرئية" : "Aide Téléconsultation"}
                </div>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {isRtl
                    ? "لتجربة استشارة ممتازة، تأكد من استعمال ميكروفون وسماعات أذن في مكان هادئ مع اتصال إنترنت مستقر."
                    : "Pour une séance WebRTC optimale, installez l'enfant dans un endroit calme avec un casque audio et une bonne connexion."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
