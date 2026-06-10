"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useI18nTranslation } from "react-i18next";

import commonEn from "../../public/locales/en/common.json";
import commonHe from "../../public/locales/he/common.json";
import commonRu from "../../public/locales/ru/common.json";

import dashboardEn from "../../public/locales/en/dashboard.json";
import dashboardHe from "../../public/locales/he/dashboard.json";
import dashboardRu from "../../public/locales/ru/dashboard.json";

import type { SupportedLanguage } from "@/types/dashboard";

const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
  },
  he: {
    common: commonHe,
    dashboard: dashboardHe,
  },
  ru: {
    common: commonRu,
    dashboard: dashboardRu,
  },
};

let initialized = false;

export function initI18n(initialLang: SupportedLanguage = "he") {
  if (initialized) {
    if (i18next.language !== initialLang) {
      i18next.changeLanguage(initialLang);
      updateDocumentDir(initialLang);
    }
    return i18next;
  }

  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: "he",
      defaultNS: "common",
      ns: ["common", "dashboard"],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  initialized = true;
  updateDocumentDir(initialLang);
  return i18next;
}

export function updateDocumentDir(lang: SupportedLanguage) {
  if (typeof document === "undefined") return;
  const dir = lang === "he" ? "rtl" : "ltr";
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", dir);
}

export function changeLanguage(lang: SupportedLanguage) {
  if (!initialized) initI18n(lang);
  i18next.changeLanguage(lang);
  updateDocumentDir(lang);

  // Persist to localStorage as fallback
  try {
    localStorage.setItem("lang", lang);
  } catch {}
}

export function getCurrentLanguage(): SupportedLanguage {
  const lng = (i18next.language || "he").split("-")[0] as SupportedLanguage;
  return ["he", "en", "ru"].includes(lng) ? lng : "he";
}

// Convenience hook that defaults to "dashboard" namespace when needed
export function useTranslation(ns?: "common" | "dashboard" | ("common" | "dashboard")[]) {
  return useI18nTranslation(ns);
}

// Helper for simple interpolation without full i18next in some utils
export function t(key: string, options?: Record<string, string | number>): string {
  return i18next.t(key, options as any) as string;
}

// Format relative time using translations + Intl
export function formatRelativeTime(date: Date | string, lang: SupportedLanguage): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t("common:relativeTime.justNow");
  if (diffMin < 60) return t("common:relativeTime.minutesAgo", { count: diffMin });
  if (diffHr < 24) return t("common:relativeTime.hoursAgo", { count: diffHr });
  if (diffDay === 1) return t("common:relativeTime.yesterday");
  if (diffDay < 7) return t("common:relativeTime.daysAgo", { count: diffDay });

  // Fallback to locale date
  const locale = lang === "he" ? "he-IL" : lang === "ru" ? "ru-RU" : "en-GB";
  return d.toLocaleDateString(locale);
}

// Format the page header date per locale
export function formatLocaleDate(date: Date, lang: SupportedLanguage): string {
  const locale = lang === "he" ? "he-IL" : lang === "ru" ? "ru-RU" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Get time-of-day translated greeting
export function getTimeOfDayGreeting(lang: SupportedLanguage): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("common:greetings.morning");
  if (hour < 17) return t("common:greetings.afternoon");
  return t("common:greetings.evening");
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["he", "en", "ru"];
