import Link from "next/link";
import { ShoppingBag, User, Video } from "lucide-react";
import { Waveform } from "./Waveform";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { site } from "@/data/content";
import { getSession } from "@/lib/auth";
import { t, type Locale } from "@/lib/i18n";

export async function Nav({ locale }: { locale: Locale }) {
  const session = await getSession();
  const s = t(locale).nav;

  const links = [
    { href: "/services", label: s.services },
    { href: "/blog", label: s.blog },
    { href: "/boutique", label: s.boutique },
    { href: "/avis", label: s.avis },
    { href: "/a-propos", label: s.aPropos },
  ];

  const isLoggedIn = !!session;
  const isAdmin = session?.role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e2ede0] bg-[#fbfdfa]/95 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-6 lg:px-12 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Waveform animated color="#f8a98c" className="h-6" />
          <span className="font-display text-lg font-bold tracking-tight text-[#2d3748]">
            {site.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-[#2d3748]/80 transition hover:text-[#e0684b]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/panier"
            aria-label={s.panier}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e2ede0] bg-white text-[#2d3748] hover:border-[#d4ebd0] hover:bg-[#e8f5e5] transition"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
          <Link
            href={isLoggedIn ? (isAdmin ? "/admin" : "/espace-parent") : "/espace-parent/connexion"}
            aria-label={s.espaceParent}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e2ede0] bg-white text-[#2d3748] hover:border-[#fcd5ce] hover:bg-[#fff3f0] transition"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/teleconsultation"
            className="flex items-center gap-1.5 rounded-full border-2 border-[#bae6fd] bg-[#f0f9ff] px-4 py-2 text-xs font-bold text-[#0284c7] shadow-xs transition hover:border-[#f8a98c] hover:text-[#e0684b]"
          >
            <Video className="h-4 w-4 text-[#e0684b]" />
            <span>{s.teleconsultation}</span>
          </Link>
          <Link
            href="/rdv"
            className="rounded-full bg-[#f8a98c] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#f8a98c]/30 transition hover:bg-[#e0684b] active:scale-95"
          >
            {s.rdv}
          </Link>
        </div>

        {/* Mobile menu (client component) */}
        <MobileMenu
          links={links}
          rdvLabel={s.rdv}
          teleconsultationLabel={s.teleconsultation}
          espaceParentLabel={s.espaceParent}
          panierLabel={s.panier}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          locale={locale}
        />
      </div>
    </header>
  );
}
