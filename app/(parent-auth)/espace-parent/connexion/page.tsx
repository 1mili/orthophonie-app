import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ConnexionClient from "./ConnexionClient";

export const dynamic = "force-dynamic";

export default async function ConnexionPage() {
  const session = await getSession();
  if (session?.role === "parent") {
    redirect("/espace-parent");
  }
  if (session?.role === "admin") {
    redirect("/admin");
  }

  return <ConnexionClient />;
}
