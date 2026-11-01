"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { signupSchema, loginSchema, firstZodError } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = await clientIp();
  const rl = await checkRateLimit(`signup:${ip}`, { max: 5, windowSeconds: 3600 });
  if (!rl.allowed) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { fullName, email, phone, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ fullName, email, phone: phone || null, passwordHash, role: "parent" })
    .returning();

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  redirect("/espace-parent");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = await clientIp();
  const rl = await checkRateLimit(`login:${ip}`, { max: 10, windowSeconds: 900 });
  if (!rl.allowed) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstZodError(parsed.error) };
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email ou mot de passe incorrect." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  redirect(user.role === "admin" ? "/admin" : "/espace-parent");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
