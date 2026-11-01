"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { signup, type AuthState } from "@/lib/actions/auth-actions";
import { SmilingChildMascot } from "@/components/CuteIllustrations";

export default function InscriptionPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-[#fbfdfa] via-[#f4faf2] to-[#e8f5e5]/50">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d4ebd0] bg-white px-4 py-2 text-xs font-bold text-[#2d6a4f] shadow-xs hover:bg-[#e8f5e5] transition"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour au site public
      </Link>

      <div className="w-full max-w-md rounded-[2.5rem] border-2 border-[#d4ebd0] bg-white p-8 shadow-sm">
        <div className="text-center flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8f5e5] border-2 border-[#d4ebd0] p-2">
            <SmilingChildMascot size={52} />
          </div>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#d4ebd0] px-3 py-0.5 text-xs font-bold text-[#2d6a4f]">
            <Sparkles className="h-3 w-3" /> Nouveau Compte
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#2d3748]">
            Créer un Espace Famille
          </h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Suivez les progrès de vos enfants et accédez aux bilans et jeux recommandés
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              Nom complet du parent
            </span>
            <input
              name="fullName"
              required
              placeholder="Ex: Myriam Trabelsi"
              className="mt-1.5 w-full rounded-2xl border-2 border-[#e2ede0] px-4 py-2.5 text-xs text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="parent@exemple.com"
              className="mt-1.5 w-full rounded-2xl border-2 border-[#e2ede0] px-4 py-2.5 text-xs text-[#2d3748] focus:border-[#2d6a4f] focus:outline-hidden"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
              Numéro de téléphone
            </span>
            <input
              name="phone"
              type="tel"
              placeholder="+216 00 000 000"
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
              minLength={6}
              placeholder="Au moins 6 caractères"
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f8a98c] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer mon compte parent
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748b]">
          Déjà inscrit ?{" "}
          <Link
            href="/espace-parent/connexion"
            className="font-bold text-[#2d6a4f] hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
