import type { Metadata } from "next";
import { getLocale } from "@/lib/locale-actions";
import { getSession } from "@/lib/auth";
import { TeleconsultationClient } from "./TeleconsultationClient";

export const metadata: Metadata = {
  title: "Téléconsultation orthophonique — Lisen Wa Kalem",
  description:
    "Salle de téléconsultation orthophonique sécurisée : visioconférence WebRTC, vérification micro/caméra, partage d'exercices et chat en direct.",
};

export const dynamic = "force-dynamic";

export default async function TeleconsultationRootPage() {
  const [locale, session] = await Promise.all([
    getLocale(),
    getSession(),
  ]);

  const initialRole = session?.role === "admin" ? "orthophoniste" : "parent";
  const userFullName = session?.fullName ?? (initialRole === "orthophoniste" ? "Mme Sarra Ben Ammar" : "Parent");

  return (
    <TeleconsultationClient
      locale={locale}
      initialRole={initialRole}
      userFullName={userFullName}
    />
  );
}
