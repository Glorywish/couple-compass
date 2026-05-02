import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { locales, detectLocale } from "@/locales";
import type { LocaleCode, LocaleData } from "@/locales/types";

interface I18nContextValue {
  locale: LocaleCode;
  data: LocaleData;
  setLocale: (code: LocaleCode) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => detectLocale());

  const setLocale = (code: LocaleCode) => {
    setLocaleState(code);
    localStorage.setItem("locale", code);
  };

  useEffect(() => {
    const data = locales[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = data.meta.dir;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, data: locales[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
