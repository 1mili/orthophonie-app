import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { PublicLayoutWrapper } from "@/components/PublicLayoutWrapper";
import { getLocale } from "@/lib/locale-actions";

export const metadata: Metadata = {
  title: "Lisen Wa Kalem — Cabinet d'orthophonie pour enfants",
  description:
    "Plateforme digitale d'orthophonie : rendez-vous en ligne, téléconsultation, blog éducatif pour les parents et boutique d'outils pédagogiques.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const isRtl = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <body className="antialiased w-full min-h-screen bg-[#fbfdfa] text-[#2d3748]">
        <PublicLayoutWrapper
          header={<Nav locale={locale} />}
          footer={<Footer locale={locale} />}
        >
          {children}
        </PublicLayoutWrapper>
        <CookieConsent locale={locale} />
      </body>
    </html>
  );
}
