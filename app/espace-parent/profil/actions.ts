"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, children, appointments, orders } from "@/lib/db/schema";
import { verifyPassword, hashPassword, destroySession, createSession } from "@/lib/auth";
import { requireParent } from "@/lib/require-parent";
import {
  profileSchema,
  passwordChangeSchema,
  childSchema,
  firstZodError,
} from "@/lib/validation";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await requireParent();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  await db
    .update(users)
    .set({ fullName: parsed.data.fullName, phone: parsed.data.phone || null })
    .where(eq(users.id, session.userId));

  // Bug 3.6: Update JWT session cookie so the session immediately reflects the new name
  await createSession({
    userId: session.userId,
    email: session.email,
    role: session.role,
    fullName: parsed.data.fullName,
  });

  revalidatePath("/espace-parent/profil");
  revalidatePath("/espace-parent");
  return { success: true };
}

export async function changePassword(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await requireParent();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.userId));

  return { success: true };
}

export async function addChild(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await requireParent();
  if (session.role === "admin") {
    return { error: "Action non autorisée pour un administrateur." };
  }

  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  await db.insert(children).values({
    parentId: session.userId,
    name: parsed.data.name,
    age: parsed.data.age || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/espace-parent/profil");
  revalidatePath("/espace-parent");
  return { success: true };
}

export async function deleteChild(formData: FormData) {
  const session = await requireParent();

  const id = Number(formData.get("id"));
  if (!id || isNaN(id)) return;

  await db.delete(children).where(and(eq(children.id, id), eq(children.parentId, session.userId)));
  revalidatePath("/espace-parent/profil");
  revalidatePath("/espace-parent");
}

/** RGPD: export all personal data as a downloadable JSON blob. */
export async function exportMyData() {
  const session = await requireParent();

  const [user, myChildren, myAppointments, myOrders] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, session.userId) }),
    db.select().from(children).where(eq(children.parentId, session.userId)),
    db.select().from(appointments).where(eq(appointments.parentId, session.userId)),
    db.select().from(orders).where(eq(orders.parentId, session.userId)),
  ]);

  return {
    profile: user ? { fullName: user.fullName, email: user.email, phone: user.phone, createdAt: user.createdAt } : null,
    children: myChildren,
    appointments: myAppointments,
    orders: myOrders,
  };
}

/** RGPD: permanently delete the account and all associated personal data. */
export async function deleteMyAccount() {
  const session = await requireParent();
  if (session.role === "admin") {
    throw new Error("Un compte administrateur ne peut pas être supprimé via cet espace.");
  }

  // children cascade on delete via FK; appointments/orders keep history but
  // detach the parent reference (anonymized) rather than deleting business records.
  await db.update(appointments).set({ parentId: null }).where(eq(appointments.parentId, session.userId));
  await db.update(orders).set({ parentId: null }).where(eq(orders.parentId, session.userId));
  await db.delete(users).where(eq(users.id, session.userId));

  await destroySession();
  redirect("/");
}
