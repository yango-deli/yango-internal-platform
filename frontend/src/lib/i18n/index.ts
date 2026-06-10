export type SupportedLanguage = "he" | "en" | "ru";

export const SUPPORTED_LANGUAGES: {
  code: SupportedLanguage;
  label: string;
  dir: "ltr" | "rtl";
}[] = [
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
];

type TranslationDict = Record<string, unknown>;

const cache: Partial<Record<SupportedLanguage, TranslationDict>> = {};

export async function loadTranslations(
  lang: SupportedLanguage,
  namespace = "recruitment"
): Promise<TranslationDict> {
  if (cache[lang]) return cache[lang]!;
  const res = await fetch(`/locales/${lang}/${namespace}.json`);
  const data = (await res.json()) as TranslationDict;
  cache[lang] = data;
  return data;
}

export function t(
  dict: TranslationDict,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof current !== "string") return key;
  if (!params) return current;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
    current
  );
}

export function getLanguageDir(lang: SupportedLanguage): "ltr" | "rtl" {
  return lang === "he" ? "rtl" : "ltr";
}
