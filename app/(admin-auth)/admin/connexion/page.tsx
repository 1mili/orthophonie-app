import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminConnexionClient from "./AdminConnexionClient";

export const dynamic = "force-dynamic";

export default async function AdminConnexionPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }

  return <AdminConnexionClient />;
}
