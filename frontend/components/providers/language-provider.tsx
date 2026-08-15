"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { LANGUAGE_STORAGE_KEY, languageOptions, translations } from "@/lib/i18n/translations";
import type { Language, TranslationKeys } from "@/lib/i18n/types";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationKeys;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("hinglish");

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (saved && languageOptions.some((o) => o.value === saved)) {
      setLanguageState(saved);
      document.documentElement.lang = saved === "hi" ? "hi" : "en";
    }
  }, []);

  function setLanguage(next: Language) {
    setLanguageState(next);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    document.documentElement.lang = next === "hi" ? "hi" : "en";
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
