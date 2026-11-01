"use server";

import { nanoid } from "nanoid";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResets } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { forgotPasswordSchema, resetPasswordSchema, firstZodError } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/notifications";

export type ResetState = { error?: string; success?: boolean };

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { email } = parsed.data;

  const rl = await checkRateLimit(`reset-request:${email}`, { max: 3, windowSeconds: 3600 });
  if (!rl.allowed) {
    return { error: `Trop de demandes. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  // Always respond with success (don't reveal whether the email exists)
  if (user) {
    const token = nanoid(40);
    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
    });
    await sendPasswordResetEmail({ to: user.email, token });
  }

  return { success: true };
}

export async function resetPassword(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { token, newPassword } = parsed.data;

  const record = await db.query.passwordResets.findFirst({
    where: and(
      eq(passwordResets.token, token),
      isNull(passwordResets.usedAt),
      gt(passwordResets.expiresAt, new Date())
    ),
  });

  if (!record) {
    return { error: "Ce lien de réinitialisation est invalide ou expiré." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, record.id));

  return { success: true };
}
