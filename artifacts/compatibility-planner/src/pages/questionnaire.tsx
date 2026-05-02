import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useListQuestions, useSubmitResponses } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

type Answer = { questionId: number; value: string };

function storageKey(sessionCode: string, partnerSlot: string) {
  return `cp_answers_${sessionCode}_${partnerSlot}`;
}

function loadFromStorage(sessionCode: string, partnerSlot: string): Map<number, string> {
  try {
    const raw = localStorage.getItem(storageKey(sessionCode, partnerSlot));
    if (!raw) return new Map();
    const obj = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(obj).map(([k, v]) => [parseInt(k, 10), v]));
  } catch {
    return new Map();
  }
}

function saveToStorage(sessionCode: string, partnerSlot: string, answers: Map<number, string>) {
  try {
    const obj: Record<string, string> = {};
    answers.forEach((v, k) => { obj[String(k)] = v; });
    localStorage.setItem(storageKey(sessionCode, partnerSlot), JSON.stringify(obj));
  } catch { /* ignore */ }
}

function clearStorage(sessionCode: string, partnerSlot: string) {
  try { localStorage.removeItem(storageKey(sessionCode, partnerSlot)); } catch { /* ignore */ }
}

export default function QuestionnairePage() {
  const params = useParams<{ sessionCode: string; partnerSlot: string }>();
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const nameFromUrl = urlParams.get("name") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data } = useI18n();
  const t = data.ui.questionnaire;

  const { data: allQuestions, isLoading } = useListQuestions();
  const submitResponses = useSubmitResponses();

  const partnerName = nameFromUrl || (params.partnerSlot === "partner1" ? "Partner 1" : "Partner 2");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(() =>
    loadFromStorage(params.sessionCode, params.partnerSlot)
  );
  const [direction, setDirection] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const categories = allQuestions
    ? [...new Set(allQuestions.map((q) => q.category))]
    : [];

  const currentCategory = categories[categoryIndex] ?? "";
  const categoryQuestions = allQuestions?.filter((q) => q.category === currentCategory) ?? [];
  const totalCategories = categories.length;

  // Auto-register defaults: scale→"3", open→""
  useEffect(() => {
    if (!allQuestions || categoryQuestions.length === 0) return;
    setAnswers((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const q of categoryQuestions) {
        if (!next.has(q.id)) {
          if (q.type === "scale") { next.set(q.id, "3"); changed = true; }
          else if (q.type === "open") { next.set(q.id, ""); changed = true; }
        }
      }
      return changed ? next : prev;
    });
  }, [categoryIndex, allQuestions]);

  // Persist to localStorage
  useEffect(() => {
    if (answers.size === 0) return;
    saveToStorage(params.sessionCode, params.partnerSlot, answers);
    setLastSaved(new Date());
  }, [answers]);

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, value));
  }, []);

  // Only choice questions block progression
  const allCurrentAnswered = categoryQuestions.every((q) => {
    if (q.type === "choice") return answers.has(q.id) && answers.get(q.id) !== "";
    return answers.has(q.id);
  });

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) {
      setDirection(1);
      setCategoryIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (categoryIndex > 0) {
      setDirection(-1);
      setCategoryIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    const answerArray: Answer[] = Array.from(answers.entries()).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    submitResponses.mutate(
      {
        sessionCode: params.sessionCode,
        data: {
          partnerSlot: params.partnerSlot as "partner1" | "partner2",
          partnerName,
          answers: answerArray,
        },
      },
      {
        onSuccess: () => {
          clearStorage(params.sessionCode, params.partnerSlot);
          setLocation(`/waiting/${params.sessionCode}/${params.partnerSlot}`);
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : data.ui.errors.tryAgain;
          toast({ title: data.ui.errors.submitFailed, description: message, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  const progress = (categoryIndex / Math.max(1, totalCategories)) * 100;
  const categoryLabel = data.ui.categories[currentCategory as keyof typeof data.ui.categories] ?? currentCategory;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {categoryLabel}
            </span>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Save size={10} />
                  {t.saved}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {categoryIndex + 1} {t.of} {totalCategories}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {categories.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < categoryIndex ? "bg-primary" : i === categoryIndex ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Restored notice */}
        {answers.size > 5 && categoryIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/40 border border-primary/10 rounded-xl px-4 py-3 mb-6 text-sm text-foreground flex items-center gap-2"
          >
            <Save size={14} className="text-primary shrink-0" />
            {t.restored}
          </motion.div>
        )}

        {/* Questions */}
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={categoryIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-serif text-foreground mb-6">{categoryLabel}</h2>

              {categoryQuestions.map((q, idx) => {
                const qTranslation = data.questions[q.id];
                const questionText = qTranslation?.text ?? q.text;
                const questionOptions = qTranslation?.options ?? (q.options ? JSON.parse(q.options) : null);

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    className="bg-card border border-border rounded-2xl p-6"
                    data-testid={`question-card-${q.id}`}
                  >
                    <p className="text-foreground font-medium mb-4 leading-relaxed">{questionText}</p>

                    {q.type === "scale" && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-3">
                          <span>{t.scaleMin}</span>
                          <span>{t.scaleMax}</span>
                        </div>
                        <Slider
                          min={1} max={5} step={1}
                          value={[parseInt(answers.get(q.id) ?? "3", 10)]}
                          onValueChange={([v]) => setAnswer(q.id, String(v))}
                          data-testid={`slider-${q.id}`}
                          className="mb-3"
                        />
                        <div className="flex justify-between px-0.5">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button
                              key={v}
                              onClick={() => setAnswer(q.id, String(v))}
                              data-testid={`scale-btn-${q.id}-${v}`}
                              className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-150 ${
                                answers.get(q.id) === String(v)
                                  ? "bg-primary text-primary-foreground scale-110"
                                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === "choice" && questionOptions && (
                      <div className="space-y-2">
                        {questionOptions.map((opt: string, optIdx: number) => (
                          <button
                            key={optIdx}
                            onClick={() => setAnswer(q.id, String(optIdx))}
                            data-testid={`choice-${q.id}-${optIdx}`}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                              answers.get(q.id) === String(optIdx)
                                ? "border-primary bg-accent text-primary font-medium"
                                : "border-border bg-background hover:bg-accent/40 text-foreground"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === "open" && (
                      <Textarea
                        value={answers.get(q.id) ?? ""}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        placeholder={t.placeholder}
                        data-testid={`textarea-${q.id}`}
                        className="min-h-[100px] resize-none"
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-10 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={categoryIndex === 0}
            data-testid="button-prev-category"
            className="gap-2"
          >
            <ArrowLeft size={16} />
            {data.ui.back}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!allCurrentAnswered || submitResponses.isPending}
            data-testid="button-next-category"
            className="flex-1 gap-2"
          >
            {submitResponses.isPending
              ? data.ui.submitting
              : categoryIndex === totalCategories - 1
              ? data.ui.submit
              : data.ui.next}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
