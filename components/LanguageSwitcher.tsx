"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocale } from "@/lib/locale-actions";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next: Locale = locale === "fr" ? "ar" : "fr";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={locale === "fr" ? "التبديل إلى العربية" : "Passer en français"}
      className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink/70 hover:border-ink/30 disabled:opacity-50"
    >
      <Languages className="h-4 w-4" />
      {locale === "fr" ? "العربية" : "Français"}
    </button>
  );
}
