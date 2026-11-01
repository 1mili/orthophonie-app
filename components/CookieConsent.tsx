"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const CONSENT_KEY = "ortho_cookie_consent";

export function CookieConsent({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsent = document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${CONSENT_KEY}=`));
    if (!hasConsent) {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    document.cookie = `${CONSENT_KEY}=accepted; path=/; max-age=${60 * 60 * 24 * 365}`;
    setVisible(false);
  }

  if (!visible) return null;

  const isAr = locale === "ar";

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-line bg-white p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
        <div>
          <p className="text-sm text-ink/75">
            {isAr
              ? "نستخدم ملفات تعريف ارتباط ضرورية لعمل الموقع (الجلسة، السلة، تفضيل اللغة). لا نستخدم ملفات إعلانية أو تتبع طرف ثالث."
              : "Nous utilisons des cookies essentiels au fonctionnement du site (session, panier, préférence de langue). Aucun cookie publicitaire ou de suivi tiers n'est utilisé."}{" "}
            <a href="/politique-de-confidentialite" className="font-semibold text-coral hover:underline">
              {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
            </a>
          </p>
          <button
            onClick={accept}
            className="mt-3 rounded-full bg-coral px-5 py-2 text-xs font-semibold text-white hover:brightness-95"
          >
            {isAr ? "حسنًا" : "J'ai compris"}
          </button>
        </div>
      </div>
    </div>
  );
}
