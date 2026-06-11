"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

const navItems = [
  {
    label: "My Workspace",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.admin, Role.manager, Role.analyst, Role.viewer],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Users, // reuse for simplicity; could import Settings icon
    roles: [Role.admin, Role.manager, Role.analyst, Role.viewer],
  },
  {
    label: "Simulation",
    href: "/simulation",
    icon: FlaskConical,
    roles: [Role.admin, Role.manager, Role.analyst],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: [Role.admin],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-[#FFCC00] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gray-900 font-bold text-sm">Y</span>
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-semibold text-sm leading-tight">Yango Deli</p>
          <p className="text-gray-400 text-xs">Promo Simulator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-[#FFCC00] text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5" />}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs text-gray-400 capitalize">{role ?? "—"}</span>
        </div>
      </div>
    </aside>
  );
}
