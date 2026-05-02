import type { LocaleCode, LocaleData } from "./types";
import en from "./en";
import ar from "./ar";
import fr from "./fr";
import es from "./es";
import zh from "./zh";

export const locales: Record<LocaleCode, LocaleData> = { en, ar, fr, es, zh };

export function detectLocale(): LocaleCode {
  try {
    const stored = localStorage.getItem("locale") as LocaleCode | null;
    if (stored && stored in locales) return stored;
  } catch {
    // SSR / storage unavailable
  }
  const lang = (navigator.language ?? "en").toLowerCase();
  if (lang.startsWith("ar")) return "ar";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

export type { LocaleCode, LocaleData };
