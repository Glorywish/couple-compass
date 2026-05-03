import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LocaleCode } from "@/locales/types";

const LANGUAGES: { code: LocaleCode; name: string; country: string }[] = [
  { code: "en", name: "English",  country: "gb" },
  { code: "ar", name: "العربية", country: "sa" },
  { code: "fr", name: "Français", country: "fr" },
  { code: "es", name: "Español",  country: "es" },
  { code: "zh", name: "中文",     country: "cn" },
];

function FlagImg({ country, size = 20 }: { country: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w${size * 2}/${country}.png`}
      srcSet={`https://flagcdn.com/w${size * 2}/${country}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      style={{ borderRadius: 2, objectFit: "cover", display: "inline-block", flexShrink: 0 }}
    />
  );
}

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
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(232,96,122,0.22)", borderRadius: 999,
          padding: "6px 14px", color: "#1a3560", fontSize: "0.78rem", fontWeight: 500,
          cursor: "pointer", fontFamily: "Inter,sans-serif", letterSpacing: "0.05em",
          boxShadow: "0 2px 10px rgba(26,53,96,0.08)",
        }}>
        <Globe size={12} color="#e8607a" />
        <FlagImg country={current.country} size={16} />
        <span>{current.name}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "white", border: "1px solid rgba(184,212,240,0.6)",
          borderRadius: 14, overflow: "hidden", minWidth: 180,
          boxShadow: "0 12px 40px rgba(26,53,96,0.14)",
        }}>
          {LANGUAGES.map((lang, i) => (
            <button key={lang.code}
              onClick={() => { setLocale(lang.code); setOpen(false); }}
              data-testid={`lang-option-${lang.code}`}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", fontSize: "0.85rem", textAlign: "left",
                background: locale === lang.code ? "rgba(232,96,122,0.08)" : "transparent",
                color: locale === lang.code ? "#e8607a" : "rgba(26,53,96,0.75)",
                border: "none", cursor: "pointer", fontFamily: "Inter,sans-serif", fontWeight: 500,
                borderBottom: i < LANGUAGES.length - 1 ? "1px solid rgba(184,212,240,0.3)" : "none",
              }}>
              <FlagImg country={lang.country} size={18} />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
