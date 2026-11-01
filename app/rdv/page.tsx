import type { Metadata } from "next";
import { getAvailability } from "@/lib/appointments";
import { BookingForm } from "./BookingForm";
import { WaveDivider } from "@/components/Waveform";

export const metadata: Metadata = {
  title: "Prendre rendez-vous — Lisen Wa Kalem",
  description: "Réservez un créneau en ligne pour une consultation d'orthophonie.",
};

export const dynamic = "force-dynamic";

export default async function RdvPage() {
  const availability = await getAvailability();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-coral">
        Rendez-vous
      </span>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Réservez votre créneau
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
        Choisissez un jour et un horaire disponibles. Vous recevrez une
        confirmation immédiate par email et SMS.
      </p>
      <WaveDivider className="mt-8 max-w-xs" />

      <div className="mt-12 rounded-3xl border border-line bg-white p-6 md:p-10">
        <BookingForm availability={availability} />
      </div>
    </div>
  );
}
