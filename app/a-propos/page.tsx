import { parcours, testimonials, site } from "@/data/content";
import { WaveDivider, Waveform } from "@/components/Waveform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — Lisen Wa Kalem",
  description: "Parcours professionnel et témoignages des familles accompagnées.",
};

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-coral">
            À propos
          </span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            {site.orthophoniste}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            Orthophoniste diplômée d&apos;État, j&apos;accompagne depuis plus de
            dix ans des enfants et leurs familles à {site.ville}, avec une
            conviction : chaque enfant mérite d&apos;être entendu, à son rythme.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            La plateforme est née d&apos;un constat simple : les parents manquent
            souvent de repères clairs face aux troubles du langage. Elle réunit
            prise de rendez-vous, téléconsultation et ressources éducatives en
            un seul endroit.
          </p>
        </div>
        <div className="flex h-64 items-center justify-center rounded-3xl border border-line bg-white">
          <Waveform animated className="h-16 scale-150" />
        </div>
      </div>

      <WaveDivider className="mt-14 max-w-xs" />

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Parcours</h2>
        <ol className="mt-6 space-y-6 border-s border-line ps-6">
          {parcours.map((p) => (
            <li key={p.year} className="relative">
              <span className="absolute -start-[29px] top-1 h-2.5 w-2.5 rounded-full bg-coral" />
              <div className="font-mono-num text-sm text-coral">{p.year}</div>
              <div className="mt-1 text-sm text-ink/75">{p.label}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold">Témoignages</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-line bg-white p-6">
              <blockquote className="font-display text-base italic leading-relaxed text-ink/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-ink/50">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
