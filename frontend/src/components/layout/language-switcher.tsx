"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  async function choose(code: SupportedLanguage) {
    setOpen(false);
    if (code === language) return;
    setLanguage(code);
    try {
      await fetch("/api/settings/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: code }),
      });
    } catch {
      // Non-blocking: UI already switched; persistence will retry on next change.
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{current?.code}</span>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1.5 w-40 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                l.code === language ? "text-gray-900 font-medium" : "text-gray-600"
              )}
            >
              <span>{l.label}</span>
              {l.code === language && <Check className="h-4 w-4 text-[#E6B800]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
