import Link from "next/link";
import { site } from "@/data/content";
import { Waveform } from "./Waveform";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { t, type Locale } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const s = t(locale).footer;
  const nav = t(locale).nav;

  return (
    <footer className="w-full border-t border-[#e2ede0] bg-[#f4faf2]">
      <div className="w-full px-6 lg:px-12 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Waveform color="#f8a98c" className="h-5" />
              <span className="font-display text-base font-bold text-[#2d3748]">
                {site.name}
              </span>
            </div>
            <p className="mt-3 text-sm text-[#64748b] font-medium">{s.tagline}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              {s.nav}
            </h4>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li><Link href="/services" className="text-[#64748b] hover:text-[#e0684b]">{nav.services}</Link></li>
              <li><Link href="/blog" className="text-[#64748b] hover:text-[#e0684b]">{nav.blog}</Link></li>
              <li><Link href="/a-propos" className="text-[#64748b] hover:text-[#e0684b]">{nav.aPropos}</Link></li>
              <li><Link href="/rdv" className="text-[#64748b] hover:text-[#e0684b]">{nav.rdv}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              {s.contact}
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-[#64748b] font-medium">
              <li>{site.ville}</li>
              <li>{site.phone}</li>
              <li>{site.email}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              {s.legal}
            </h4>
            <ul className="mt-3 space-y-2 text-sm font-medium">
              <li>
                <Link href="/politique-de-confidentialite" className="text-[#64748b] hover:text-[#e0684b]">
                  {s.privacy}
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-[#64748b] hover:text-[#e0684b]">
                  {s.terms}
                </Link>
              </li>
              <li className="pt-1">
                <LanguageSwitcher locale={locale} />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[#e2ede0] pt-6 text-xs text-[#94a3b8] md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {site.name}. {s.rights}</span>
          <span>RGPD · Droit d&apos;accès, de portabilité et d&apos;effacement</span>
        </div>
      </div>
    </footer>
  );
}
