import Link from "next/link";
import { ArrowRight, Calendar, Video, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { eq, desc } from "drizzle-orm";
import { Waveform, WaveDivider } from "@/components/Waveform";
import { services, testimonials, parcours, site } from "@/data/content";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";
import {
  RabbitMascot,
  BearMascot,
  BirdMascot,
  SmilingChildMascot,
  CuteSun,
  CuteCloud,
  CuteBee,
} from "@/components/CuteIllustrations";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const hero = t(locale).hero;

  let latestArticles: (typeof articles.$inferSelect)[] = [];
  try {
    latestArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(3);
  } catch (error) {
    console.warn("DB offline or unavailable, fallback to empty articles", error);
    latestArticles = [];
  }

  const serviceMascots = [
    <RabbitMascot key="s1" size={54} className="animate-bounce-soft" />,
    <BearMascot key="s2" size={54} className="animate-wiggle" />,
    <BirdMascot key="s3" size={54} className="animate-float" />,
    <SmilingChildMascot key="s4" size={54} className="animate-bounce-soft" />,
  ];

  return (
    <div className="w-full">
      {/* Hero Section Plein Écran avec Bannière Saumon & Illustrations Mignonnes */}
      <section className="relative w-full px-6 lg:px-12 xl:px-16 pb-16 pt-10 md:pt-16 overflow-hidden">
        {/* Éléments décoratifs vectoriels pastel en arrière-plan */}
        <div className="pointer-events-none absolute -top-4 start-10 opacity-70">
          <CuteCloud size={110} className="animate-float" />
        </div>
        <div className="pointer-events-none absolute top-4 end-16 opacity-90 hidden sm:block">
          <CuteSun size={95} className="animate-wiggle" />
        </div>
        <div className="pointer-events-none absolute top-48 start-1/2 -translate-x-1/2 opacity-80 hidden md:block">
          <CuteBee size={60} className="animate-bounce-soft" />
        </div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            {/* Badge d'accueil saumon / pêche pastel */}
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#fcd5ce] bg-[#fff3f0] px-4 py-1.5 text-xs font-bold text-[#e0684b] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#f8a98c]" />
              <span>{hero.badge} · {site.ville}</span>
            </div>

            <h1 className="mt-4 font-display text-4xl leading-[1.15] font-bold tracking-tight text-[#2d3748] md:text-5xl lg:text-6xl">
              {hero.title1}
              <br />
              <em className="italic text-[#e0684b]">{hero.title2}</em>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#64748b] font-medium">
              {hero.subtitle}
            </p>

            {/* Boutons CTA aux couleurs de la charte : Saumon & Vert Menthe */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/rdv"
                className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#f8a98c]/30 transition hover:bg-[#e0684b] hover:shadow-lg active:scale-95"
              >
                {hero.cta1} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-6 py-3.5 text-sm font-bold text-[#2d6a4f] shadow-xs transition hover:bg-[#d4ebd0]"
              >
                {hero.cta2}
              </Link>
            </div>
          </div>

          {/* Bannière Hero Saumon Pastel & Mascottes */}
          <div className="relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-[#fcd5ce] bg-gradient-to-br from-[#fcd5ce]/80 via-[#fff3f0] to-[#e8f5e5]/80 p-8 shadow-sm md:h-[420px]">
            <div className="absolute top-4 start-5 flex items-center gap-2">
              <BirdMascot size={52} className="animate-float" />
              <span className="hidden sm:inline-block rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#0284c7] shadow-xs border border-[#bae6fd]">
                Gazouille & Écoute 🎶
              </span>
            </div>

            <div className="absolute bottom-4 end-5">
              <RabbitMascot size={70} className="animate-bounce-soft" />
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <Waveform animated className="h-20 scale-125" />
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 shadow-xs border border-[#fcd5ce]">
                <Heart className="h-4 w-4 text-[#f8a98c] fill-[#f8a98c]" />
                <span className="font-display text-sm md:text-base font-semibold italic text-[#2d3748] text-center">
                  &ldquo;Il a dit sa première phrase complète hier.&rdquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider className="w-full px-6 lg:px-12 opacity-40" />

      {/* Barre de Confiance Pastel (Vert Menthe & Pêche) */}
      <section className="w-full px-6 lg:px-12 xl:px-16 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TrustItem
            icon={<Calendar className="h-5 w-5 text-[#e0684b]" />}
            title="Rendez-vous en ligne"
            text="Créneau confirmé en 2 minutes, rappel automatique par SMS."
            bg="bg-[#fff3f0] border-2 border-[#fcd5ce]"
          />
          <TrustItem
            icon={<Video className="h-5 w-5 text-[#2d6a4f]" />}
            title="Téléconsultation WebRTC"
            text="Séances vidéo haute définition sécurisées et interactives."
            bg="bg-[#e8f5e5] border-2 border-[#d4ebd0]"
          />
          <TrustItem
            icon={<ShieldCheck className="h-5 w-5 text-[#0284c7]" />}
            title="Données protégées RGPD"
            text="Confidentialité totale des dossiers et bilans médicaux."
            bg="bg-[#f0f9ff] border-2 border-[#bae6fd]"
          />
        </div>
      </section>

      {/* SECTION SERVICES : Plein écran avec fond vert menthe */}
      <section className="bg-[#f4faf2] py-20 border-y border-[#e2ede0] w-full px-6 lg:px-12 xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d4ebd0] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              <Sparkles className="h-3.5 w-3.5" />
              Services & Soins Doux
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#2d3748]">
              Un accompagnement bienveillant pour chaque enfant
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-[#e0684b] hover:underline"
          >
            Tous les services →
          </Link>
        </div>

        {/* Grille de cartes services rondes sur fond vert menthe (#e8f5e5) */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s, idx) => {
            const mascot = serviceMascots[idx % serviceMascots.length];
            return (
              <div
                key={s.slug}
                className="group flex flex-col justify-between rounded-3xl border-2 border-[#d4ebd0] bg-[#e8f5e5] p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#2d6a4f]/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-[#d4ebd0]">
                      {mascot}
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 font-mono-num text-xs font-bold text-[#2d6a4f] shadow-2xs border border-[#d4ebd0]">
                      {s.ageRange}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#2d3748] group-hover:text-[#e0684b] transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#2d6a4f]/80 font-medium">
                    {s.summary}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#d4ebd0]">
                  <Link
                    href="/rdv"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#e0684b] hover:underline"
                  >
                    Prendre rendez-vous →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Parcours Praticienne Plein Écran */}
      <section className="w-full px-6 lg:px-12 xl:px-16 py-20">
        <span className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
          Expertise & Bienveillance
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#2d3748]">
          {site.orthophoniste}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#64748b] font-medium">
          Orthophoniste diplômée d&apos;État, spécialisée dans l&apos;accompagnement
          des enfants et de leurs familles depuis plus de dix ans.
        </p>

        <ol className="mt-10 grid gap-6 border-t border-[#e2ede0] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {parcours.map((p) => (
            <li key={p.year} className="border-s-2 border-[#f8a98c] ps-4">
              <div className="font-mono-num text-sm font-bold text-[#e0684b]">{p.year}</div>
              <div className="mt-1 text-sm font-medium text-[#2d3748]">{p.label}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Blog preview */}
      <section className="bg-[#f4faf2] py-20 border-t border-[#e2ede0] w-full px-6 lg:px-12 xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
              Blog & Conseils
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#2d3748]">
              Ressources pour les parents
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-[#e0684b] hover:underline"
          >
            Tous les articles →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {latestArticles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="flex flex-col rounded-3xl border-2 border-[#d4ebd0] bg-white p-6 transition hover:border-[#f8a98c] hover:shadow-md"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
                {a.category}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold leading-snug text-[#2d3748]">
                {a.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748b] line-clamp-3 font-medium">
                {a.excerpt}
              </p>
              <span className="mt-4 font-mono-num text-xs text-[#94a3b8]">
                {a.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="w-full px-6 lg:px-12 xl:px-16 py-20">
        <span className="text-xs font-bold uppercase tracking-wider text-[#e0684b]">
          Témoignages Chaleureux
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#2d3748]">
          Ce que disent les parents
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl border-2 border-[#d4ebd0] bg-[#e8f5e5]/50 p-6 shadow-xs"
            >
              <blockquote className="font-display text-sm italic leading-relaxed text-[#2d3748]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-xs">
                <div className="font-bold text-[#2d3748]">{t.name}</div>
                <div className="text-[#64748b]">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA final Saumon / Menthe */}
      <section className="w-full px-6 lg:px-12 xl:px-16 pb-24">
        <div className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-gradient-to-r from-[#e8f5e5] via-[#fff3f0] to-[#fcd5ce] border-2 border-[#fcd5ce] px-8 py-14 text-center shadow-md">
          <Waveform animated color="#f8a98c" className="h-10" />
          <h2 className="max-w-xl font-display text-2xl md:text-3xl font-bold text-[#2d3748]">
            Le premier pas commence par un rendez-vous
          </h2>
          <Link
            href="/rdv"
            className="inline-flex items-center gap-2 rounded-full bg-[#f8a98c] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#e0684b] shadow-md shadow-[#f8a98c]/30 active:scale-95"
          >
            Réserver un créneau <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  text,
  bg = "bg-white border-2 border-[#d4ebd0]",
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  bg?: string;
}) {
  return (
    <div className={`flex items-start gap-3.5 rounded-3xl p-5 shadow-xs ${bg}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xs border border-white">
        {icon}
      </span>
      <div>
        <div className="text-sm font-bold text-[#2d3748]">{title}</div>
        <div className="mt-1 text-xs text-[#64748b] leading-relaxed font-medium">{text}</div>
      </div>
    </div>
  );
}
