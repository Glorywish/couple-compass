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
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: "fixed", top: 16, right: 16, zIndex: 50 }} data-testid="language-switcher">
      <button onClick={() => setOpen(o => !o)} aria-label="Switch language"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(232,96,122,0.22)", borderRadius: 999,
          padding: "6px 14px", color: "#1a3560", fontSize: "0.78rem", fontWeight: 500,
          cursor: "pointer", fontFamily: "Inter,sans-serif", letterSpacing: "0.05em",
          boxShadow: "0 2px 10px rgba(26,53,96,0.08)",
        }}>
        <Globe size={12} color="#e8607a" />
        <span>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "white", border: "1px solid rgba(184,212,240,0.6)",
          borderRadius: 14, overflow: "hidden", minWidth: 170,
          boxShadow: "0 12px 40px rgba(26,53,96,0.14)",
        }}>
          {LANGUAGES.map(lang => (
            <button key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              data-testid={`lang-option-${lang.code}`}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", fontSize: "0.85rem", textAlign: "left",
                background: locale === lang.code ? "rgba(232,96,122,0.08)" : "transparent",
                color: locale === lang.code ? "#e8607a" : "rgba(26,53,96,0.75)",
                border: "none", cursor: "pointer", fontFamily: "Inter,sans-serif", fontWeight: 500,
                borderBottom: "1px solid rgba(184,212,240,0.3)",
              }}>
              <span style={{ fontSize: "1rem" }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
