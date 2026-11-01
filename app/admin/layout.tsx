import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Newspaper,
  Package,
  ShoppingCart,
  Star,
  Video,
  Users,
  FolderOpen,
  LogOut,
  Home,
  Sparkles,
} from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { logout } from "@/lib/actions/auth-actions";
import { TherapistMascot } from "@/components/CuteIllustrations";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/patients", label: "Dossiers Patients & Bilans", icon: FolderOpen },
  { href: "/admin/teleconsultations", label: "Console WebRTC", icon: Video },
  { href: "/admin/rendez-vous", label: "Agenda des RDV", icon: CalendarDays },
  { href: "/admin/commandes", label: "Commandes Boutique", icon: ShoppingCart },
  { href: "/admin/produits", label: "Gestion Boutique", icon: Package },
  { href: "/admin/parents", label: "Comptes Parents", icon: Users },
  { href: "/admin/articles", label: "Articles Blog", icon: Newspaper },
  { href: "/admin/avis", label: "Avis & Témoignages", icon: Star },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="w-full min-h-screen px-4 lg:px-8 py-6 bg-[#fbfdfa]">
      {/* Mobile Horizontal Navigation */}
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 md:hidden scrollbar-none">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-4 py-2 text-xs font-bold text-[#2d6a4f] shadow-xs hover:bg-[#d4ebd0] transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex gap-6 lg:gap-8 items-start w-full">
        {/* Real SaaS Admin Sidebar Pastel */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border-2 border-[#d4ebd0] bg-white p-4 shadow-xs">
              {/* Practitioner Brand */}
              <div className="flex items-center gap-3 px-2 py-3 border-b border-[#e2ede0] mb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e5] border border-[#d4ebd0]">
                  <TherapistMascot size={42} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2d3748] truncate">
                    Dr. Sarra Ben Ammar
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e0684b]">
                    <Sparkles className="h-3 w-3 text-[#f8a98c]" />
                    Cabinet Orthophonie
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#2d3748] hover:bg-[#e8f5e5] hover:text-[#2d6a4f] transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-[#2d6a4f]" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Public Site Link & Logout */}
              <div className="pt-3 mt-3 border-t border-[#e2ede0] space-y-1">
                <Link
                  href="/"
                  className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f4faf2] hover:text-[#2d6a4f] transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Voir le site public</span>
                </Link>

                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-[#e0684b] hover:bg-[#fff3f0] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </aside>

        {/* Real Full-Width Admin Workspace Content */}
        <div className="min-w-0 flex-1 w-full space-y-6">{children}</div>
      </div>
    </div>
  );
}
