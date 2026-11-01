import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Clock, Video } from "lucide-react";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";
import { getTeleconsultationWindowStatus } from "@/lib/teleconsultation-window";
import { VideoRoom } from "./VideoRoom";
import { Waveform } from "@/components/Waveform";

export const dynamic = "force-dynamic";

export default async function TeleconsultationPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;

  // Verify room access and ownership
  const access = await assertRoomAccess(roomCode, { allowEnded: true });

  if (!access.ok) {
    // If not authenticated, redirect to appropriate login
    if (access.response.status === 401) {
      redirect("/espace-parent/connexion");
    }
    if (access.response.status === 404) {
      notFound();
    }

    // 403 Forbidden
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff3f0] border-2 border-[#fcd5ce] text-[#e0684b] mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#2d3748]">
          Accès refusé à cette consultation
        </h1>
        <p className="mt-2 max-w-md text-xs text-[#64748b]">
          Vous n&apos;avez pas les droits d&apos;accès à cette salle de téléconsultation.
        </p>
        <Link
          href="/espace-parent"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2d6a4f] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1b4332] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;espace parent
        </Link>
      </div>
    );
  }

  // If consultation is completed or cancelled, show ended message
  if (access.consultation.status === "completed" || access.consultation.status === "cancelled") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 border-2 border-gray-300 text-gray-500 mb-4">
          <Video className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#2d3748]">
          Séance terminée · Salle fermée
        </h1>
        <p className="mt-2 max-w-md text-xs text-[#64748b]">
          Cette téléconsultation est close et n&apos;est plus active.
        </p>
        <Link
          href={access.session.role === "admin" ? "/admin/teleconsultations" : "/espace-parent/teleconsultations"}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2d6a4f] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1b4332] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
      </div>
    );
  }

  // Requirement 3.3: Server-side time window enforcement for parents
  if (access.session.role === "parent") {
    const windowStatus = getTeleconsultationWindowStatus(
      access.appointment.date,
      access.appointment.time,
      access.consultation.status,
      access.appointment.mode
    );

    if (!windowStatus.joinable) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f0f9ff] border-2 border-[#bae6fd] text-[#0284c7] mb-4">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2d3748]">
            Salle non accessible actuellement
          </h1>
          <p className="mt-2 max-w-md text-xs text-[#64748b]">
            Cette séance est programmée le{" "}
            <span className="font-bold text-[#2d3748]">
              {access.appointment.date} à {access.appointment.time}
            </span>
            .<br />
            {windowStatus.labelFr}.
          </p>
          <Link
            href="/espace-parent/teleconsultations"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2d6a4f] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1b4332] transition"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à mes téléconsultations
          </Link>
        </div>
      );
    }
  }

  // Requirement 2.3: parent never reads clinical notes
  const initialNotes =
    access.session.role === "admin" ? (access.consultation.notes ?? "") : "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center gap-3">
        <Waveform animated className="h-5" />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Salle de téléconsultation
          </h1>
          <p className="text-xs text-ink/50">
            Connecté en tant que {access.role === "orthophoniste" ? "orthophoniste" : "parent"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <VideoRoom
          roomCode={roomCode}
          role={access.role}
          initialNotes={initialNotes}
        />
      </div>
    </div>
  );
}
