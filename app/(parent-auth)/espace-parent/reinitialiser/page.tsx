import { Suspense } from "react";
import { ResetForm } from "./ResetForm";

export default function ReinitialiserPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-20 text-sm text-ink/50">Chargement…</div>}>
      <ResetForm />
    </Suspense>
  );
}
