"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

function getTitleFromPath(pathname: string): string {
  if (pathname.startsWith("/simulation")) return "Simulation Tool";
  if (pathname.startsWith("/recruitment/import")) return "Recruitment Import";
  if (pathname.startsWith("/recruitment/stats")) return "Recruitment Statistics";
  if (pathname.startsWith("/recruitment")) return "Recruitment";
  if (pathname.startsWith("/users")) return "User Management";
  return "Dashboard";
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <h1 className="font-display text-lg font-semibold tracking-tight text-gray-900">{title}</h1>

      <div className="flex items-center gap-1">
      <LanguageSwitcher />
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 bg-[#FFCC00] rounded-full flex items-center justify-center">
            <span className="text-gray-900 text-xs font-bold">{initials}</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-gray-900 leading-tight truncate max-w-[150px]">
              {session?.user?.name ?? session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 leading-tight truncate max-w-[150px]">
              {session?.user?.email}
            </p>
          </div>
          <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute end-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFCC00] text-gray-900 capitalize">
                {session?.user?.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
