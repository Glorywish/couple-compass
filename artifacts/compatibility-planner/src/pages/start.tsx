import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, ArrowRight, Camera, Hash } from "lucide-react";
import { useCreateSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const inputStyle = {
  width: "100%", background: "white", border: "1px solid rgba(184,212,240,0.7)",
  borderRadius: 12, padding: "14px 18px", color: "#1a3560", fontSize: "1.05rem",
  fontFamily: "'DM Serif Display', serif", outline: "none", boxSizing: "border-box" as const,
  boxShadow: "0 1px 8px rgba(26,53,96,0.06)",
};

export default function StartPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [session, setSession] = useState<{ sessionCode: string; partner1Name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    toast({ title: t.linkCopied, description: t.linkCopiedDesc });
  };

  const handleCopyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.sessionCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      localStorage.setItem(`cp_couple_photo_${session.sessionCode}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", color: "#1a3560", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: "48px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        <button onClick={() => setLocation("/")} data-testid="button-back-home"
          style={{ background: "transparent", color: "rgba(26,53,96,0.45)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "Inter,sans-serif", fontWeight: 500, padding: 0 }}>
          <ArrowLeft size={13} /> {data.ui.back}
        </button>

        {!session ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginTop: 48 }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 10 }}>
              {t.newSession}
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px,5vw,44px)", color: "#1a3560", lineHeight: 1.1, marginBottom: 10 }}>
              {t.title}
            </h1>
            <p style={{ color: "rgba(26,53,96,0.5)", marginBottom: 36, lineHeight: 1.8, fontSize: "0.9rem" }}>{t.desc}</p>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,53,96,0.45)", marginBottom: 8, fontWeight: 500 }}>
                  {t.label}
                </label>
                <input id="name" data-testid="input-partner1-name" value={name}
                  onChange={e => setName(e.target.value)} placeholder={t.placeholder} autoFocus
                  style={inputStyle} />
              </div>
              <motion.button type="submit"
                disabled={!name.trim() || createSession.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                data-testid="button-create-session"
                style={{
                  background: name.trim() ? "#e8607a" : "rgba(232,96,122,0.25)",
                  color: name.trim() ? "white" : "rgba(26,53,96,0.3)",
                  border: "none", borderRadius: 12, padding: "14px 28px",
                  fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: name.trim() ? "pointer" : "not-allowed", fontFamily: "Inter,sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "background 0.2s",
                  boxShadow: name.trim() ? "0 4px 16px rgba(232,96,122,0.3)" : "none",
                }}>
                {createSession.isPending ? t.creating : t.btn} {!createSession.isPending && <ArrowRight size={14} />}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginTop: 48 }}>
            {/* Code card */}
            <div style={{ background: "white", border: "1px solid rgba(232,96,122,0.2)", borderRadius: 18, padding: "28px 20px", textAlign: "center", marginBottom: 28, boxShadow: "0 4px 24px rgba(232,96,122,0.1)", overflow: "hidden" }}>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 12 }}>
                {t.codeLabel}
              </p>
              <div data-testid="text-session-code" style={{ fontSize: "clamp(1.5rem, 9vw, 3rem)", fontFamily: "monospace", fontWeight: 700, letterSpacing: "clamp(0.08em, 2vw, 0.22em)", color: "#1a3560", wordBreak: "break-all", lineHeight: 1.2, maxWidth: "100%", marginBottom: 16 }}>
                {session.sessionCode}
              </div>
              <motion.button onClick={handleCopyCode} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                data-testid="button-copy-code"
                style={{ background: codeCopied ? "rgba(26,53,96,0.07)" : "rgba(232,96,122,0.08)", border: `1px solid ${codeCopied ? "rgba(26,53,96,0.18)" : "rgba(232,96,122,0.25)"}`, borderRadius: 10, padding: "8px 20px", color: codeCopied ? "#1a3560" : "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                {codeCopied ? <Check size={11} /> : <Hash size={11} />}
                {codeCopied ? t.copiedBtn : t.copyBtn}
              </motion.button>
            </div>

            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px,4vw,34px)", color: "#1a3560", lineHeight: 1.2, marginBottom: 8 }}>
              {t.created}, <em style={{ fontStyle: "italic", color: "#e8607a" }}>{session.partner1Name}</em>
            </h1>
            <p style={{ color: "rgba(26,53,96,0.5)", marginBottom: 28, lineHeight: 1.8, fontSize: "0.9rem" }}>{t.shareDesc}</p>

            {/* Share link */}
            <div style={{ background: "white", border: "1px solid rgba(184,212,240,0.6)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28, boxShadow: "0 1px 8px rgba(26,53,96,0.06)" }}>
              <span style={{ flex: 1, fontSize: "0.75rem", color: "rgba(26,53,96,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                {shareUrl}
              </span>
              <motion.button onClick={handleCopy} whileHover={{ scale: 1.05 }} data-testid="button-copy-link"
                style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.25)", borderRadius: 8,
                  padding: "6px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
                  textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? t.copiedBtn : t.copyBtn}
              </motion.button>
            </div>

            {/* Photo upload */}
            <div style={{ background: "linear-gradient(135deg,#fce8ec 0%,#eaf3ff 100%)", border: "1px solid rgba(232,96,122,0.18)", borderRadius: 14, padding: "18px 20px", marginBottom: 28 }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(26,53,96,0.45)", marginBottom: 12, fontWeight: 500 }}>
                {t.photoLabel}
              </p>
              {photoPreview ? (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
                  <img src={photoPreview} alt="couple photo" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block", borderRadius: 12 }} />
                  <label htmlFor="photo-upload" style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(232,96,122,0.3)", borderRadius: 8, padding: "5px 12px", fontSize: "0.7rem", fontWeight: 600, color: "#e8607a", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase", backdropFilter: "blur(4px)" }}>
                    <Camera size={10} style={{ display: "inline", marginRight: 4 }} />{t.photoHint}
                  </label>
                </div>
              ) : (
                <label htmlFor="photo-upload"
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 16px", background: "white", borderRadius: 10, border: "1.5px dashed rgba(232,96,122,0.35)", color: "rgba(26,53,96,0.45)", fontSize: "0.85rem" }}>
                  <Camera size={16} color="#e8607a" />
                  {t.photoHint}
                </label>
              )}
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange}
                style={{ display: "none" }} />
            </div>

            <div style={{ borderTop: "1px solid rgba(184,212,240,0.5)", paddingTop: 24 }}>
              <p style={{ fontSize: "0.82rem", color: "rgba(26,53,96,0.4)", marginBottom: 16 }}>{t.readyText}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(`/questionnaire/${session.sessionCode}/partner1?name=${encodeURIComponent(session.partner1Name)}`)}
                data-testid="button-start-questionnaire"
                style={{ width: "100%", background: "#e8607a", color: "white", border: "none", borderRadius: 12,
                  padding: "14px 28px", fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 4px 16px rgba(232,96,122,0.3)" }}>
                {t.startBtn} <ArrowRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
