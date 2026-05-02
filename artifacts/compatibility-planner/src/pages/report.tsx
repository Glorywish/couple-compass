import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetReport, getGetReportQueryKey } from "@workspace/api-client-react";
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
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor =
    score >= 75 ? "#c9a96e" : score >= 50 ? "hsl(353 42% 64%)" : "#d44d62";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" stroke={ringColor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-4xl font-serif font-light text-foreground"
          data-testid="text-overall-score"
        >
          {score}
        </motion.div>
        <div className="text-xs text-muted-foreground font-sans">/ 100</div>
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

  const { data: report, isLoading, isError } = useGetReport(params.sessionCode, {
    query: {
      enabled: !!params.sessionCode,
      queryKey: getGetReportQueryKey(params.sessionCode),
    },
  });

  const reportUrl = `${window.location.origin}${import.meta.env.BASE_URL}report/${params.sessionCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: "Report link copied", description: "Anyone with this link can view your report" });
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Our Compatibility Report — Couple Compass", url: reportUrl });
      } catch { /* dismissed */ }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }}
          />
          <p className="text-muted-foreground font-sans text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-6 select-none" style={{ color: "#c9a96e" }}>✦</div>
          <h2 className="text-3xl font-serif font-light text-foreground mb-3">{t.notReady}</h2>
          <p className="text-muted-foreground font-sans text-sm mb-6">{t.notReadyDesc}</p>
          <Button onClick={() => setLocation("/")} variant="outline" className="text-xs uppercase tracking-widest">
            {t.backHome}
          </Button>
        </div>
      </div>
    );
  }

  const scoreLabel =
    report.overallScore >= 80 ? t.scoreLabels.high :
    report.overallScore >= 60 ? t.scoreLabels.good :
    report.overallScore >= 40 ? t.scoreLabels.some : t.scoreLabels.discuss;

  const alignmentColor: Record<string, { bar: string; badge: string }> = {
    high:   { bar: "#c9a96e",           badge: "bg-amber-50 text-amber-800 border-amber-200" },
    medium: { bar: "hsl(353 42% 64%)", badge: "bg-rose-50 text-rose-800 border-rose-200" },
    low:    { bar: "#d44d62",           badge: "bg-red-50 text-red-800 border-red-200" },
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* ── Hero header ───────────────────────────────────── */}
      <div
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(353 55% 90% / 0.6) 0%, transparent 72%)",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-sans mb-10 transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft size={14} />
            {t.backHome}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p
              className="text-[11px] uppercase tracking-[0.45em] font-sans mb-4"
              style={{ color: "#c9a96e" }}
            >
              {report.partner1Name} ✦ {report.partner2Name}
            </p>
            <h1 className="text-5xl font-serif font-light text-foreground mb-2">{t.title}</h1>
            <p className="text-muted-foreground font-sans text-sm mb-12">{t.basedOn}</p>

            <div className="flex flex-col items-center">
              <ScoreRing score={report.overallScore} />
              <div className="mt-5">
                <div className="text-xl font-serif text-foreground italic">{scoreLabel}</div>
                <div className="text-xs text-muted-foreground font-sans mt-1">{t.scoreLabel}</div>
              </div>
            </div>

            {/* Summary */}
            <div
              className="mt-10 bg-card border border-border p-6 text-left max-w-xl mx-auto"
              style={{ borderRadius: "3px", borderLeft: "3px solid #c9a96e" }}
            >
              <p className="text-foreground leading-loose font-sans text-sm" data-testid="text-summary">
                {report.summary}
              </p>
            </div>

            {/* Share link card */}
            <div
              className="mt-8 max-w-xl mx-auto border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              style={{ borderRadius: "3px", background: "hsl(var(--muted)/0.4)" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] uppercase tracking-[0.3em] font-sans mb-1"
                  style={{ color: "#c9a96e" }}
                >
                  Shareable Report Link
                </p>
                <p className="text-xs text-muted-foreground font-sans truncate">{reportUrl}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  data-testid="button-copy-report-link"
                  className="gap-1.5 text-xs uppercase tracking-wider"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  data-testid="button-share-report"
                  className="gap-1.5 text-xs uppercase tracking-wider"
                >
                  <Share2 size={12} />
                  {t.shareBtn}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        {/* ── Category scores ───────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[0.4em] font-sans mb-2" style={{ color: "#c9a96e" }}>
            By Category
          </p>
          <h2 className="text-3xl font-serif font-light text-foreground mb-8">{t.scoresTitle}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {report.categoryScores.map((cat, i) => {
              const catLabel = data.ui.categories[cat.category as keyof typeof data.ui.categories] ?? cat.label;
              const colors = alignmentColor[cat.alignment] ?? alignmentColor.medium;
              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-card border border-border p-4 transition-all hover:shadow-sm"
                  style={{ borderRadius: "3px" }}
                  data-testid={`category-score-${cat.category}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-serif text-foreground">{catLabel}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans uppercase tracking-wider ${colors.badge}`}>
                      {t.alignmentLabels[cat.alignment as keyof typeof t.alignmentLabels]}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <motion.div
                      className="h-1.5 rounded-full"
                      style={{ background: colors.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground font-sans mt-1.5">{cat.score}%</div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Aligned areas ─────────────────────────────────── */}
        {report.alignedAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={18} style={{ color: "#c9a96e" }} />
              <p className="text-[11px] uppercase tracking-[0.4em] font-sans" style={{ color: "#c9a96e" }}>
                Your Strengths
              </p>
            </div>
            <h2 className="text-3xl font-serif font-light text-foreground mb-6">{t.alignedTitle}</h2>
            <div className="space-y-3">
              {report.alignedAreas.map((item, i) => (
                <motion.div
                  key={item.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="border border-border p-4"
                  style={{
                    borderRadius: "3px",
                    background: "hsl(38 50% 61% / 0.06)",
                    borderLeft: "3px solid #c9a96e",
                  }}
                  data-testid={`aligned-item-${item.questionId}`}
                >
                  <p className="text-sm font-serif text-foreground mb-3">
                    {data.questions[item.questionId]?.text ?? item.questionText}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-sans">
                    <span>
                      <span className="font-medium text-foreground">{report.partner1Name}:</span>{" "}
                      {translateAnswer(item.questionId, item.partner1Answer, data.questions)}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{report.partner2Name}:</span>{" "}
                      {translateAnswer(item.questionId, item.partner2Answer, data.questions)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Differing areas ───────────────────────────────── */}
        {report.differingAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown size={18} style={{ color: "hsl(var(--primary))" }} />
              <p className="text-[11px] uppercase tracking-[0.4em] font-sans" style={{ color: "hsl(var(--primary))" }}>
                Growth Areas
              </p>
            </div>
            <h2 className="text-3xl font-serif font-light text-foreground mb-6">{t.differingTitle}</h2>
            <div className="space-y-3">
              {report.differingAreas.map((item, i) => (
                <motion.div
                  key={item.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  className="border border-border p-4"
                  style={{
                    borderRadius: "3px",
                    background: "hsl(353 42% 64% / 0.05)",
                    borderLeft: "3px solid hsl(var(--primary))",
                  }}
                  data-testid={`differing-item-${item.questionId}`}
                >
                  <p className="text-sm font-serif text-foreground mb-3">
                    {data.questions[item.questionId]?.text ?? item.questionText}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-sans">
                    <span>
                      <span className="font-medium text-foreground">{report.partner1Name}:</span>{" "}
                      {translateAnswer(item.questionId, item.partner1Answer, data.questions)}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{report.partner2Name}:</span>{" "}
                      {translateAnswer(item.questionId, item.partner2Answer, data.questions)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Discussion prompts ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle size={18} style={{ color: "hsl(var(--primary))" }} />
            <p className="text-[11px] uppercase tracking-[0.4em] font-sans" style={{ color: "hsl(var(--primary))" }}>
              Conversation Starters
            </p>
          </div>
          <h2 className="text-3xl font-serif font-light text-foreground mb-6">{t.promptsTitle}</h2>
          <div className="space-y-3">
            {report.discussionPrompts.map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                className="border border-border p-4 flex gap-4 items-start"
                style={{ borderRadius: "3px", background: "hsl(var(--card))" }}
                data-testid={`discussion-prompt-${i}`}
              >
                <span className="text-xs mt-0.5 shrink-0" style={{ color: "#c9a96e" }}>✦</span>
                <p className="text-sm text-foreground leading-loose font-sans">{prompt}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Footer affirmation ────────────────────────────── */}
        <div
          className="text-center py-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(327 12% 20%), hsl(327 15% 28%))",
            borderRadius: "3px",
          }}
        >
          <span
            className="absolute text-white/5 pointer-events-none select-none"
            style={{ fontSize: "160px", top: "-20px", right: "-10px", lineHeight: 1 }}
          >
            ✦
          </span>
          <div className="relative z-10">
            <div className="text-2xl mb-4 text-white/40 select-none">✦</div>
            <p
              className="font-serif italic text-xl font-light leading-relaxed mb-4 max-w-sm mx-auto px-6"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              "Understanding each other is the foundation of a lasting love."
            </p>
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-sans"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              — Couple Compass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
