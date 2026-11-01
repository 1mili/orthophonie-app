"use client";

import { useActionState, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { submitReview, type ReviewState } from "@/lib/actions/review-actions";

export function ReviewForm() {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    submitReview,
    {}
  );
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 text-sm text-sage-deep">
        Merci ! Votre avis a été envoyé et sera publié après modération.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-white p-6">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Votre nom</span>
        <input name="authorName" required className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Note</span>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              className={n <= rating ? "text-marigold" : "text-line"}
            >
              <Star className="h-6 w-6" fill={n <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">Votre avis</span>
        <textarea name="comment" required rows={4} className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
      </label>

      {state.error && (
        <p className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Publier mon avis
      </button>
    </form>
  );
}
