import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save, Check, Edit3, Send } from "lucide-react";
import { useListQuestions, useSubmitResponses } from "@workspace/api-client-react";
import type { Question } from "@workspace/api-client-react";
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

// ─── Review screen ─────────────────────────────────────────────────────────────
type ReviewProps = {
  categories: string[];
  allQuestions: Question[];
  answers: Map<number, string>;
  onEdit: (catIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  localeData: LocaleData;
};

function ReviewScreen({ categories, allQuestions, answers, onEdit, onSubmit, isSubmitting, localeData }: ReviewProps) {
  const t = localeData.ui;
  const tq = t.questionnaire;
  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f0", color: "#1a3560", paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(248,244,240,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(184,212,240,0.4)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.15rem", color: "#1a3560", marginBottom: 2 }}>{tq.reviewTitle}</h1>
          <p style={{ fontSize: "0.7rem", color: "rgba(26,53,96,0.4)", letterSpacing: "0.06em" }}>{tq.reviewDesc}</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {categories.map((cat, catIdx) => {
          const catLabel = t.categories[cat as keyof typeof t.categories] ?? cat;
          const catQs = allQuestions.filter(q => q.category === cat);
          const allAnswered = catQs.every(q =>
            q.type === "choice" ? answers.has(q.id) && answers.get(q.id) !== "" : answers.has(q.id)
          );
          return (
            <motion.div key={cat}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05 }}
              style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(26,53,96,0.05)" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid rgba(184,212,240,0.25)", background: "rgba(234,243,255,0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {allAnswered
                    ? <Check size={13} color="#e8607a" />
                    : <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #d4a853" }} />
                  }
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a3560" }}>{catLabel}</span>
                </div>
                <button onClick={() => onEdit(catIdx)}
                  style={{ background: "rgba(232,96,122,0.09)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 7, padding: "4px 12px", color: "#e8607a", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <Edit3 size={10} /> {tq.editBtn}
                </button>
              </div>
              <div>
                {catQs.map((q, qi) => {
                  const qText = localeData.questions[q.id]?.text ?? q.text;
                  const val = answers.get(q.id);
                  const displayVal = val !== undefined
                    ? q.type === "choice" ? translateAnswer(q.id, val, localeData.questions)
                    : q.type === "scale" ? `${val} / 5`
                    : val || tq.notAnswered
                    : tq.notAnswered;
                  return (
                    <div key={q.id} style={{ padding: "12px 18px", borderBottom: qi < catQs.length - 1 ? "1px solid rgba(184,212,240,0.2)" : "none" }}>
                      <p style={{ fontSize: "0.74rem", color: "rgba(26,53,96,0.45)", marginBottom: 4, lineHeight: 1.5 }}>{qText}</p>
                      <p style={{ fontSize: "0.88rem", color: val ? "#1a3560" : "#d4a853", fontWeight: 500 }}>{displayVal}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(248,244,240,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(184,212,240,0.4)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <button onClick={onSubmit} disabled={isSubmitting}
            data-testid="button-confirm-submit"
            style={{
              width: "100%", background: isSubmitting ? "rgba(232,96,122,0.4)" : "#e8607a", color: "white",
              border: "none", borderRadius: 12, padding: "15px 28px",
              fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(232,96,122,0.3)",
            }}>
            {isSubmitting ? t.submitting : tq.confirmSubmit} <Send size={15} />
          </button>
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

  const partnerName = nameFromUrl || (params.partnerSlot === "partner1" ? t.partner1 : t.partner2);

  const [answers, setAnswers] = useState<Map<number, string>>(() => loadAnswers(params.sessionCode, params.partnerSlot));
  const [categoryIndex, setCategoryIndex] = useState(() => loadPhase(params.sessionCode, params.partnerSlot));
  const [visitedPhases, setVisitedPhases] = useState<Set<number>>(() => loadVisited(params.sessionCode, params.partnerSlot));
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

  useEffect(() => {
    if (categories.length > 0 && categoryIndex >= categories.length)
      setCategoryIndex(categories.length - 1);
  }, [categories.length]);

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
    setVisitedPhases(prev => {
      if (prev.has(categoryIndex)) return prev;
      const next = new Set(prev); next.add(categoryIndex); return next;
    });
  }, [categoryIndex, allQuestions]);

  useEffect(() => {
    if (answers.size === 0) return;
    saveAnswers(params.sessionCode, params.partnerSlot, answers);
    setLastSaved(new Date());
  }, [answers]);

  useEffect(() => { savePhase(params.sessionCode, params.partnerSlot, categoryIndex); }, [categoryIndex]);
  useEffect(() => { saveVisited(params.sessionCode, params.partnerSlot, visitedPhases); }, [visitedPhases]);

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

  const allPhasesComplete = categories.length > 0 && categories.every((_, i) => isCategoryComplete(i));

  const allCurrentAnswered = categoryQuestions.every(q =>
    q.type === "choice" ? answers.has(q.id) && answers.get(q.id) !== "" : answers.has(q.id)
  );

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) navigateTo(categoryIndex + 1, 1);
    else { setShowReview(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleBack = () => {
    if (showReview) { setShowReview(false); return; }
    if (categoryIndex > 0) navigateTo(categoryIndex - 1, -1);
  };

  const handleSubmit = () => {
    const answerArray: Answer[] = Array.from(answers.entries()).map(([questionId, value]) => ({ questionId, value }));
    submitResponses.mutate(
      { sessionCode: params.sessionCode, data: { partnerSlot: params.partnerSlot as "partner1" | "partner2", partnerName, answers: answerArray } },
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

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid rgba(232,96,122,0.25)", borderTopColor: "#e8607a", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "rgba(26,53,96,0.45)", fontSize: "0.88rem" }}>{t.loading}</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (showReview && allQuestions) {
    return (
      <ReviewScreen categories={categories} allQuestions={allQuestions} answers={answers}
        onEdit={(catIdx) => navigateTo(catIdx)} onSubmit={handleSubmit}
        isSubmitting={submitResponses.isPending} localeData={data} />
    );
  }

  const categoryLabel = data.ui.categories[currentCategory as keyof typeof data.ui.categories] ?? currentCategory;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4f0", color: "#1a3560", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(248,244,240,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(184,212,240,0.35)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {categories.map((cat, i) => {
              const label = data.ui.categories[cat as keyof typeof data.ui.categories] ?? cat;
              const isCurrent = i === categoryIndex;
              const isComplete = isCategoryComplete(i);
              const isVisited = visitedPhases.has(i);
              let bg = "rgba(184,212,240,0.35)";
              if (isCurrent) bg = "#e8607a";
              else if (isComplete) bg = "rgba(232,96,122,0.45)";
              else if (isVisited) bg = "rgba(232,96,122,0.2)";
              return (
                <button key={i} onClick={() => navigateTo(i)}
                  title={label}
                  data-testid={`phase-tab-${i}`}
                  aria-label={label}
                  style={{ flex: 1, height: isCurrent ? 6 : 4, borderRadius: 999, background: bg, border: "none", cursor: "pointer", transition: "all 0.2s ease" }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e8607a" }}>
                {categoryLabel}
              </span>
              {isCategoryComplete(categoryIndex) && <Check size={11} color="#e8607a" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {lastSaved && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.66rem", color: "rgba(26,53,96,0.3)" }}>
                  <Save size={9} /> {t.saved}
                </span>
              )}
              <span style={{ fontSize: "0.66rem", color: "rgba(26,53,96,0.35)", letterSpacing: "0.05em" }}>
                {categoryIndex + 1} / {totalCategories}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "32px 20px 120px", flex: 1 }}>

        <AnimatePresence>
          {showRestored && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{ background: "rgba(232,96,122,0.08)", border: "1px solid rgba(232,96,122,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#e8607a" }}>
                <Save size={12} /> {t.restored}
              </div>
              <button onClick={() => setShowRestored(false)} style={{ background: "none", border: "none", color: "rgba(26,53,96,0.3)", cursor: "pointer", fontSize: "0.85rem", padding: 0 }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={categoryIndex} custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px,5vw,34px)", color: "#1a3560", marginBottom: 28, lineHeight: 1.15 }}>
              {categoryLabel}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {categoryQuestions.map((q, idx) => {
                const qTranslation = data.questions[q.id];
                const questionText = qTranslation?.text ?? q.text;
                const questionOptions = qTranslation?.options ?? (q.options ?? null);

                return (
                  <motion.div key={q.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    data-testid={`question-card-${q.id}`}
                    style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 16, padding: "22px 20px", boxShadow: "0 2px 14px rgba(26,53,96,0.05)" }}
                  >
                    <p style={{ fontSize: "0.95rem", color: "#1a3560", fontWeight: 500, marginBottom: 18, lineHeight: 1.65 }}>
                      {questionText}
                    </p>

                    {/* Scale */}
                    {q.type === "scale" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "rgba(26,53,96,0.4)", marginBottom: 12 }}>
                          <span>{t.scaleMin}</span>
                          <span>{t.scaleMax}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          {[1, 2, 3, 4, 5].map(v => {
                            const selected = answers.get(q.id) === String(v);
                            return (
                              <button key={v} onClick={() => setAnswer(q.id, String(v))}
                                data-testid={`scale-btn-${q.id}-${v}`}
                                style={{
                                  flex: 1, aspectRatio: "1", borderRadius: 12,
                                  background: selected ? "#e8607a" : "rgba(234,243,255,0.7)",
                                  border: selected ? "1px solid #e8607a" : "1px solid rgba(184,212,240,0.5)",
                                  color: selected ? "white" : "rgba(26,53,96,0.5)",
                                  fontSize: "0.95rem", fontWeight: selected ? 700 : 400,
                                  cursor: "pointer", transition: "all 0.15s", fontFamily: "Inter,sans-serif",
                                  transform: selected ? "scale(1.07)" : "scale(1)",
                                  boxShadow: selected ? "0 3px 12px rgba(232,96,122,0.3)" : "none",
                                }}>
                                {v}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Choice */}
                    {q.type === "choice" && questionOptions && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {questionOptions.map((opt: string, optIdx: number) => {
                          const selected = answers.get(q.id) === String(optIdx);
                          return (
                            <button key={optIdx} onClick={() => setAnswer(q.id, String(optIdx))}
                              data-testid={`choice-${q.id}-${optIdx}`}
                              style={{
                                textAlign: "left", padding: "12px 16px", borderRadius: 11,
                                background: selected ? "rgba(232,96,122,0.07)" : "rgba(234,243,255,0.5)",
                                border: `1px solid ${selected ? "rgba(232,96,122,0.4)" : "rgba(184,212,240,0.5)"}`,
                                color: selected ? "#c03050" : "rgba(26,53,96,0.7)",
                                fontSize: "0.88rem", fontWeight: selected ? 500 : 400,
                                cursor: "pointer", transition: "all 0.15s", fontFamily: "Inter,sans-serif",
                                display: "flex", alignItems: "center", gap: 10,
                              }}>
                              <span style={{
                                width: 18, height: 18, borderRadius: "50%",
                                border: `1.5px solid ${selected ? "#e8607a" : "rgba(184,212,240,0.8)"}`,
                                background: selected ? "#e8607a" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, transition: "all 0.15s",
                              }}>
                                {selected && <Check size={10} color="white" />}
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Open text */}
                    {q.type === "open" && (
                      <textarea
                        value={answers.get(q.id) ?? ""}
                        onChange={e => setAnswer(q.id, e.target.value)}
                        placeholder={t.placeholder}
                        data-testid={`open-${q.id}`}
                        rows={3}
                        style={{
                          width: "100%", background: "rgba(234,243,255,0.5)", border: "1px solid rgba(184,212,240,0.5)",
                          borderRadius: 11, padding: "12px 14px", color: "#1a3560", fontSize: "0.9rem",
                          fontFamily: "'DM Serif Display',serif", outline: "none", resize: "vertical",
                          boxSizing: "border-box", lineHeight: 1.7,
                        }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(248,244,240,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(184,212,240,0.4)", padding: "14px 20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 10 }}>
          {categoryIndex > 0 && (
            <motion.button onClick={handleBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              data-testid="button-back"
              style={{ flex: "0 0 auto", background: "white", border: "1px solid rgba(184,212,240,0.6)", borderRadius: 11, padding: "12px 20px", color: "rgba(26,53,96,0.5)", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", gap: 7, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <ArrowLeft size={13} /> {data.ui.back}
            </motion.button>
          )}
          <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            data-testid="button-next"
            style={{
              flex: 1, background: "#e8607a", color: "white", border: "none", borderRadius: 11,
              padding: "12px 24px", fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(232,96,122,0.28)",
            }}>
            {categoryIndex < totalCategories - 1 ? data.ui.next : data.ui.submit}
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
