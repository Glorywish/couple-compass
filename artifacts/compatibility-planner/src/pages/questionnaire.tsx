import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useListQuestions, useSubmitResponses } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

type Answer = { questionId: number; value: string };

function answersKey(sessionCode: string, partnerSlot: string) {
  return `cp_answers_${sessionCode}_${partnerSlot}`;
}
function phaseKey(sessionCode: string, partnerSlot: string) {
  return `cp_phase_${sessionCode}_${partnerSlot}`;
}

function loadAnswers(sessionCode: string, partnerSlot: string): Map<number, string> {
  try {
    const raw = localStorage.getItem(answersKey(sessionCode, partnerSlot));
    if (!raw) return new Map();
    const obj = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(obj).map(([k, v]) => [parseInt(k, 10), v]));
  } catch {
    return new Map();
  }
}

function loadPhase(sessionCode: string, partnerSlot: string): number {
  try {
    const raw = localStorage.getItem(phaseKey(sessionCode, partnerSlot));
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveAnswers(sessionCode: string, partnerSlot: string, answers: Map<number, string>) {
  try {
    const obj: Record<string, string> = {};
    answers.forEach((v, k) => { obj[String(k)] = v; });
    localStorage.setItem(answersKey(sessionCode, partnerSlot), JSON.stringify(obj));
  } catch { /* ignore */ }
}

function savePhase(sessionCode: string, partnerSlot: string, index: number) {
  try {
    localStorage.setItem(phaseKey(sessionCode, partnerSlot), String(index));
  } catch { /* ignore */ }
}

function clearStorage(sessionCode: string, partnerSlot: string) {
  try {
    localStorage.removeItem(answersKey(sessionCode, partnerSlot));
    localStorage.removeItem(phaseKey(sessionCode, partnerSlot));
  } catch { /* ignore */ }
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

  // Restore both answers AND phase from localStorage on first load
  const [answers, setAnswers] = useState<Map<number, string>>(() =>
    loadAnswers(params.sessionCode, params.partnerSlot)
  );
  const [categoryIndex, setCategoryIndex] = useState(() =>
    loadPhase(params.sessionCode, params.partnerSlot)
  );
  const [direction, setDirection] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showRestored, setShowRestored] = useState(() => {
    // Show restored notice if they had prior progress
    const savedPhase = loadPhase(params.sessionCode, params.partnerSlot);
    const savedAnswers = loadAnswers(params.sessionCode, params.partnerSlot);
    return savedPhase > 0 || savedAnswers.size > 3;
  });

  const categories = allQuestions
    ? [...new Set(allQuestions.map((q) => q.category))]
    : [];

  const currentCategory = categories[categoryIndex] ?? "";
  const categoryQuestions = allQuestions?.filter((q) => q.category === currentCategory) ?? [];
  const totalCategories = categories.length;

  // Clamp restored categoryIndex once questions load (in case categories changed)
  useEffect(() => {
    if (categories.length > 0 && categoryIndex >= categories.length) {
      setCategoryIndex(categories.length - 1);
    }
  }, [categories.length]);

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

  // Persist answers to localStorage
  useEffect(() => {
    if (answers.size === 0) return;
    saveAnswers(params.sessionCode, params.partnerSlot, answers);
    setLastSaved(new Date());
  }, [answers]);

  // Persist phase to localStorage
  useEffect(() => {
    savePhase(params.sessionCode, params.partnerSlot, categoryIndex);
  }, [categoryIndex]);

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, value));
  }, []);

  const navigateTo = (index: number, dir: number) => {
    setDirection(dir);
    setCategoryIndex(index);
    setShowRestored(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Only choice questions block progression
  const allCurrentAnswered = categoryQuestions.every((q) => {
    if (q.type === "choice") return answers.has(q.id) && answers.get(q.id) !== "";
    return answers.has(q.id);
  });

  // Check if a given category index has all its questions answered
  const isCategoryComplete = useCallback((catIndex: number): boolean => {
    if (!allQuestions || !categories[catIndex]) return false;
    const catQuestions = allQuestions.filter((q) => q.category === categories[catIndex]);
    return catQuestions.every((q) => {
      if (q.type === "choice") return answers.has(q.id) && answers.get(q.id) !== "";
      return answers.has(q.id);
    });
  }, [allQuestions, categories, answers]);

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) {
      navigateTo(categoryIndex + 1, 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (categoryIndex > 0) {
      navigateTo(categoryIndex - 1, -1);
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

  const categoryLabel = data.ui.categories[currentCategory as keyof typeof data.ui.categories] ?? currentCategory;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top sticky header with phase nav */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto w-full px-6 py-3">
          {/* Phase segments — past ones are clickable */}
          <div className="flex gap-1.5 mb-2">
            {categories.map((cat, i) => {
              const label = data.ui.categories[cat as keyof typeof data.ui.categories] ?? cat;
              const isPast = i < categoryIndex;
              const isCurrent = i === categoryIndex;
              const completed = isCategoryComplete(i);

              return (
                <button
                  key={i}
                  onClick={() => isPast && navigateTo(i, -1)}
                  disabled={!isPast}
                  title={label}
                  data-testid={`phase-tab-${i}`}
                  aria-label={`Go to ${label}`}
                  className={`group relative h-2 flex-1 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCurrent
                      ? "bg-primary/60"
                      : isPast
                      ? "bg-primary cursor-pointer hover:bg-primary/80 hover:h-3"
                      : "bg-muted cursor-default"
                  }`}
                >
                  {/* Tooltip on hover for past/current phases */}
                  {(isPast || isCurrent) && (
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30">
                      {completed && isPast && "✓ "}{label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current phase label + counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {categoryLabel}
              </span>
              {isCategoryComplete(categoryIndex) && categoryIndex < totalCategories - 1 && (
                <CheckCircle2 size={12} className="text-green-500" />
              )}
            </div>
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
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {/* Restored notice */}
        <AnimatePresence>
          {showRestored && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="bg-accent/50 border border-primary/15 rounded-xl px-4 py-3 mb-6 text-sm text-foreground flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Save size={14} className="text-primary shrink-0" />
                <span>{t.restored}</span>
              </div>
              <button
                onClick={() => setShowRestored(false)}
                className="text-muted-foreground hover:text-foreground text-xs shrink-0"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
