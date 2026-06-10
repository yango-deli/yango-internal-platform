"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/components/providers/i18n-provider";
import type { SupportedLanguage } from "@/lib/i18n";

export function Providers({
  children,
  language = "he",
}: {
  children: React.ReactNode;
  language?: SupportedLanguage;
}) {
  return (
    <SessionProvider>
      <I18nProvider initialLanguage={language}>{children}</I18nProvider>
    </SessionProvider>
  );
}
