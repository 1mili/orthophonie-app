import { redirect } from "next/navigation";
import { getSession } from "./auth";

/**
 * Strict role guard for Espace Parent.
 * - If not logged in -> redirect to login
 * - If logged in as admin/praticien -> redirect to /admin (STRICT SEPARATION)
 */
export async function requireParent() {
  const session = await getSession();
  if (!session) {
    redirect("/espace-parent/connexion");
  }
  if (session.role === "admin") {
    redirect("/admin");
  }
  return session;
}
