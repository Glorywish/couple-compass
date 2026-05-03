import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useGetSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const inputStyle = {
  width: "100%", background: "white", border: "1px solid rgba(184,212,240,0.7)",
  borderRadius: 12, padding: "14px 18px", color: "#1a3560", fontSize: "1.05rem",
  fontFamily: "Inter,sans-serif", outline: "none", boxSizing: "border-box" as const,
  boxShadow: "0 1px 8px rgba(26,53,96,0.06)",
};

export default function JoinPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefilledCode = params.get("code") ?? "";
  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { data } = useI18n();
  const t = data.ui.join;

  const { data: session, isError, isLoading } = useGetSession(
    code.toUpperCase().trim(),
    { query: { enabled: submitted && !!code.trim(), queryKey: getGetSessionQueryKey(code.toUpperCase().trim()) } }
  );

  useEffect(() => {
    if (submitted && session && name.trim())
      setLocation(`/questionnaire/${session.sessionCode}/partner2?name=${encodeURIComponent(name.trim())}`);
  }, [session, submitted, name]);

  useEffect(() => {
    if (submitted && isError) {
      toast({ title: data.ui.errors.sessionNotFound, variant: "destructive" });
      setSubmitted(false);
    }
  }, [isError, submitted]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSubmitted(true);
  };

  const canSubmit = code.trim() && name.trim() && !isLoading;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", color: "#1a3560", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: "48px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        <button onClick={() => setLocation("/")} data-testid="button-back-home"
          style={{ background: "transparent", color: "rgba(26,53,96,0.4)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "Inter,sans-serif", fontWeight: 500, padding: 0, marginBottom: 48 }}>
          <ArrowLeft size={13} /> {data.ui.back}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 10 }}>
            Partner 2
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px,5vw,44px)", color: "#1a3560", lineHeight: 1.1, marginBottom: 10 }}>
            {t.title}
          </h1>
          <p style={{ color: "rgba(26,53,96,0.5)", marginBottom: 36, lineHeight: 1.8, fontSize: "0.9rem" }}>{t.desc}</p>

          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,53,96,0.45)", marginBottom: 8, fontWeight: 500 }}>
                {t.codeLabel}
              </label>
              <input id="code" data-testid="input-session-code" value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder} maxLength={8} autoFocus={!prefilledCode}
                style={{ ...inputStyle, fontFamily: "monospace", fontSize: "1.6rem", letterSpacing: "0.3em", textTransform: "uppercase" as const }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,53,96,0.45)", marginBottom: 8, fontWeight: 500 }}>
                {t.nameLabel}
              </label>
              <input id="name" data-testid="input-partner2-name" value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.namePlaceholder} autoFocus={!!prefilledCode}
                style={{ ...inputStyle, fontFamily: "'DM Serif Display', serif" }}
              />
            </div>

            <motion.button type="submit" disabled={!canSubmit}
              whileHover={{ scale: canSubmit ? 1.02 : 1 }} whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              data-testid="button-join-session"
              style={{
                background: canSubmit ? "#e8607a" : "rgba(232,96,122,0.2)",
                color: canSubmit ? "white" : "rgba(26,53,96,0.3)",
                border: "none", borderRadius: 12, padding: "14px 28px",
                fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "Inter,sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "background 0.2s",
                boxShadow: canSubmit ? "0 4px 16px rgba(232,96,122,0.3)" : "none",
              }}
            >
              {isLoading ? t.checking : t.btn} {!isLoading && <ArrowRight size={14} />}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
