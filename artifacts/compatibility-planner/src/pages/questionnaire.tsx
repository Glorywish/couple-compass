import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save, CheckCircle2, Edit3, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useListQuestions, useSubmitResponses } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import type { LocaleData } from "@/locales/types";

type Answer = { questionId: number; value: string };

function answersKey(s: string, p: string) { return `cp_answers_${s}_${p}`; }
function phaseKey(s: string, p: string) { return `cp_phase_${s}_${p}`; }
function visitedKey(s: string, p: string) { return `cp_visited_${s}_${p}`; }

function loadAnswers(s: string, p: string): Map<number, string> {
  try {
    const raw = localStorage.getItem(answersKey(s, p));
    if (!raw) return new Map();
    const obj = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(obj).map(([k, v]) => [parseInt(k, 10), v]));
  } catch { return new Map(); }
}
function loadPhase(s: string, p: string): number {
  try { return parseInt(localStorage.getItem(phaseKey(s, p)) ?? "0", 10); } catch { return 0; }
}
function loadVisited(s: string, p: string): Set<number> {
  try {
    const raw = localStorage.getItem(visitedKey(s, p));
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set([0]);
  } catch { return new Set([0]); }
}
function saveAnswers(s: string, p: string, answers: Map<number, string>) {
  try {
    const obj: Record<string, string> = {};
    answers.forEach((v, k) => { obj[String(k)] = v; });
    localStorage.setItem(answersKey(s, p), JSON.stringify(obj));
  } catch { /* ignore */ }
}
function savePhase(s: string, p: string, i: number) {
  try { localStorage.setItem(phaseKey(s, p), String(i)); } catch { /* ignore */ }
}
function saveVisited(s: string, p: string, visited: Set<number>) {
  try { localStorage.setItem(visitedKey(s, p), JSON.stringify([...visited])); } catch { /* ignore */ }
}
function clearStorage(s: string, p: string) {
  try {
    [answersKey, phaseKey, visitedKey].forEach(fn => localStorage.removeItem(fn(s, p)));
  } catch { /* ignore */ }
}

function translateAnswer(questionId: number, value: string, questions: LocaleData["questions"]): string {
  const q = questions[questionId];
  if (!q || !q.options) return value || "—";
  const idx = parseInt(value, 10);
  if (!isNaN(idx) && idx >= 0 && idx < q.options.length) return q.options[idx];
  return value || "—";
}

