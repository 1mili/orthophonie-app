"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMyAccount } from "./actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 rounded-full border border-coral/40 px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral/5"
      >
        <Trash2 className="h-4 w-4" /> Supprimer mon compte
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-coral/40 bg-coral/5 p-4">
      <p className="text-sm text-coral">
        Cette action est irréversible : votre compte et vos données personnelles
        seront définitivement supprimés. Confirmez-vous ?
      </p>
      <div className="mt-3 flex gap-3">
        <form action={deleteMyAccount}>
          <button className="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-white">
            Oui, supprimer définitivement
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink/60"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
