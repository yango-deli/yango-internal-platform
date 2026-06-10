"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { changeLanguage } from "@/lib/i18n";
import type { SupportedLanguage } from "@/types/dashboard";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

const LANGS: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: "he", label: "HE", flag: "🇮🇱" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
];

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = true, className }: LanguageSwitcherProps) {
  const { t } = useTranslation("common");
  const [current, setCurrent] = useState<SupportedLanguage>(() => {
    if (typeof document !== "undefined") {
      const dir = document.documentElement.getAttribute("dir");
      const lang = document.documentElement.getAttribute("lang") as SupportedLanguage;
      if (lang && ["he", "en", "ru"].includes(lang)) return lang;
      return dir === "rtl" ? "he" : "en";
    }
    return "he";
  });
  const [loading, setLoading] = useState(false);

  async function handleSwitch(lang: SupportedLanguage) {
    if (lang === current || loading) return;

    setLoading(true);
    try {
      // 1. Persist to DB (user settings)
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });

      if (!res.ok) {
        throw new Error("Failed to save language preference");
      }

      // 2. Update i18next + html dir immediately (no reload)
      changeLanguage(lang);
      setCurrent(lang);

      // 3. Toast (translated)
      toast.success(t("settings.languageSaved") || "Language preference saved");
    } catch (e) {
      console.error(e);
      toast.error(t("errors.generic") || "Something went wrong");
      // Still apply locally so UI feels responsive
      changeLanguage(lang);
      setCurrent(lang);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm",
        compact ? "text-xs" : "text-sm",
        className
      )}
      dir="ltr" // keep switcher LTR even in Hebrew UI
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => handleSwitch(l.code)}
          disabled={loading}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-all active:scale-[0.985]",
            current === l.code
              ? "bg-[#FFCC00] text-gray-900 shadow"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
            loading && "opacity-60 cursor-not-allowed"
          )}
          aria-label={t(`language.${l.code}`) || l.label}
          title={t(`language.${l.code}`) || l.label}
        >
          <span>{l.flag}</span>
          <span className="font-semibold tracking-wide">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
