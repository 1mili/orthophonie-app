"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface PublicLayoutWrapperProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function PublicLayoutWrapper({
  header,
  children,
  footer,
}: PublicLayoutWrapperProps) {
  const pathname = usePathname();

  // Strict separation: Dashboard spaces (Espace Parent & Espace Orthophoniste / Admin)
  // as well as Teleconsultation video rooms do NOT render the public vitrine header/footer.
  const isDashboardOrApp =
    pathname?.startsWith("/espace-parent") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/teleconsultation");

  if (isDashboardOrApp) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col w-full">
      {header}
      <main className="flex-1 w-full">{children}</main>
      {footer}
    </div>
  );
}
