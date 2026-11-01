"use server";

import { db } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { requireParent } from "@/lib/require-parent";

/**
 * Enregistre une tentative du quiz d'évaluation rapide (4.7 Espace parent).
 * Exige une session parent authentifiée.
 */
export async function saveQuizAttempt(score: number, maxScore: number) {
  const session = await requireParent();

  const outcome = score >= 4 ? "positif" : "a_surveiller";
  const recommendation =
    outcome === "positif"
      ? "Les repères observés semblent cohérents avec le développement attendu."
      : "Certains repères ne sont pas encore observés : un avis professionnel peut rassurer et orienter.";

  await db.insert(quizAttempts).values({
    parentId: session.userId,
    score,
    maxScore,
    outcome,
    recommendation,
  });

  return { saved: true as const };
}
