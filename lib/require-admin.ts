import { redirect } from "next/navigation";
import { getSession } from "./auth";

/**
 * Strict role guard for Admin / Orthophoniste space.
 *
 * Routing logic:
 *  • Not logged in          → /admin/connexion   (dedicated admin login)
 *  • Logged in as "parent"  → /espace-parent     (wrong role, bounce back)
 *  • Logged in as "admin"   → allowed ✓
 *
 * To access /admin during development:
 *  1. Go to /admin/connexion and log in with your admin credentials.
 *  2. Or use the seed script: `npx tsx scripts/seed.ts` after setting ADMIN_EMAIL and ADMIN_PASSWORD.
 */
export async function requireAdmin() {
  const session = await getSession();

  // Not authenticated → send to the dedicated ADMIN login page (not parent login)
  if (!session) {
    redirect("/admin/connexion");
  }

  // Wrong role: a parent tried to reach /admin → bounce to their own space
  if (session.role !== "admin") {
    redirect("/espace-parent");
  }

  return session;
}
