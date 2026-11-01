"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile, changePassword, type ProfileState } from "./actions";

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Email</span>
        <input value={email} disabled className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-line bg-paper-warm px-3 py-2.5 text-sm text-ink/50" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Nom complet</span>
        <input name="fullName" defaultValue={fullName} required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Téléphone</span>
        <input name="phone" defaultValue={phone} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>

      {state.error && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage-deep">Profil mis à jour.</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    changePassword,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Mot de passe actuel</span>
        <input name="currentPassword" type="password" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Nouveau mot de passe</span>
        <input name="newPassword" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Confirmer</span>
        <input name="confirmPassword" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>

      {state.error && <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage-deep">Mot de passe modifié.</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Changer le mot de passe
      </button>
    </form>
  );
}
