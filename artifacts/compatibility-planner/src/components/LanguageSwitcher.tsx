import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LocaleCode } from "@/locales/types";

const LANGUAGES: { code: LocaleCode; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50" data-testid="language-switcher">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch language"
        className="flex items-center gap-1.5 bg-background/90 backdrop-blur border border-border rounded-full px-3 py-1.5 text-sm text-foreground shadow-sm hover:bg-accent transition-colors"
      >
        <Globe size={13} className="text-muted-foreground" />
        <span>{current.flag}</span>
        <span className="font-medium">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl overflow-hidden min-w-[160px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              data-testid={`lang-option-${lang.code}`}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-accent transition-colors ${
                locale === lang.code ? "bg-accent/60 font-medium text-primary" : "text-foreground"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
