"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.admin, Role.manager, Role.analyst, Role.viewer],
  },
  {
    label: "Simulation",
    href: "/simulation",
    icon: FlaskConical,
    roles: [Role.admin, Role.manager, Role.analyst],
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: UserPlus,
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
    <aside className="flex flex-col w-64 min-h-screen bg-[#0F1115] border-e border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-brand-glow">
          <Image
            src="/brand/logo-yellow-button.png"
            alt="Yango Deli"
            width={36}
            height={36}
            className="h-9 w-9 object-cover"
            priority
          />
        </div>
        <div className="overflow-hidden">
          <p className="text-white font-display font-bold text-[15px] leading-tight tracking-tight">
            Yango Deli
          </p>
          <p className="text-gray-500 text-xs">Internal Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Workspace
        </p>
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-[#FFCC00] text-gray-900 shadow-brand-glow"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] flex-shrink-0", !active && "group-hover:scale-110 transition-transform")} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4 rtl:rotate-180" />}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="m-3 rounded-2xl bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-300 capitalize truncate">{role ?? "—"}</p>
            <p className="text-[10px] text-gray-500">Signed in</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
