import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { services } from "@/data/content";
import { WaveDivider } from "@/components/Waveform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Lisen Wa Kalem",
  description: "Les services d'orthophonie proposés par le cabinet.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-coral">
        Services
      </span>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Un accompagnement adapté à chaque enfant
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
        Chaque prise en charge démarre par un bilan personnalisé, pour construire
        un accompagnement adapté à l&apos;âge et aux besoins de votre enfant.
      </p>

      <WaveDivider className="mt-8 max-w-xs" />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <div
            key={s.slug}
            className="flex flex-col justify-between rounded-2xl border border-line bg-white p-7"
          >
            <div>
              <span className="font-mono-num text-xs text-sage-deep">
                {s.ageRange}
              </span>
              <h2 className="mt-2 font-display text-xl font-semibold">
                {s.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {s.summary}
              </p>
              <ul className="mt-5 space-y-2">
                {s.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-ink/75">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/rdv"
              className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-coral hover:brightness-90"
            >
              Prendre rendez-vous <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
