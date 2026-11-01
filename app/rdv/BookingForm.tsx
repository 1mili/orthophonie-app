"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { bookAppointment, type BookingState } from "./actions";
import type { DaySlots } from "@/lib/appointments";
import { services } from "@/data/content";

const initialState: BookingState = {};

export function BookingForm({ availability }: { availability: DaySlots[] }) {
  const [state, formAction, pending] = useActionState(
    bookAppointment,
    initialState
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    availability[0]?.date ?? null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const activeDay = availability.find((d) => d.date === selectedDate);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h2 className="font-display text-lg font-semibold">
          1. Choisissez un créneau
        </h2>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {availability.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedTime(null);
              }}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition ${
                selectedDate === day.date
                  ? "border-coral bg-coral text-white"
                  : "border-line bg-white text-ink/70 hover:border-ink/30"
              }`}
            >
              <span className="text-[11px] font-medium uppercase">
                {day.weekdayLabel}
              </span>
              <span className="mt-1 font-mono-num text-lg font-semibold">
                {day.dayNumber}
              </span>
              <span className="text-[11px]">{day.monthLabel}</span>
            </button>
          ))}
        </div>

        <h3 className="mt-8 text-sm font-semibold text-ink/70">
          Horaires disponibles
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {activeDay?.slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => setSelectedTime(slot.time)}
              className={`rounded-xl border px-3 py-2.5 font-mono-num text-sm transition ${
                !slot.available
                  ? "cursor-not-allowed border-line bg-paper text-ink/30 line-through"
                  : selectedTime === slot.time
                  ? "border-sage bg-sage text-white"
                  : "border-line bg-white text-ink/80 hover:border-sage"
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>

        <input type="hidden" name="date" value={selectedDate ?? ""} />
        <input type="hidden" name="time" value={selectedTime ?? ""} />
      </div>

      <div className="lg:col-span-5">
        <h2 className="font-display text-lg font-semibold">
          2. Vos coordonnées
        </h2>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Type de consultation
            </span>
            <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-3 text-sm has-[:checked]:border-coral has-[:checked]:bg-coral/5">
                <input type="radio" name="mode" value="cabinet" defaultChecked className="h-4 w-4 accent-coral" />
                Au cabinet
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line px-3 py-3 text-sm has-[:checked]:border-coral has-[:checked]:bg-coral/5">
                <input type="radio" name="mode" value="teleconsultation" className="h-4 w-4 accent-coral" />
                Téléconsultation
              </label>
            </div>
          </label>

          <Field label="Votre nom" name="parentName" required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom de l'enfant" name="childName" required />
            <Field label="Âge de l'enfant" name="childAge" placeholder="ex: 5 ans" />
          </div>
          <Field label="Téléphone" name="phone" type="tel" required />
          <Field label="Email" name="email" type="email" required />

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Motif de consultation
            </span>
            <select
              name="service"
              required
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-coral"
            >
              <option value="" disabled>
                Sélectionnez un service
              </option>
              {services.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
              Notes (facultatif)
            </span>
            <textarea
              name="notes"
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-coral"
              placeholder="Précisions utiles pour la consultation…"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 text-sm has-[:checked]:border-sage has-[:checked]:bg-sage/5">
            <input type="checkbox" name="prepay" value="true" className="mt-0.5 h-4 w-4 shrink-0 accent-sage" />
            <span className="leading-relaxed text-ink/80">
              Payer un acompte en ligne (optionnel) — 20 DT, déductible du prix de la séance
            </span>
          </label>

        </div>

        {state.error && (
          <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !selectedDate || !selectedTime}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirmer le rendez-vous
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink/50">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-coral"
      />
    </label>
  );
}
