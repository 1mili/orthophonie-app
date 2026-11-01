import nodemailer from "nodemailer";

/**
 * Notification layer for confirmations (RDV) and reminders.
 *
 * In this sandboxed dev environment there is no network access to real
 * SMTP/Twilio endpoints, so calls degrade gracefully: if credentials are
 * missing or the network call fails, we log what *would* have been sent
 * instead of throwing — booking must never fail because a notification did.
 *
 * To go live: fill SMTP_* and TWILIO_* in .env.local (see .env.example).
 */

const isConfigured = (...vars: (string | undefined)[]) =>
  vars.every((v) => v && !v.includes("replace_me"));

export async function sendConfirmationEmail(params: {
  to: string;
  parentName: string;
  date: string;
  time: string;
  service: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (!isConfigured(SMTP_HOST, SMTP_USER, SMTP_PASSWORD)) {
    console.log(
      `[email:mock] Confirmation RDV → ${params.to} — ${params.date} ${params.time} (${params.service})`
    );
    return { sent: false, reason: "SMTP not configured (dev mode)" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Lisen Wa Kalem" <${SMTP_USER}>`,
      to: params.to,
      subject: "Confirmation de votre rendez-vous",
      text: `Bonjour ${params.parentName},\n\nVotre rendez-vous du ${params.date} à ${params.time} (${params.service}) est confirmé.\n\nÀ bientôt.`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email:error]", err);
    return { sent: false, reason: "send failed" };
  }
}

export async function sendPasswordResetEmail(params: { to: string; token: string }) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/espace-parent/reinitialiser?token=${params.token}`;

  if (!isConfigured(SMTP_HOST, SMTP_USER, SMTP_PASSWORD)) {
    console.log(`[email:mock] Réinitialisation mot de passe → ${params.to} — ${resetUrl}`);
    return { sent: false, reason: "SMTP not configured (dev mode)" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
    await transporter.sendMail({
      from: `"Lisen Wa Kalem" <${SMTP_USER}>`,
      to: params.to,
      subject: "Réinitialisation de votre mot de passe",
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe (valable 1h) :\n\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email:error]", err);
    return { sent: false, reason: "send failed" };
  }
}

export async function sendConfirmationSms(params: {
  to: string;
  date: string;
  time: string;
}) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (!isConfigured(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)) {
    console.log(
      `[sms:mock] RDV confirmé → ${params.to} — ${params.date} ${params.time}`
    );
    return { sent: false, reason: "Twilio not configured (dev mode)" };
  }

  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: TWILIO_FROM_NUMBER,
      to: params.to,
      body: `Votre RDV du ${params.date} à ${params.time} est confirmé. — Lisen Wa Kalem`,
    });
    return { sent: true };
  } catch (err) {
    console.error("[sms:error]", err);
    return { sent: false, reason: "send failed" };
  }
}
