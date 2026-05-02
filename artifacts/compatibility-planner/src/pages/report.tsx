import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, TrendingUp, TrendingDown, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetReport, getGetReportQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-red-100 text-red-800 border-red-200",
};

const ALIGNMENT_LABELS: Record<string, string> = {
  high: "Strong alignment",
  medium: "Some differences",
  low: "Needs discussion",
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-3xl font-bold text-foreground"
          data-testid="text-overall-score"
        >
          {score}
        </motion.div>
        <div className="text-xs text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ sessionCode: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: report, isLoading, isError } = useGetReport(params.sessionCode, {
    query: {
      enabled: !!params.sessionCode,
      queryKey: getGetReportQueryKey(params.sessionCode),
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Report link copied", description: "Share it with your partner" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-serif text-foreground mb-3">Report not ready yet</h2>
          <p className="text-muted-foreground mb-6">Both partners need to complete the questionnaire before the report is generated.</p>
          <Button onClick={() => setLocation("/")} variant="outline">Back to home</Button>
        </div>
      </div>
    );
  }

  const scoreLabel =
    report.overallScore >= 80 ? "Highly compatible" :
    report.overallScore >= 60 ? "Good compatibility" :
    report.overallScore >= 40 ? "Some differences" : "Worth discussing";

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent/40 via-background to-primary/5 border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft size={16} />
            Back to home
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Heart size={14} className="text-primary" />
              <span>{report.partner1Name} &amp; {report.partner2Name}</span>
            </div>
            <h1 className="text-4xl font-serif text-foreground mb-2">Your Compatibility Report</h1>
            <p className="text-muted-foreground mb-10">Based on 40 questions across 8 life dimensions</p>

            <div className="flex flex-col items-center">
              <ScoreRing score={report.overallScore} />
              <div className="mt-4">
                <div className="text-lg font-medium text-foreground">{scoreLabel}</div>
                <div className="text-sm text-muted-foreground">Overall compatibility score</div>
              </div>
            </div>

            <div className="mt-8 bg-card border border-border rounded-2xl p-6 text-left max-w-xl mx-auto">
              <p className="text-foreground leading-relaxed" data-testid="text-summary">{report.summary}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Category Scores */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-serif text-foreground mb-6">Scores by category</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {report.categoryScores.map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4"
                data-testid={`category-score-${cat.category}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[cat.alignment]}`}>
                    {ALIGNMENT_LABELS[cat.alignment]}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      cat.alignment === "high" ? "bg-green-500" :
                      cat.alignment === "medium" ? "bg-amber-500" : "bg-red-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="text-right text-xs text-muted-foreground mt-1">{cat.score}%</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Aligned Areas */}
        {report.alignedAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-green-600" />
              <h2 className="text-2xl font-serif text-foreground">Where you align</h2>
            </div>
            <div className="space-y-3">
              {report.alignedAreas.map((item, i) => (
                <motion.div
                  key={item.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="bg-green-50 border border-green-100 rounded-xl p-4"
                  data-testid={`aligned-item-${item.questionId}`}
                >
                  <p className="text-sm font-medium text-foreground mb-2">{item.questionText}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">{report.partner1Name}:</span> {item.partner1Answer}</span>
                    <span><span className="font-medium text-foreground">{report.partner2Name}:</span> {item.partner2Answer}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Differing Areas */}
        {report.differingAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={20} className="text-amber-600" />
              <h2 className="text-2xl font-serif text-foreground">Areas to explore</h2>
            </div>
            <div className="space-y-3">
              {report.differingAreas.map((item, i) => (
                <motion.div
                  key={item.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  className="bg-amber-50 border border-amber-100 rounded-xl p-4"
                  data-testid={`differing-item-${item.questionId}`}
                >
                  <p className="text-sm font-medium text-foreground mb-2">{item.questionText}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">{report.partner1Name}:</span> {item.partner1Answer}</span>
                    <span><span className="font-medium text-foreground">{report.partner2Name}:</span> {item.partner2Answer}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Discussion Prompts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={20} className="text-primary" />
            <h2 className="text-2xl font-serif text-foreground">Conversation starters</h2>
          </div>
          <div className="space-y-3">
            {report.discussionPrompts.map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
                className="bg-accent/30 border border-primary/10 rounded-xl p-4"
                data-testid={`discussion-prompt-${i}`}
              >
                <p className="text-sm text-foreground leading-relaxed">{prompt}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Share */}
        <div className="text-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleShare}
            data-testid="button-share-report"
            className="gap-2"
          >
            <Share2 size={16} />
            Share this report
          </Button>
        </div>
      </div>
    </div>
  );
}
