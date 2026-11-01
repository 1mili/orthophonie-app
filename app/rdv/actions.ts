"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { saveAppointment, getAvailability } from "@/lib/appointments";
import { getSession } from "@/lib/auth";
import { sendConfirmationEmail, sendConfirmationSms } from "@/lib/notifications";
import { db } from "@/lib/db";
import { consultations } from "@/lib/db/schema";
import { bookingSchema, firstZodError } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { stripe, stripeConfigured } from "@/lib/stripe";

const DEPOSIT_CENTS = 2000; // 20 DT

export type BookingState = {
  error?: string;
};

export async function bookAppointment(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`rdv:${ip}`, { max: 8, windowSeconds: 3600 });
  if (!rl.allowed) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const parsed = bookingSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    parentName: formData.get("parentName"),
    childName: formData.get("childName"),
    childAge: formData.get("childAge"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    service: formData.get("service"),
    notes: formData.get("notes"),
    mode: formData.get("mode") || "cabinet",
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { date, time, parentName, childName, childAge, phone, email, service, notes, mode } =
    parsed.data;

  const availability = await getAvailability();
  const day = availability.find((d) => d.date === date);
  const slot = day?.slots.find((s) => s.time === time);
  if (!day || !slot || !slot.available) {
    return { error: "Ce créneau vient d'être réservé. Merci d'en choisir un autre." };
  }

  const session = await getSession();

  const appointment = await saveAppointment({
    parentId: session?.userId,
    date,
    time,
    parentName,
    childName,
    childAge: childAge || undefined,
    phone,
    email,
    service,
    notes: notes || undefined,
    mode,
  });

  let roomCode: string | undefined;
  if (mode === "teleconsultation") {
    const code = crypto.randomUUID();
    await db.insert(consultations).values({
      appointmentId: appointment.id,
      roomCode: code,
    });
    roomCode = code;
  }

  await Promise.all([
    sendConfirmationEmail({ to: email, parentName, date, time, service }),
    sendConfirmationSms({ to: phone, date, time }),
  ]);

  const wantsPrepay = formData.get("prepay") === "true";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (wantsPrepay && stripeConfigured && stripe) {
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `Acompte RDV — ${service}` },
              unit_amount: DEPOSIT_CENTS,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/rdv/confirmation?id=${appointment.id}&date=${date}&time=${time}&service=${encodeURIComponent(service)}${roomCode ? `&room=${roomCode}` : ""}&paid=1`,
        cancel_url: `${baseUrl}/rdv/confirmation?id=${appointment.id}&date=${date}&time=${time}&service=${encodeURIComponent(service)}${roomCode ? `&room=${roomCode}` : ""}`,
        metadata: { appointmentId: String(appointment.id) },
      });
      if (checkoutSession.url) {
        redirect(checkoutSession.url);
      }
    } catch (err) {
      console.error("[stripe:rdv-deposit:error]", err);
      // fall through to the normal confirmation page below
    }
  } else if (wantsPrepay) {
    console.log("[stripe:mock] Mode simulation acompte RDV #" + appointment.id);
  }

  redirect(
    `/rdv/confirmation?id=${appointment.id}&date=${date}&time=${time}&service=${encodeURIComponent(
      service
    )}${roomCode ? `&room=${roomCode}` : ""}`
  );
}
