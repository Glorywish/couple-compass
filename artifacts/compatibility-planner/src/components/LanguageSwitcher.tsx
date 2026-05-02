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
          background: "rgba(26,37,64,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(126,170,146,0.22)", borderRadius: 999,
          padding: "6px 14px", color: "#f5f0e8", fontSize: "0.78rem", fontWeight: 500,
          cursor: "pointer", fontFamily: "Inter,sans-serif", letterSpacing: "0.05em",
        }}>
        <Globe size={12} color="#7eaa92" />
        <span>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#1a2540", border: "1px solid rgba(126,170,146,0.2)",
          borderRadius: 14, overflow: "hidden", minWidth: 170,
          boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
        }}>
          {LANGUAGES.map(lang => (
            <button key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              data-testid={`lang-option-${lang.code}`}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", fontSize: "0.85rem", textAlign: "left",
                background: locale === lang.code ? "rgba(126,170,146,0.12)" : "transparent",
                color: locale === lang.code ? "#a8c5b3" : "rgba(245,240,232,0.75)",
                border: "none", cursor: "pointer", fontFamily: "Inter,sans-serif", fontWeight: 500,
                borderBottom: "1px solid rgba(245,240,232,0.05)",
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
