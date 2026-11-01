"use client";

import React, { useState } from "react";
import { Plus, X, UserPlus, Sparkles, Loader2 } from "lucide-react";
import { addChild } from "@/app/espace-parent/profil/actions";

export function AddChildModal({ isRtl = false }: { isRtl?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await addChild(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setIsOpen(false);
      form.reset();
    } catch {
      setError(
        isRtl
          ? "حدث خطأ أثناء حفظ الملف."
          : "Une erreur inattendue est survenue lors de l'enregistrement."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = () => {
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 transition-all hover:bg-[#e0684b] active:scale-95"
      >
        <Plus className="h-4 w-4" />
        {isRtl ? "إضافة طفل جديد" : "Ajouter un enfant"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 md:p-8 shadow-2xl">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-5 end-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f4faf2] text-[#64748b] hover:bg-[#e8f5e5] hover:text-[#2d6a4f] disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e5] border border-[#d4ebd0] text-[#2d6a4f]">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#2d3748]">
                  {isRtl ? "إضافة ملف طفل" : "Nouveau profil enfant"}
                </h3>
                <p className="text-xs text-[#64748b]">
                  {isRtl
                    ? "أدخل معلومات طfلك لمتابعة جلساته وتمارينه"
                    : "Renseignez les détails pour personnaliser son parcours"}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-[#fcd5ce] bg-[#fff3f0] p-3 text-xs font-bold text-[#e0684b]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2d3748]">
                  {isRtl ? "اسم الطفل أو لقبه *" : "Prénom de l'enfant *"}
                </label>
                <input
                  name="name"
                  required
                  disabled={isSubmitting}
                  placeholder={isRtl ? "مثال: يوسف، سارة" : "Ex: Adam, Maya..."}
                  className="mt-1.5 w-full rounded-2xl border-2 border-[#d4ebd0] px-4 py-2.5 text-sm text-[#2d3748] placeholder:text-[#94a3b8] outline-none focus:border-[#f8a98c] focus:ring-2 focus:ring-[#f8a98c]/20 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2d3748]">
                  {isRtl ? "العمر" : "Âge de l'enfant"}
                </label>
                <input
                  name="age"
                  disabled={isSubmitting}
                  placeholder={isRtl ? "مثال: 5 سنوات" : "Ex: 4 ans et demi"}
                  className="mt-1.5 w-full rounded-2xl border-2 border-[#d4ebd0] px-4 py-2.5 text-sm text-[#2d3748] placeholder:text-[#94a3b8] outline-none focus:border-[#f8a98c] focus:ring-2 focus:ring-[#f8a98c]/20 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2d3748]">
                  {isRtl ? "ملاحظات أو صعوبات يواجهها" : "Notes ou besoins particuliers"}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  disabled={isSubmitting}
                  placeholder={
                    isRtl
                      ? "مثال: تأخر في نطق بعض الحروف، يحتاج تمارين تركيز..."
                      : "Ex: Retard d'articulation, difficulté avec le son /r/..."
                  }
                  className="mt-1.5 w-full rounded-2xl border-2 border-[#d4ebd0] px-4 py-2.5 text-sm text-[#2d3748] placeholder:text-[#94a3b8] outline-none focus:border-[#f8a98c] focus:ring-2 focus:ring-[#f8a98c]/20 disabled:opacity-60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f4faf2] disabled:opacity-50"
                >
                  {isRtl ? "إلغاء" : "Annuler"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-[#f8a98c] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 transition-all hover:bg-[#e0684b] disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isRtl ? "جاري الحفظ..." : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {isRtl ? "حفظ الملف" : "Enregistrer l'enfant"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
