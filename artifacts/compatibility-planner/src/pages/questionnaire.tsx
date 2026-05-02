import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useListQuestions, useSubmitResponses } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_LABELS: Record<string, string> = {
  values: "Core Values",
  life_plans: "Life Plans",
  finances: "Finances",
  family: "Family & Children",
  lifestyle: "Lifestyle",
  communication: "Communication",
  intimacy: "Intimacy & Affection",
  growth: "Personal Growth",
};

const SCALE_LABELS = ["Not at all", "Slightly", "Moderately", "Very", "Extremely"];

type Answer = { questionId: number; value: string };

export default function QuestionnairePage() {
  const params = useParams<{ sessionCode: string; partnerSlot: string }>();
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const nameFromUrl = urlParams.get("name") ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: allQuestions, isLoading } = useListQuestions();
  const submitResponses = useSubmitResponses();

  const [partnerName] = useState(nameFromUrl);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [direction, setDirection] = useState(1);

  const categories = allQuestions
    ? [...new Set(allQuestions.map((q) => q.category))]
    : [];

  const currentCategory = categories[categoryIndex] ?? "";
  const categoryQuestions = allQuestions?.filter((q) => q.category === currentCategory) ?? [];
  const totalCategories = categories.length;

  const allCurrentAnswered = categoryQuestions.every((q) => answers.has(q.id));

  const setAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, value));
  };

  const handleNext = () => {
    if (categoryIndex < totalCategories - 1) {
      setDirection(1);
      setCategoryIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (categoryIndex > 0) {
      setDirection(-1);
      setCategoryIndex((i) => i - 1);
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
          partnerName: partnerName || (params.partnerSlot === "partner1" ? "Partner 1" : "Partner 2"),
          answers: answerArray,
        },
      },
      {
        onSuccess: () => {
          setLocation(`/waiting/${params.sessionCode}/${params.partnerSlot}`);
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((categoryIndex) / totalCategories) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top progress bar */}
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
              {CATEGORY_LABELS[currentCategory] ?? currentCategory}
            </span>
            <span className="text-xs text-muted-foreground">
              {categoryIndex + 1} of {totalCategories}
            </span>
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
              <h2 className="text-2xl font-serif text-foreground mb-6">
                {CATEGORY_LABELS[currentCategory] ?? currentCategory}
              </h2>
              {categoryQuestions.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                  className="bg-card border border-border rounded-2xl p-6"
                  data-testid={`question-card-${q.id}`}
                >
                  <p className="text-foreground font-medium mb-4 leading-relaxed">{q.text}</p>

                  {q.type === "scale" && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-3">
                        <span>Not at all</span>
                        <span>Extremely</span>
                      </div>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={answers.has(q.id) ? [parseInt(answers.get(q.id)!)] : [3]}
                        onValueChange={([v]) => setAnswer(q.id, String(v))}
                        data-testid={`slider-${q.id}`}
                        className="mb-2"
                      />
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <span
                            key={v}
                            className={`text-xs transition-colors ${
                              answers.get(q.id) === String(v) ? "text-primary font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                      {!answers.has(q.id) && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Move the slider to record your answer</p>
                      )}
                    </div>
                  )}

                  {q.type === "choice" && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => setAnswer(q.id, opt)}
                          data-testid={`choice-${q.id}-${opt}`}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                            answers.get(q.id) === opt
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
                      placeholder="Share your thoughts..."
                      data-testid={`textarea-${q.id}`}
                      className="min-h-[100px] resize-none"
                    />
                  )}
                </motion.div>
              ))}
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
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!allCurrentAnswered || submitResponses.isPending}
            data-testid="button-next-category"
            className="flex-1 gap-2"
          >
            {submitResponses.isPending
              ? "Submitting..."
              : categoryIndex === totalCategories - 1
              ? "Submit answers"
              : "Next section"}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
