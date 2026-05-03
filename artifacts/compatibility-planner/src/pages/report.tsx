import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Share2, TrendingUp, TrendingDown, MessageCircle, Heart, FileDown, Mail, Send, X } from "lucide-react";
import { useGetReport, getGetReportQueryKey, useEmailReport } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import type { LocaleData } from "@/locales/types";

const CIH_RIB  = "230 640 5881663211034200 41";
const CIH_IBAN = "MA64 2306 4058 8166 3211 0342 0041";

type ReportT = LocaleData["ui"]["report"];

function ShareResultCard({ partner1Name, partner2Name, score, topStrengths, reportUrl, t }: {
  partner1Name: string;
  partner2Name: string;
  score: number;
  topStrengths: string[];
  reportUrl: string;
  t: ReportT;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 1080, H = 1080;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#eaf3ff");
      grad.addColorStop(1, "#fce8ec");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(232,96,122,0.07)";
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 220, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(W * 0.12, H * 0.82, 160, 0, Math.PI * 2); ctx.fill();

      const scoreColor = score >= 75 ? "#e8607a" : score >= 50 ? "#d4a853" : "#b8d4f0";
      const cx = W / 2, cy = 390, r = 160;
      ctx.strokeStyle = "rgba(26,53,96,0.07)";
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = scoreColor;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      const start = -Math.PI / 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + (score / 100) * Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#1a3560";
      ctx.font = "bold 96px serif";
      ctx.textAlign = "center";
      ctx.fillText(`${score}`, cx, cy + 28);
      ctx.fillStyle = "rgba(26,53,96,0.4)";
      ctx.font = "28px sans-serif";
      ctx.fillText("/ 100", cx, cy + 68);

      ctx.fillStyle = "#e8607a";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COUPLE COMPASS", W / 2, 90);

      ctx.fillStyle = "rgba(26,53,96,0.5)";
      ctx.font = "34px sans-serif";
      ctx.fillText(`${partner1Name}  ·  ${partner2Name}`, W / 2, 148);

      ctx.fillStyle = "#1a3560";
      ctx.font = "bold 42px serif";
      ctx.fillText("Compatibility Report", W / 2, 208);

      if (topStrengths.length > 0) {
        ctx.fillStyle = "rgba(26,53,96,0.35)";
        ctx.font = "24px sans-serif";
        ctx.fillText("Top strengths", W / 2, 600);
        topStrengths.slice(0, 3).forEach((s, i) => {
          ctx.fillStyle = "white";
          const tw = ctx.measureText(s).width + 48;
          const tx = W / 2 - tw / 2, ty = 620 + i * 64;
          roundRect(ctx, tx, ty, tw, 48, 24);
          ctx.fillStyle = "#e8607a";
          ctx.font = "bold 24px sans-serif";
          ctx.fillText(s, W / 2, ty + 32);
        });
      }

      ctx.fillStyle = "rgba(26,53,96,0.25)";
      ctx.font = "22px sans-serif";
      const short = reportUrl.replace(/^https?:\/\//, "");
      ctx.fillText(short.length > 50 ? short.slice(0, 50) + "…" : short, W / 2, H - 52);

      const link = document.createElement("a");
      link.download = `couple-compass-${partner1Name}-${partner2Name}.png`.toLowerCase().replace(/\s+/g, "-");
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82, duration: 0.5 }}
      className="no-print"
      style={{ background: "linear-gradient(135deg,#eaf3ff 0%,#fce8ec 100%)", border: "1px solid rgba(184,212,240,0.5)", borderRadius: 20, padding: "24px 28px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", boxShadow: "0 2px 16px rgba(26,53,96,0.05)" }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <p style={{ margin: "0 0 4px", fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#1a3560" }}>{t.shareCardTitle}</p>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(26,53,96,0.45)", lineHeight: 1.6 }}>{t.shareCardDesc}</p>
      </div>
      <button onClick={handleDownload} disabled={downloading}
        style={{ background: "#e8607a", border: "none", borderRadius: 12, padding: "11px 22px", color: "white", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", cursor: downloading ? "wait" : "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 8, opacity: downloading ? 0.7 : 1, boxShadow: "0 3px 14px rgba(232,96,122,0.3)", whiteSpace: "nowrap", flexShrink: 0 }}>
        {downloading
          ? <><div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> Generating...</>
          : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> {t.shareCardBtn}</>
        }
      </button>
    </motion.div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function DonateCard({ t }: { t: ReportT }) {
  const [ribCopied, setRibCopied] = useState(false);

  const copyRib = () => {
    navigator.clipboard.writeText(CIH_RIB).then(() => {
      setRibCopied(true);
      setTimeout(() => setRibCopied(false), 2500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}
      className="no-print"
      style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 20, padding: "28px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", boxShadow: "0 2px 16px rgba(26,53,96,0.05)" }}>
      <div style={{ fontSize: "1.5rem" }}>💛</div>
      <div>
        <p style={{ margin: "0 0 6px", fontFamily: "'DM Serif Display', serif", fontSize: "1.15rem", color: "#1a3560" }}>{t.donateTitle}</p>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(26,53,96,0.5)", lineHeight: 1.7, maxWidth: 420 }}>{t.donateDesc}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        <a
          href="https://paypal.me/morganamona"
          target="_blank"
          rel="noreferrer"
          style={{ background: "#003087", borderRadius: 12, padding: "11px 22px", color: "white", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase", boxShadow: "0 3px 14px rgba(0,48,135,0.22)", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .92-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.774-4.471z"/></svg>
          PayPal
        </a>
        <button onClick={copyRib}
          style={{ background: "white", border: "1.5px solid rgba(26,53,96,0.15)", borderRadius: 12, padding: "11px 22px", color: "#1a3560", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 8, transition: "border-color 0.2s" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {ribCopied ? t.cihCopied : t.cihCopy}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 420 }}>
        <div style={{ background: "rgba(26,53,96,0.03)", border: "1px solid rgba(26,53,96,0.08)", borderRadius: 12, padding: "12px 18px", boxSizing: "border-box" }}>
          <p style={{ margin: "0 0 4px", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,53,96,0.35)", fontWeight: 600 }}>{t.cihTitle} — RIB</p>
          <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.88rem", color: "#1a3560", letterSpacing: "0.06em", wordBreak: "break-all" }}>{CIH_RIB}</p>
        </div>
        <IbanRow iban={CIH_IBAN} copyLabel={t.cihCopy.replace("RIB","IBAN")} copiedLabel={t.cihCopied} />
      </div>
    </motion.div>
  );
}

function IbanRow({ iban, copyLabel, copiedLabel }: { iban: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(iban).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  };
  return (
    <div style={{ background: "rgba(26,53,96,0.03)", border: "1px solid rgba(26,53,96,0.08)", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxSizing: "border-box" }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 3px", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,53,96,0.35)", fontWeight: 600 }}>IBAN</p>
        <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.82rem", color: "#1a3560", letterSpacing: "0.04em", wordBreak: "break-all" }}>{iban}</p>
      </div>
      <button onClick={doCopy} style={{ flexShrink: 0, background: "white", border: "1px solid rgba(26,53,96,0.14)", borderRadius: 8, padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700, color: "#1a3560", cursor: "pointer", fontFamily: "Inter,sans-serif", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

function StarRatingCard({ sessionCode, t }: { sessionCode: string; t: ReportT }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) return;
    setSaving(true);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/sessions/${sessionCode}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, note: note.trim() || null }),
      });
      setSubmitted(true);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.5 }}
      className="no-print"
      style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 20, padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", boxShadow: "0 2px 16px rgba(26,53,96,0.05)" }}>
      {submitted ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: "2rem" }}>🌟</div>
          <p style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#1a3560" }}>{t.ratingThanks}</p>
        </motion.div>
      ) : (
        <>
          <div>
            <p style={{ margin: "0 0 4px", fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#1a3560" }}>{t.ratingTitle}</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(26,53,96,0.45)" }}>{t.ratingSub}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setStars(n)}
                onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, fontSize: "1.8rem", lineHeight: 1,
                  animation: n <= stars ? "starPop 0.25s ease" : "none",
                  filter: n <= (hovered || stars) ? "none" : "grayscale(1) opacity(0.4)",
                  transform: n <= (hovered || stars) ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s, filter 0.15s" }}>
                ⭐
              </button>
            ))}
          </div>
          {stars > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ width: "100%", maxWidth: 360, overflow: "hidden" }}>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t.ratingNote} rows={2}
                style={{ width: "100%", boxSizing: "border-box", background: "#f5f8ff", border: "1px solid rgba(184,212,240,0.5)", borderRadius: 10, padding: "10px 14px", fontSize: "0.82rem", color: "#1a3560", fontFamily: "Inter,sans-serif", resize: "vertical", outline: "none", marginBottom: 10 }} />
              <button onClick={handleSubmit} disabled={saving}
                style={{ background: "#e8607a", border: "none", borderRadius: 10, padding: "10px 28px", color: "white", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: saving ? "wait" : "pointer", fontFamily: "Inter,sans-serif", opacity: saving ? 0.7 : 1, boxShadow: "0 3px 12px rgba(232,96,122,0.28)" }}>
                {saving ? t.ratingSubmitting : t.ratingSubmit}
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function translateAnswer(questionId: number, value: string, questions: LocaleData["questions"]): string {
  const q = questions[questionId];
  if (!q || !q.options) return value;
  const idx = parseInt(value, 10);
  if (!isNaN(idx) && idx >= 0 && idx < q.options.length) return q.options[idx];
  return value;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#e8607a" : score >= 50 ? "#d4a853" : "#b8d4f0";
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={148} height={148} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={74} cy={74} r={radius} fill="none" stroke="rgba(26,53,96,0.08)" strokeWidth={6} />
        <motion.circle cx={74} cy={74} r={radius} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          data-testid="text-overall-score"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.6rem", color: "#1a3560", lineHeight: 1 }}
        >
          {score}
        </motion.div>
        <div style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.4)", letterSpacing: "0.1em" }}>/ 100</div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ sessionCode: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data } = useI18n();
  const t = data.ui.report;
  const [copied, setCopied] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [email1, setEmail1] = useState("");
  const [email2, setEmail2] = useState("");

  const couplePhoto = typeof localStorage !== "undefined"
    ? localStorage.getItem(`cp_couple_photo_${params.sessionCode}`)
    : null;

  const { data: report, isLoading, isError } = useGetReport(params.sessionCode, {
    query: { enabled: !!params.sessionCode, queryKey: getGetReportQueryKey(params.sessionCode) },
  });

  const { mutate: sendEmail, isPending: emailSending } = useEmailReport({
    mutation: {
      onSuccess: () => {
        toast({ title: t.emailSent, description: t.emailSentDesc });
        setShowEmailPanel(false);
        setEmail1("");
        setEmail2("");
      },
      onError: (err: Error & { status?: number }) => {
        const msg = err?.status === 503 ? t.emailNotConfigured : t.emailFailed;
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  const reportUrl = `${window.location.origin}${import.meta.env.BASE_URL}report/${params.sessionCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: t.reportCopied, description: t.reportCopiedDesc });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Couple Compass", url: reportUrl }); }
      catch { /* dismissed */ }
    } else { handleCopy(); }
  };

  const handleSendEmail = () => {
    const emails = [email1, email2].map(e => e.trim()).filter(e => e.includes("@"));
    if (emails.length === 0) return;
    sendEmail({ sessionCode: params.sessionCode, data: { emails } });
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid rgba(232,96,122,0.3)", borderTopColor: "#e8607a", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "rgba(26,53,96,0.5)", fontSize: "0.9rem" }}>{t.loading}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const notReadyView = (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <Heart size={36} color="#e8607a" fill="rgba(232,96,122,0.15)" style={{ margin: "0 auto 20px", opacity: 0.5 }} />
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#1a3560", marginBottom: 10 }}>{t.notReady}</h2>
        <p style={{ color: "rgba(26,53,96,0.5)", marginBottom: 28, fontSize: "0.9rem", lineHeight: 1.8 }}>{t.notReadyDesc}</p>
        <button onClick={() => setLocation("/")}
          style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.25)", borderRadius: 10, padding: "10px 24px", color: "#e8607a", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
          {t.backHome}
        </button>
      </div>
    </div>
  );

  if (isError || !report) return notReadyView;
  if (!("overallScore" in report)) return notReadyView;

  const scoreLabel = report.overallScore >= 80 ? t.scoreLabels.high : report.overallScore >= 60 ? t.scoreLabels.good : report.overallScore >= 40 ? t.scoreLabels.some : t.scoreLabels.discuss;
  const scoreColor = report.overallScore >= 75 ? "#e8607a" : report.overallScore >= 50 ? "#d4a853" : "#b8d4f0";

  const alignColors: Record<string, { bar: string; bg: string; border: string; text: string }> = {
    high:   { bar: "#e8607a", bg: "rgba(232,96,122,0.07)",  border: "rgba(232,96,122,0.22)", text: "#e8607a" },
    medium: { bar: "#d4a853", bg: "rgba(212,168,83,0.07)",  border: "rgba(212,168,83,0.22)",  text: "#b07820" },
    low:    { bar: "#b8d4f0", bg: "rgba(184,212,240,0.15)", border: "rgba(184,212,240,0.5)",  text: "#4a80b8" },
  };

  const handleDownloadPdf = () => { window.print(); };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f0", color: "#1a3560", paddingBottom: 80 }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.08)}28%{transform:scale(1)}42%{transform:scale(1.05)}70%{transform:scale(1)}}
        @keyframes starPop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .share-row { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
        .share-btns { display:flex; gap:8px; flex-wrap:wrap; }
        @media(max-width:540px){
          .share-row { flex-direction:column; align-items:stretch; }
          .share-btns { justify-content:flex-start; }
          .share-btn { font-size:0.65rem !important; padding:6px 10px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", borderBottom: "1px solid rgba(184,212,240,0.4)", paddingBottom: 52 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "44px 24px 0" }}>
          <button onClick={() => setLocation("/")} data-testid="button-back-home" className="no-print"
            style={{ background: "transparent", color: "rgba(26,53,96,0.4)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: "0.76rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Inter,sans-serif", fontWeight: 500, padding: 0, marginBottom: 44 }}>
            <ArrowLeft size={13} /> {t.backHome}
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ textAlign: "center" }}>
            {/* Couple photo if uploaded */}
            {couplePhoto && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
                style={{ marginBottom: 28 }}>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 10 }}>
                  {t.couplePhoto}
                </p>
                <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", margin: "0 auto", border: "3px solid rgba(232,96,122,0.35)", boxShadow: "0 4px 24px rgba(232,96,122,0.18)" }}>
                  <img src={couplePhoto} alt="couple" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </motion.div>
            )}

            <p style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 10 }}>
              {report.partner1Name} · {report.partner2Name}
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(36px,6vw,56px)", color: "#1a3560", lineHeight: 1.05, marginBottom: 8 }}>
              {t.title}
            </h1>
            <p style={{ color: "rgba(26,53,96,0.4)", fontSize: "0.88rem", marginBottom: 44 }}>{t.basedOn}</p>

            <ScoreRing score={report.overallScore} />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: scoreColor, fontStyle: "italic" }}>{scoreLabel}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.35)", letterSpacing: "0.08em", marginTop: 4 }}>{t.scoreLabel}</div>
            </div>

            {/* Summary */}
            <div style={{ marginTop: 36, background: "white", border: "1px solid rgba(232,96,122,0.15)", borderRadius: 18, padding: "24px 28px", textAlign: "left", maxWidth: 560, marginLeft: "auto", marginRight: "auto", boxShadow: "0 4px 24px rgba(232,96,122,0.08)" }}>
              <p data-testid="text-summary" style={{ color: "rgba(26,53,96,0.7)", lineHeight: 1.85, fontSize: "0.95rem" }}>{report.summary}</p>
            </div>

            {/* Share card */}
            <div style={{ marginTop: 20, maxWidth: 560, marginLeft: "auto", marginRight: "auto", overflow: "hidden" }} className="no-print">
              {/* Action row */}
              <div className="share-row" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(184,212,240,0.5)", borderRadius: showEmailPanel ? "12px 12px 0 0" : 12, padding: "14px 18px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 4 }}>{t.shareableLink}</p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.35)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{reportUrl}</p>
                </div>
                <div className="share-btns">
                  <button onClick={handleCopy} data-testid="button-copy-report-link" className="share-btn"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? t.copiedBtn : t.copyBtn}
                  </button>
                  <button onClick={handleShare} data-testid="button-share-report" className="share-btn"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <Share2 size={11} /> {t.shareBtn}
                  </button>
                  <button onClick={handleDownloadPdf} data-testid="button-download-pdf" className="share-btn"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <FileDown size={11} /> {t.downloadPdf}
                  </button>
                  <button onClick={() => setShowEmailPanel(p => !p)} data-testid="button-email-report" className="share-btn"
                    style={{ background: "#e8607a", border: "none", borderRadius: 8, padding: "7px 14px", color: "white", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 10px rgba(232,96,122,0.28)" }}>
                    {showEmailPanel ? <X size={11} /> : <Mail size={11} />} {t.emailReport}
                  </button>
                </div>
              </div>

              {/* Email panel — expands below the action row */}
              {showEmailPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: "rgba(252,232,236,0.5)", border: "1px solid rgba(232,96,122,0.22)", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "18px 18px 16px", overflow: "hidden" }}>
                  <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 12 }}>{t.emailLabel}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    <input
                      type="email" value={email1} onChange={e => setEmail1(e.target.value)}
                      placeholder={t.partner1Email}
                      style={{ background: "white", border: "1px solid rgba(232,96,122,0.25)", borderRadius: 8, padding: "9px 14px", fontSize: "0.82rem", color: "#1a3560", fontFamily: "Inter,sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                    <input
                      type="email" value={email2} onChange={e => setEmail2(e.target.value)}
                      placeholder={t.partner2Email}
                      onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      style={{ background: "white", border: "1px solid rgba(232,96,122,0.25)", borderRadius: 8, padding: "9px 14px", fontSize: "0.82rem", color: "#1a3560", fontFamily: "Inter,sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <button onClick={handleSendEmail} disabled={emailSending || (!email1.includes("@") && !email2.includes("@"))}
                    data-testid="button-send-email"
                    style={{ background: "#e8607a", border: "none", borderRadius: 8, padding: "9px 20px", color: "white", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: emailSending ? "wait" : "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 7, opacity: emailSending ? 0.7 : 1, boxShadow: "0 2px 10px rgba(232,96,122,0.28)", transition: "opacity 0.2s" }}>
                    {emailSending
                      ? <><div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> Sending...</>
                      : <><Send size={11} /> {t.sendEmail}</>
                    }
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px", display: "flex", flexDirection: "column", gap: 52 }}>

        {/* Category scores */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 6 }}>{t.byCategory}</p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px,4vw,30px)", color: "#1a3560", marginBottom: 24 }}>{t.scoresTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {report.categoryScores.map((cat, i) => {
              const label = data.ui.categories[cat.category as keyof typeof data.ui.categories] ?? cat.label;
              const c = alignColors[cat.alignment] ?? alignColors.medium;
              return (
                <motion.div key={cat.category}
                  initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  data-testid={`category-score-${cat.category}`}
                  style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 12px rgba(26,53,96,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.88rem", color: "#1a3560", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: "0.62rem", padding: "3px 10px", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {t.alignmentLabels[cat.alignment as keyof typeof t.alignmentLabels]}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: "rgba(26,53,96,0.07)", overflow: "hidden" }}>
                    <motion.div style={{ height: "100%", borderRadius: 999, background: c.bar }}
                      initial={{ width: 0 }} animate={{ width: `${cat.score}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.72rem", color: "rgba(26,53,96,0.35)", marginTop: 6 }}>{cat.score}%</div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Aligned */}
        {report.alignedAreas.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <TrendingUp size={16} color="#e8607a" />
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600 }}>{t.strengths}</p>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px,4vw,30px)", color: "#1a3560", marginBottom: 20 }}>{t.alignedTitle}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.alignedAreas.map((item, i) => (
                <motion.div key={item.questionId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  data-testid={`aligned-item-${item.questionId}`}
                  style={{ background: "rgba(232,96,122,0.05)", border: "1px solid rgba(232,96,122,0.18)", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontSize: "0.9rem", color: "#1a3560", marginBottom: 10, lineHeight: 1.65, fontWeight: 500 }}>
                    {data.questions[item.questionId]?.text ?? item.questionText}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: "0.8rem", color: "rgba(26,53,96,0.5)" }}>
                    <span><span style={{ color: "#1a3560", fontWeight: 500 }}>{report.partner1Name}:</span> {translateAnswer(item.questionId, item.partner1Answer, data.questions)}</span>
                    <span><span style={{ color: "#1a3560", fontWeight: 500 }}>{report.partner2Name}:</span> {translateAnswer(item.questionId, item.partner2Answer, data.questions)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Differing */}
        {report.differingAreas.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <TrendingDown size={16} color="#d4a853" />
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4a853", fontWeight: 600 }}>{t.growthAreas}</p>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px,4vw,30px)", color: "#1a3560", marginBottom: 20 }}>{t.differingTitle}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.differingAreas.map((item, i) => (
                <motion.div key={item.questionId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  data-testid={`differing-item-${item.questionId}`}
                  style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.2)", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ fontSize: "0.9rem", color: "#1a3560", marginBottom: 10, lineHeight: 1.65, fontWeight: 500 }}>
                    {data.questions[item.questionId]?.text ?? item.questionText}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: "0.8rem", color: "rgba(26,53,96,0.5)" }}>
                    <span><span style={{ color: "#1a3560", fontWeight: 500 }}>{report.partner1Name}:</span> {translateAnswer(item.questionId, item.partner1Answer, data.questions)}</span>
                    <span><span style={{ color: "#1a3560", fontWeight: 500 }}>{report.partner2Name}:</span> {translateAnswer(item.questionId, item.partner2Answer, data.questions)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Discussion prompts */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <MessageCircle size={16} color="rgba(26,53,96,0.4)" />
            <p style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(26,53,96,0.4)", fontWeight: 600 }}>{t.conversationStarters}</p>
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(22px,4vw,30px)", color: "#1a3560", marginBottom: 20 }}>{t.promptsTitle}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report.discussionPrompts.map((prompt, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                data-testid={`discussion-prompt-${i}`}
                style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 12, padding: "16px 18px", display: "flex", gap: 14, boxShadow: "0 1px 8px rgba(26,53,96,0.04)" }}>
                <span style={{ color: "#e8607a", fontSize: "0.85rem", flexShrink: 0, marginTop: 2 }}>→</span>
                <p style={{ fontSize: "0.9rem", color: "rgba(26,53,96,0.65)", lineHeight: 1.8 }}>{prompt}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Closing */}
        <div style={{ background: "linear-gradient(135deg,#fce8ec 0%,#eaf3ff 100%)", border: "1px solid rgba(232,96,122,0.18)", borderRadius: 22, padding: "44px 32px", textAlign: "center" }}>
          <Heart size={22} color="#e8607a" fill="rgba(232,96,122,0.3)" style={{ margin: "0 auto 18px", animation: "heartbeat 3s ease-in-out infinite" }} />
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", color: "rgba(26,53,96,0.7)", fontStyle: "italic", lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}>
            {t.closingQuote}
          </p>
        </div>

        {/* Share result card */}
        <ShareResultCard
          partner1Name={report.partner1Name}
          partner2Name={report.partner2Name ?? ""}
          score={report.overallScore}
          topStrengths={report.categoryScores.sort((a, b) => b.score - a.score).slice(0, 3).map(c => data.ui.categories[c.category as keyof typeof data.ui.categories] ?? c.label)}
          reportUrl={reportUrl}
          t={t}
        />

        {/* Star rating card */}
        <StarRatingCard sessionCode={params.sessionCode} t={t} />

        {/* Donation card */}
        <DonateCard t={t} />
      </div>
    </div>
  );
}
