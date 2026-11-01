import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

function getSecretKey(): Uint8Array {
  const rawSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (!rawSecret || rawSecret.length < 32) {
    if (isProd) {
      throw new Error(
        "[SECURITY CRITICAL] JWT_SECRET (or AUTH_SECRET) is missing or shorter than 32 characters in production. Refusing to start."
      );
    }
    console.warn(
      "[AUTH WARNING] JWT_SECRET (or AUTH_SECRET) is missing or shorter than 32 characters. Using a development-only key. Do NOT use this in production!"
    );
    return new TextEncoder().encode(
      "dev-insecure-secret-key-at-least-32-chars-long-do-not-use-in-prod"
    );
  }

  return new TextEncoder().encode(rawSecret);
}

const secretKey = getSecretKey();
const COOKIE_NAME = "ortho_session";

export type SessionPayload = {
  userId: number;
  email: string;
  role: "parent" | "admin";
  fullName: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
