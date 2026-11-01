"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { resetPassword, type ResetState } from "@/lib/actions/password-reset-actions";

export function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    {}
  );

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nouveau mot de passe
      </h1>

      {state.success ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-sage-deep" />
          <p className="text-sm text-ink/70">Votre mot de passe a été mis à jour.</p>
          <Link href="/espace-parent/connexion" className="text-sm font-semibold text-coral">
            Se connecter →
          </Link>
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-line bg-white p-6">
          <input type="hidden" name="token" value={token} />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Nouveau mot de passe</span>
            <input name="newPassword" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Confirmer le mot de passe</span>
            <input name="confirmPassword" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
          </label>

          {state.error && (
            <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>
          )}
          {!token && (
            <p className="rounded-xl bg-marigold/10 px-4 py-3 text-sm text-marigold">
              Lien invalide : le jeton de réinitialisation est manquant.
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !token}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Réinitialiser
          </button>
        </form>
      )}
    </div>
  );
}
