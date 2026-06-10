"use client";

import { useEffect } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import type { SupportedLanguage } from "@/lib/i18n";

export function LanguageSync({ language }: { language: SupportedLanguage }) {
  const { setLanguage } = useI18n();

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return null;
}
