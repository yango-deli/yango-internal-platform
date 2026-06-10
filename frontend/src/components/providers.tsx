"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { initI18n } from "@/lib/i18n";
import type { SupportedLanguage } from "@/types/dashboard";

interface ProvidersProps {
  children: React.ReactNode;
  initialLang?: SupportedLanguage;
}

export function Providers({ children, initialLang = "he" }: ProvidersProps) {
  useEffect(() => {
    // Initialize i18next with user's saved preference (or default)
    // LanguageSwitcher will call changeLanguage on switch and update html + localStorage
    initI18n(initialLang);

    // Also sync from localStorage if user previously chose a different lang before login
    try {
      const stored = localStorage.getItem("lang") as SupportedLanguage | null;
      if (stored && ["he", "en", "ru"].includes(stored) && stored !== initialLang) {
        // Only override if different; real source of truth after login is DB via LanguageSwitcher
        initI18n(stored);
      }
    } catch {}
  }, [initialLang]);

  return <SessionProvider>{children}</SessionProvider>;
}
