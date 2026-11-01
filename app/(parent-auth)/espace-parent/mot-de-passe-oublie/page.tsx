"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { requestPasswordReset, type ResetState } from "@/lib/actions/password-reset-actions";

export default function MotDePasseOubliePage() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Mot de passe oublié
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Indiquez votre email, nous vous enverrons un lien de réinitialisation.
      </p>

      {state.success ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-8 text-center">
          <MailCheck className="h-8 w-8 text-sage-deep" />
          <p className="text-sm text-ink/70">
            Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
          </p>
        </div>
      ) : (
        <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-line bg-white p-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Email</span>
            <input name="email" type="email" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
          </label>

          {state.error && (
            <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer le lien
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-ink/60">
        <Link href="/espace-parent/connexion" className="font-semibold text-coral">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
