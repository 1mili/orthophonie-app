"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { login, type AuthState } from "@/lib/actions/auth-actions";
import { TherapistMascot } from "@/components/CuteIllustrations";

export default function AdminConnexionClient() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    {}
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#fbfdfa] via-[#e8f5e5]/30 to-[#f0f9ff]/40">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d4ebd0] bg-white px-4 py-2 text-xs font-bold text-[#2d6a4f] shadow-xs hover:bg-[#e8f5e5] transition"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour au site public
      </Link>

      <div className="w-full max-w-md rounded-[2.5rem] border-2 border-[#d4ebd0] bg-white p-8 shadow-sm">
        <div className="text-center flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f5e5] border-2 border-[#d4ebd0] p-2">
            <TherapistMascot size={52} />
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e5] px-3 py-0.5 text-xs font-bold text-[#2d6a4f]">
            <Shield className="h-3 w-3" /> Espace Orthophoniste
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#2d3748]">
            Connexion Praticien
          </h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Accédez à votre tableau de bord, patients, téléconsultations et facturation
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              Adresse Email Professionnelle
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="praticien@lisenwakalem.tn"
              className="mt-1.5 w-full rounded-2xl border-2 border-[#e2ede0] px-4 py-2.5 text-xs text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              Mot de passe
            </span>
            <input
              name="password"
              type="password"
              required
              className="mt-1.5 w-full rounded-2xl border-2 border-[#e2ede0] px-4 py-2.5 text-xs text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
            />
          </label>

          {state.error && (
            <p className="rounded-2xl bg-[#fff3f0] border border-[#fcd5ce] px-4 py-3 text-xs font-bold text-[#e0684b]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2d6a4f] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#2d6a4f]/30 hover:bg-[#1b4332] active:scale-95 transition disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Accéder au Dashboard Praticien
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#e2ede0] text-center space-y-2">
          <p className="text-xs text-[#64748b]">
            Vous êtes un parent ?{" "}
            <Link
              href="/espace-parent/connexion"
              className="font-bold text-[#e0684b] hover:underline"
            >
              Espace Parent →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