// ─── Review screen ───────────────────────────────────────────────────────────
type ReviewProps = {
  categories: string[];
  allQuestions: Array<{ id: number; category: string; text: string; type: string; options: string | null; weight: number }>;
  answers: Map<number, string>;
  onEdit: (catIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  localeData: LocaleData;
};

function ReviewScreen({ categories, allQuestions, answers, onEdit, onSubmit, isSubmitting, localeData }: ReviewProps) {
  const t = localeData.ui;
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-lg font-serif text-foreground">Review your answers</h1>
          <p className="text-xs text-muted-foreground">Check everything before submitting</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {categories.map((cat, catIdx) => {
          const catLabel = t.categories[cat as keyof typeof t.categories] ?? cat;
          const catQs = allQuestions.filter(q => q.category === cat);
          const allAnswered = catQs.every(q =>
            q.type === "choice" ? answers.has(q.id) && answers.get(q.id) !== "" : answers.has(q.id)
          );

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.06 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-accent/20">
                <div className="flex items-center gap-2">
                  {allAnswered
                    ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0" />
                  }
                  <span className="text-sm font-semibold text-foreground">{catLabel}</span>
                </div>
                <button
                  onClick={() => onEdit(catIdx)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Edit3 size={11} />
                  Edit
                </button>
              </div>

              {/* Answers */}
              <div className="divide-y divide-border">
                {catQs.map(q => {
                  const qText = localeData.questions[q.id]?.text ?? q.text;
                  const val = answers.get(q.id);
                  const displayVal = val !== undefined
                    ? q.type === "choice"
                      ? translateAnswer(q.id, val, localeData.questions)
                      : q.type === "scale"
                        ? `${val} / 5`
                        : val || <span className="italic text-muted-foreground">No response</span>
                    : <span className="italic text-amber-600">Not answered</span>;

                  return (
                    <div key={q.id} className="px-5 py-3">
                      <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{qText}</p>
                      <p className="text-sm font-medium text-foreground">{displayVal}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Submit button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting}
              data-testid="button-confirm-submit"
              className="w-full py-6 h-auto text-base gap-2"
            >
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main questionnaire page ──────────────────────────────────────────────────
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

  const [answers, setAnswers] = useState<Map<number, string>>(() =>
    loadAnswers(params.sessionCode, params.partnerSlot)
  );
  const [categoryIndex, setCategoryIndex] = useState(() =>
    loadPhase(params.sessionCode, params.partnerSlot)
  );
  const [visitedPhases, setVisitedPhases] = useState<Set<number>>(() =>
    loadVisited(params.sessionCode, params.partnerSlot)
  );
  const [direction, setDirection] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showRestored, setShowRestored] = useState(() => {
    const savedPhase = loadPhase(params.sessionCode, params.partnerSlot);
    const savedAnswers = loadAnswers(params.sessionCode, params.partnerSlot);
    return savedPhase > 0 || savedAnswers.size > 3;
  });

  const categories = allQuestions ? [...new Set(allQuestions.map(q => q.category))] : [];
  const currentCategory = categories[categoryIndex] ?? "";
  const categoryQuestions = allQuestions?.filter(q => q.category === currentCategory) ?? [];
  const totalCategories = categories.length;

  // Clamp restored categoryIndex once questions load
  useEffect(() => {
    if (categories.length > 0 && categoryIndex >= categories.length) {
      setCategoryIndex(categories.length - 1);
    }
  }, [categories.length]);

  // Auto-register defaults for visited phase
  useEffect(() => {
    if (!allQuestions || categoryQuestions.length === 0) return;
    setAnswers(prev => {
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
    // Mark this phase as visited
    setVisitedPhases(prev => {
      if (prev.has(categoryIndex)) return prev;
      const next = new Set(prev);
      next.add(categoryIndex);
      return next;
    });
  }, [categoryIndex, allQuestions]);

  // Persist answers
  useEffect(() => {
    if (answers.size === 0) return;
    saveAnswers(params.sessionCode, params.partnerSlot, answers);
    setLastSaved(new Date());
  }, [answers]);

  // Persist phase
  useEffect(() => {
    savePhase(params.sessionCode, params.partnerSlot, categoryIndex);
  }, [categoryIndex]);

  // Persist visited set
  useEffect(() => {
    saveVisited(params.sessionCode, params.partnerSlot, visitedPhases);
  }, [visitedPhases]);

  const setAnswer = useCallback((questionId: number, value: string) => {
    setAnswers(prev => new Map(prev).set(questionId, value));
  }, []);

  const navigateTo = (index: number, dir?: number) => {
    setDirection(dir ?? (index > categoryIndex ? 1 : -1));
    setCategoryIndex(index);
    setShowRestored(false);
    setShowReview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCategoryComplete = useCallback((catIndex: number): boolean => {
    if (!allQuestions || !categories[catIndex]) return false;
    const qs = allQuestions.filter(q => q.category === categories[catIndex]);
    return qs.every(q =>
      q.type === "choice" ? answers.has(q.id) && answers.get(q.id) !== "" : answers.has(q.id)
    );
  }, [allQuestions, categories, answers]);

  const allPhasesComplete = categories.length > 0 &&
    categories.every((_, i) => isCategoryComplete(i));

  const allCurrentAnswered = categoryQuestions.every(q =>
    q.type === "choice" ? answers.has(q.id) && answers.get(q.id) !== "" : answers.has(q.id)
  );

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) {
      navigateTo(categoryIndex + 1, 1);
    } else {
      // Last phase — go to review
      setShowReview(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (showReview) { setShowReview(false); return; }
    if (categoryIndex > 0) navigateTo(categoryIndex - 1, -1);
  };

  const handleSubmit = () => {
    const answerArray: Answer[] = Array.from(answers.entries()).map(([questionId, value]) => ({
      questionId, value,
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

  // ── Review mode ──────────────────────────────────────────────────────────
  if (showReview && allQuestions) {
    return (
      <ReviewScreen
        categories={categories}
        allQuestions={allQuestions}
        answers={answers}
        onEdit={(catIdx) => navigateTo(catIdx)}
        onSubmit={handleSubmit}
        isSubmitting={submitResponses.isPending}
        localeData={data}
      />
    );
  }

  const categoryLabel = data.ui.categories[currentCategory as keyof typeof data.ui.categories] ?? currentCategory;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header with clickable phase segments */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto w-full px-6 py-3">
          {/* Phase bar — ALL phases clickable */}
          <div className="flex gap-1.5 mb-2">
            {categories.map((cat, i) => {
              const label = data.ui.categories[cat as keyof typeof data.ui.categories] ?? cat;
              const isCurrent = i === categoryIndex;
              const isVisited = visitedPhases.has(i);
              const isComplete = isCategoryComplete(i);

              return (
                <button
                  key={i}
                  onClick={() => navigateTo(i)}
                  title={label}
                  data-testid={`phase-tab-${i}`}
                  aria-label={`Go to ${label}`}
                  className={`group relative flex-1 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${
                    isCurrent
                      ? "h-2.5 bg-primary/70"
                      : isComplete
                      ? "h-2 bg-primary hover:h-2.5 hover:bg-primary/80"
                      : isVisited
                      ? "h-2 bg-primary/40 hover:h-2.5 hover:bg-primary/60"
                      : "h-2 bg-muted hover:h-2.5 hover:bg-muted-foreground/40"
                  }`}
                >
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30">
                    {isComplete ? "✓ " : ""}{label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phase label + meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {categoryLabel}
              </span>
              {isCategoryComplete(categoryIndex) && !showReview && (
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
              <button onClick={() => setShowRestored(false)} className="text-muted-foreground hover:text-foreground text-xs shrink-0">✕</button>
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
                          {[1, 2, 3, 4, 5].map(v => (
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
                        onChange={e => setAnswer(q.id, e.target.value)}
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
            {categoryIndex === totalCategories - 1
              ? (allPhasesComplete ? "Review & Submit" : data.ui.submit)
              : data.ui.next}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
