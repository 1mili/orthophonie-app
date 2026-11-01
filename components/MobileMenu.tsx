"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Menu, ShoppingBag, User, Video } from "lucide-react";
import { Waveform } from "./Waveform";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { site } from "@/data/content";
import type { Locale } from "@/lib/i18n";

type NavLink = { href: string; label: string };

interface MobileMenuProps {
  links: NavLink[];
  rdvLabel: string;
  teleconsultationLabel?: string;
  espaceParentLabel: string;
  panierLabel: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  locale: Locale;
}

export function MobileMenu({
  links,
  rdvLabel,
  teleconsultationLabel = "Téléconsultation",
  espaceParentLabel,
  panierLabel,
  isLoggedIn,
  isAdmin,
  locale,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  // Close menu on route change (when a link is clicked)
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink/70"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 end-0 z-[201] flex w-72 max-w-full flex-col bg-paper shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Waveform className="h-5" />
            <span className="font-display text-sm font-semibold">{site.name}</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-ink/75 hover:bg-white hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-line pt-6">
            <Link
              href="/panier"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink/75 hover:bg-white hover:text-ink"
            >
              <ShoppingBag className="h-4 w-4" />
              {panierLabel}
            </Link>
            <Link
              href={isLoggedIn ? (isAdmin ? "/admin" : "/espace-parent") : "/espace-parent/connexion"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink/75 hover:bg-white hover:text-ink"
            >
              <User className="h-4 w-4" />
              {espaceParentLabel}
            </Link>
          </div>
        </nav>

        {/* CTA */}
        <div className="border-t border-line p-4 space-y-2.5">
          <Link
            href="/teleconsultation"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white py-2.5 text-center text-sm font-semibold text-ink/80 hover:border-coral hover:text-coral transition"
          >
            <Video className="h-4 w-4 text-coral" />
            <span>{teleconsultationLabel}</span>
          </Link>
          <Link
            href="/rdv"
            onClick={() => setOpen(false)}
            className="block w-full rounded-full bg-coral py-3 text-center text-sm font-semibold text-white hover:brightness-95 transition"
          >
            {rdvLabel}
          </Link>
          <div className="flex justify-center pt-1">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
