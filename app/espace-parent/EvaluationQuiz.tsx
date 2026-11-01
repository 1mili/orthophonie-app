"use client";

import { useState } from "react";
import Link from "next/link";
import { saveQuizAttempt } from "./quiz-actions";

const QUESTIONS = [
  "Mon enfant combine au moins 2 mots ensemble.",
  "Mon enfant est compris par des personnes extérieures à la famille.",
  "Mon enfant pose des questions (quoi, où, qui...).",
  "Mon enfant ne répète pas de manière excessive les sons ou les mots.",
  "Mon enfant montre de l'intérêt à écouter des histoires.",
];

export function EvaluationQuiz() {
  const [answers, setAnswers] = useState<boolean[]>(Array(QUESTIONS.length).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const score = answers.filter(Boolean).length;

  function toggle(i: number) {
    setAnswers((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  if (submitted) {
    const positive = score >= 4;
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="font-mono-num text-3xl font-semibold text-coral">
          {score}/{QUESTIONS.length}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {positive
            ? "Les repères observés semblent cohérents avec le développement attendu. Continuez à stimuler le langage au quotidien !"
            : "Certains repères ne sont pas encore observés. Cela ne veut pas dire qu'il y a un trouble, mais un avis professionnel peut rassurer et orienter."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/rdv"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Prendre rendez-vous
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers(Array(QUESTIONS.length).fill(false));
            }}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/30"
          >
            Refaire le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <ul className="space-y-3">
        {QUESTIONS.map((q, i) => (
          <li key={q}>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/75">
              <input
                type="checkbox"
                checked={answers[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 h-4 w-4 accent-coral"
              />
              {q}
            </label>
          </li>
        ))}
      </ul>
      <button
        onClick={async () => {
          setIsSaving(true);
          await saveQuizAttempt(score, QUESTIONS.length);
          setSubmitted(true);
          setIsSaving(false);
        }}
        disabled={isSaving}
        className="mt-5 rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Enregistrement…" : "Voir mon résultat"}
      </button>
    </div>
  );
}
