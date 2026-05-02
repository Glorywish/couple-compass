import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";
import { useCreateSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const NAV = { background: "transparent", color: "rgba(245,240,232,0.6)", border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", letterSpacing: "0.06em",
  textTransform: "uppercase" as const, fontFamily: "Inter,sans-serif", fontWeight: 500, padding: 0 };

export default function StartPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [session, setSession] = useState<{ sessionCode: string; partner1Name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data } = useI18n();
  const t = data.ui.start;

  const createSession = useCreateSession({
    mutation: {
      onSuccess: (d) => setSession({ sessionCode: d.sessionCode, partner1Name: d.partner1Name }),
      onError: () => toast({ title: data.ui.errors.createFailed, variant: "destructive" }),
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSession.mutate({ data: { partner1Name: name.trim() } });
  };

  const shareUrl = session
    ? `${window.location.origin}${import.meta.env.BASE_URL}join?code=${session.sessionCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: "Link copied!", description: "Share it with your partner" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1729", color: "#f5f0e8", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: "48px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        <button onClick={() => setLocation("/")} style={NAV} data-testid="button-back-home">
          <ArrowLeft size={14} /> {data.ui.back}
        </button>

        {!session ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginTop: 48 }}>
            <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 600, marginBottom: 10 }}>
              New Session
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px,5vw,44px)", color: "#f5f0e8", lineHeight: 1.1, marginBottom: 10 }}>
              {t.title}
            </h1>
            <p style={{ color: "rgba(245,240,232,0.5)", marginBottom: 36, lineHeight: 1.75, fontSize: "0.9rem" }}>{t.desc}</p>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,240,232,0.45)", marginBottom: 8, fontWeight: 500 }}>
                  {t.label}
                </label>
                <input
                  id="name" data-testid="input-partner1-name" value={name}
                  onChange={e => setName(e.target.value)} placeholder={t.placeholder} autoFocus
                  style={{
                    width: "100%", background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.12)",
                    borderRadius: 12, padding: "14px 18px", color: "#f5f0e8", fontSize: "1.05rem",
                    fontFamily: "'DM Serif Display', serif", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <motion.button type="submit"
                disabled={!name.trim() || createSession.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                data-testid="button-create-session"
                style={{
                  background: name.trim() ? "#7eaa92" : "rgba(126,170,146,0.3)",
                  color: name.trim() ? "#0f1729" : "rgba(245,240,232,0.4)",
                  border: "none", borderRadius: 12, padding: "14px 28px",
                  fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "Inter,sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s",
                }}
              >
                {createSession.isPending ? t.creating : t.btn} {!createSession.isPending && <ArrowRight size={14} />}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginTop: 48 }}>
            {/* Code card */}
            <div style={{ background: "#1a2540", border: "1px solid rgba(126,170,146,0.2)", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 600, marginBottom: 10 }}>
                {t.codeLabel}
              </p>
              <div data-testid="text-session-code" style={{ fontSize: "3rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em", color: "#f5f0e8" }}>
                {session.sessionCode}
              </div>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,4.5vw,36px)", color: "#f5f0e8", lineHeight: 1.2, marginBottom: 8 }}>
              {t.created}, <em style={{ fontStyle: "italic", color: "#7eaa92" }}>{session.partner1Name}</em>
            </h1>
            <p style={{ color: "rgba(245,240,232,0.5)", marginBottom: 28, lineHeight: 1.75, fontSize: "0.9rem" }}>{t.shareDesc}</p>

            {/* Share link */}
            <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <span style={{ flex: 1, fontSize: "0.78rem", color: "rgba(245,240,232,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                {shareUrl}
              </span>
              <motion.button onClick={handleCopy} whileHover={{ scale: 1.05 }} data-testid="button-copy-link"
                style={{ background: "rgba(126,170,146,0.15)", border: "1px solid rgba(126,170,146,0.3)", borderRadius: 8,
                  padding: "6px 14px", color: "#a8c5b3", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 6 }}
              >
                {copied ? <Check size={12} color="#7eaa92" /> : <Copy size={12} />}
                {copied ? t.copiedBtn : t.copyBtn}
              </motion.button>
            </div>

            <div style={{ borderTop: "1px solid rgba(245,240,232,0.08)", paddingTop: 24 }}>
              <p style={{ fontSize: "0.82rem", color: "rgba(245,240,232,0.4)", marginBottom: 16 }}>{t.readyText}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(`/questionnaire/${session.sessionCode}/partner1?name=${encodeURIComponent(session.partner1Name)}`)}
                data-testid="button-start-questionnaire"
                style={{ width: "100%", background: "#7eaa92", color: "#0f1729", border: "none", borderRadius: 12,
                  padding: "14px 28px", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
              >
                {t.startBtn} <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
