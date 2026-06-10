"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadTranslations,
  t as translate,
  getLanguageDir,
  type SupportedLanguage,
} from "@/lib/i18n";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLanguage = "he",
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [dict, setDict] = useState<Record<string, unknown>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    loadTranslations(language).then((data) => {
      if (!cancelled) {
        setDict(data);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(dict, key, params),
    [dict]
  );

  const dir = getLanguageDir(language);
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir,
      isRtl: dir === "rtl",
      ready,
    }),
    [language, t, dir, ready]
  );

  return (
    <I18nContext.Provider value={value}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
