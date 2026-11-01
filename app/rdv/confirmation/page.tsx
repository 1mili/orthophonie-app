import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Waveform } from "@/components/Waveform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rendez-vous confirmé — Lisen Wa Kalem",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { date, time, service, room, paid } = params;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage-deep">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        Rendez-vous confirmé
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/65">
        Un email et un SMS de confirmation viennent de vous être envoyés.
      </p>

      {formattedDate && time && (
        <div className="mt-8 w-full rounded-2xl border border-line bg-white p-6 text-start">
          <Row label="Date" value={formattedDate} />
          <Row label="Heure" value={`${time}`} />
          {service && <Row label="Motif" value={decodeURIComponent(service)} />}
          {paid === "1" && <Row label="Acompte" value="20 DT payé en ligne ✓" />}
        </div>
      )}

      <Waveform animated className="mt-10 h-8" />

      {room && (
        <Link
          href={`/teleconsultation/${room}`}
          className="mt-6 text-sm font-semibold text-sage-deep underline"
        >
          Accéder à la salle de téléconsultation le jour du RDV →
        </Link>
      )}

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">
        {label}
      </span>
      <span className="font-mono-num text-sm text-ink">{value}</span>
    </div>
  );
}
