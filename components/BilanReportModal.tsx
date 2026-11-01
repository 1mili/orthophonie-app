"use client";

import React from "react";
import {
  X,
  Printer,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  User,
  Heart,
} from "lucide-react";
import { TherapistMascot } from "./CuteIllustrations";

export interface BilanData {
  id: number;
  parentId?: number;
  childName: string;
  assessmentDate: string;
  languageScore: number | null;
  readingScore: number | null;
  expressionScore: number | null;
  notes: string | null;
  recommendations: string | null;
}

interface BilanReportModalProps {
  bilan: BilanData | null;
  onClose: () => void;
  isRtl?: boolean;
}

export function BilanReportModal({ bilan, onClose, isRtl = false }: BilanReportModalProps) {
  if (!bilan) return null;

  const handlePrint = () => {
    window.print();
  };

  const calculateGlobalScore = () => {
    const scores = [bilan.languageScore, bilan.readingScore, bilan.expressionScore].filter(
      (s): s is number => s !== null && s !== undefined
    );
    if (scores.length === 0) return 80;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const globalScore = calculateGlobalScore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f9fa] text-[#64748b] hover:bg-[#fff3f0] hover:text-[#e0684b] transition"
          aria-label={isRtl ? "إغلاق" : "Fermer"}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Bilan Header / En-tête Médical Pastel */}
        <div className="border-b-2 border-dashed border-[#d4ebd0] pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5e5] border-2 border-[#d4ebd0]">
              <TherapistMascot size={52} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e5] px-3 py-0.5 text-xs font-bold text-[#2d6a4f]">
                <Sparkles className="h-3 w-3 text-[#2d6a4f]" />
                {isRtl ? "تقرير التقييم النطقي واللغوي" : "Bilan Orthophonique Officiel"}
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#2d3748]">
                {bilan.childName}
              </h2>
              <p className="text-xs text-[#64748b]">
                {isRtl
                  ? "عيادة د. سارة بن عمار — أخصائية تقويم النطق واللغة"
                  : "Cabinet d'Orthophonie Mme Sarra Ben Ammar · Tunis, Tunisie"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748b]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-[#2d6a4f]" />
              {isRtl ? "تاريخ التقييم :" : "Date du bilan :"} <strong>{bilan.assessmentDate}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-[#e0684b]" />
              {isRtl ? "المريض :" : "Patient :"} <strong>{bilan.childName}</strong>
            </span>
          </div>
        </div>

        {/* Global Progress Card */}
        <div className="mt-6 rounded-2xl border-2 border-[#fef08a] bg-[#fef9c3]/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef08a] text-[#713f12]">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#713f12]">
                  {isRtl ? "مؤشر التطور الإجمالي" : "Indice d'Évolution Global"}
                </h4>
                <p className="text-xs text-[#854d0e]">
                  {isRtl
                    ? "تقييم سريري شامل لمهارات التواصل والنطق"
                    : "Évaluation clinique complète du langage oral et de la communication"}
                </p>
              </div>
            </div>
            <div className="text-end font-mono-num text-2xl font-bold text-[#713f12]">
              {globalScore}%
            </div>
          </div>
        </div>

        {/* Detailed Scores Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
            {isRtl ? "تفاصيل النتائج حسب المحاور" : "Résultats Détaillés par Axe"}
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Langage Oral */}
            <div className="rounded-2xl border-2 border-[#d4ebd0] bg-[#e8f5e5]/40 p-3.5">
              <div className="text-xs font-bold text-[#2d6a4f]">
                {isRtl ? "اللغة الشفهية" : "Langage Oral"}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono-num text-xl font-bold text-[#2d3748]">
                  {bilan.languageScore ?? "—"}/100
                </span>
                <span className="text-[11px] font-semibold text-[#2d6a4f]">
                  {bilan.languageScore && bilan.languageScore >= 70
                    ? isRtl ? "مكتسب" : "Acquis"
                    : isRtl ? "في طور التعلم" : "En cours"}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#2d6a4f] transition-all"
                  style={{ width: `${bilan.languageScore ?? 75}%` }}
                />
              </div>
            </div>

            {/* Conscience / Lecture */}
            <div className="rounded-2xl border-2 border-[#bae6fd] bg-[#f0f9ff]/50 p-3.5">
              <div className="text-xs font-bold text-[#0284c7]">
                {isRtl ? "الوعي الصوتي والقراءة" : "Conscience & Lecture"}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono-num text-xl font-bold text-[#2d3748]">
                  {bilan.readingScore ?? "—"}/100
                </span>
                <span className="text-[11px] font-semibold text-[#0284c7]">
                  {bilan.readingScore && bilan.readingScore >= 70
                    ? isRtl ? "مكتسب" : "Acquis"
                    : isRtl ? "في طور التعلم" : "En cours"}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#0284c7] transition-all"
                  style={{ width: `${bilan.readingScore ?? 70}%` }}
                />
              </div>
            </div>

            {/* Expression & Articulation */}
            <div className="rounded-2xl border-2 border-[#fcd5ce] bg-[#fff3f0]/50 p-3.5">
              <div className="text-xs font-bold text-[#e0684b]">
                {isRtl ? "التعبير والنطق" : "Expression & Débit"}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono-num text-xl font-bold text-[#2d3748]">
                  {bilan.expressionScore ?? "—"}/100
                </span>
                <span className="text-[11px] font-semibold text-[#e0684b]">
                  {bilan.expressionScore && bilan.expressionScore >= 70
                    ? isRtl ? "مكتسب" : "Acquis"
                    : isRtl ? "في طور التعلم" : "En cours"}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#e0684b] transition-all"
                  style={{ width: `${bilan.expressionScore ?? 80}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        {bilan.notes && (
          <div className="mt-6 rounded-2xl border-2 border-[#e2ede0] bg-[#fbfdfa] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d3748]">
              📝 {isRtl ? "الملاحظات الإكلينيكية للأخصائية" : "Observations Cliniques de l'Orthophoniste"}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#4a5568]">
              {bilan.notes}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {bilan.recommendations && (
          <div className="mt-4 rounded-2xl border-2 border-[#d4ebd0] bg-[#e8f5e5]/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f] flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-[#e0684b]" />
              {isRtl ? "توصيات وتمارين مقترحة للأسرة" : "Recommandations et Activités à Domicile"}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-[#2d3748] font-medium">
              {bilan.recommendations}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-[#e2ede0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
            <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
            <span>
              {isRtl
                ? "وثيقة معتمدة صالحة للمتابعة المدرسية والطبية"
                : "Document certifié · Conforme aux normes orthophoniques"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition"
            >
              <Printer className="h-4 w-4" />
              {isRtl ? "طباعة / تحميل التقرير (PDF)" : "Imprimer / Télécharger (PDF)"}
            </button>
            <button
              onClick={onClose}
              className="rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
            >
              {isRtl ? "إغلاق" : "Fermer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
