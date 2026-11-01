import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey(): Uint8Array {
  const rawSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
  if (!rawSecret || rawSecret.length < 32) {
    return new TextEncoder().encode(
      "dev-insecure-secret-key-at-least-32-chars-long-do-not-use-in-prod"
    );
  }
  return new TextEncoder().encode(rawSecret);
}

const secretKey = getSecretKey();
const COOKIE_NAME = "ortho_session";

// Public auth routes that should not be intercepted by the session check
const PUBLIC_PREFIXES = [
  "/admin/connexion",
  "/espace-parent/connexion",
  "/espace-parent/inscription",
  "/espace-parent/mot-de-passe-oublie",
  "/espace-parent/reinitialiser",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept API routes, Next.js internals, or static asset files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, secretKey);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/connexion", request.url));
    }
    if (pathname.startsWith("/espace-parent")) {
      return NextResponse.redirect(new URL("/espace-parent/connexion", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-parent/:path*", "/admin/:path*"],
};
