import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Share2, TrendingUp, TrendingDown, MessageCircle, Heart, FileDown, Mail, Send, X } from "lucide-react";
import { useGetReport, getGetReportQueryKey, useEmailReport } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import type { LocaleData } from "@/locales/types";

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
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page { page-break-inside: avoid; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
            <div style={{ marginTop: 20, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }} className="no-print">
              {/* Action row */}
              <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(184,212,240,0.5)", borderRadius: showEmailPanel ? "12px 12px 0 0" : 12, padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 4 }}>{t.shareableLink}</p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.35)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reportUrl}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <button onClick={handleCopy} data-testid="button-copy-report-link"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? t.copiedBtn : t.copyBtn}
                  </button>
                  <button onClick={handleShare} data-testid="button-share-report"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <Share2 size={11} /> {t.shareBtn}
                  </button>
                  <button onClick={handleDownloadPdf} data-testid="button-download-pdf"
                    style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "7px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <FileDown size={11} /> {t.downloadPdf}
                  </button>
                  <button onClick={() => setShowEmailPanel(p => !p)} data-testid="button-email-report"
                    style={{ background: showEmailPanel ? "#e8607a" : "#e8607a", border: "none", borderRadius: 8, padding: "7px 14px", color: "white", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 2px 10px rgba(232,96,122,0.28)" }}>
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
      </div>
    </div>
  );
}
