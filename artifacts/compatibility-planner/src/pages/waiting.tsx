import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useGetSessionStatus, getGetSessionStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

export default function WaitingPage() {
  const params = useParams<{ sessionCode: string; partnerSlot: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data } = useI18n();
  const t = data.ui.waiting;

  const { data: status } = useGetSessionStatus(params.sessionCode, {
    query: {
      enabled: !!params.sessionCode,
      queryKey: getGetSessionStatusQueryKey(params.sessionCode),
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (status?.bothCompleted) {
      setLocation(`/report/${params.sessionCode}`);
    }
  }, [status?.bothCompleted]);

  const mySlot = params.partnerSlot;
  const myName = mySlot === "partner1" ? status?.partner1Name : status?.partner2Name;
  const partnerName = mySlot === "partner1" ? status?.partner2Name : status?.partner1Name;
  const myDone = mySlot === "partner1" ? status?.partner1Completed : status?.partner2Completed;
  const partnerDone = mySlot === "partner1" ? status?.partner2Completed : status?.partner1Completed;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, hsl(353 55% 90% / 0.55) 0%, transparent 70%)" }}
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Pulsing heart */}
          <div className="relative mx-auto w-20 h-20 mb-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "hsl(353 55% 92%)" }}
            >
              <span
                className="text-3xl"
                style={{ color: "hsl(var(--primary))" }}
              >
                ♡
              </span>
            </motion.div>
          </div>

          <p
            className="text-[11px] uppercase tracking-[0.4em] font-sans mb-3"
            style={{ color: "#c9a96e" }}
          >
            {status?.bothCompleted ? "Complete" : "In Progress"}
          </p>

          <h1 className="text-4xl font-serif font-light text-foreground mb-3">
            {status?.bothCompleted ? t.titleDone : t.title}
          </h1>
          <p className="text-muted-foreground mb-12 leading-relaxed font-sans text-sm">
            {status?.bothCompleted ? t.descDone : t.desc}
          </p>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { name: myName ?? "You", done: myDone, testId: "status-partner1" },
              { name: partnerName ?? "Partner", done: partnerDone, testId: "status-partner2" },
            ].map(({ name, done, testId }) => (
              <div
                key={testId}
                className="border p-5 transition-all duration-500"
                style={{
                  borderRadius: "3px",
                  borderColor: done ? "hsl(var(--primary)/0.35)" : "hsl(var(--border))",
                  background: done ? "hsl(353 55% 96%)" : "hsl(var(--card))",
                  borderLeft: `3px solid ${done ? "#c9a96e" : "hsl(var(--border))"}`,
                }}
                data-testid={testId}
              >
                <div className="flex items-center justify-center mb-3">
                  {done ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "#c9a96e" }}
                    >
                      <Check size={14} color="white" />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "hsl(var(--primary))", borderTopColor: "transparent" }}
                    />
                  )}
                </div>
                <div className="text-sm font-serif text-foreground">{name}</div>
                <div className="text-xs text-muted-foreground font-sans mt-0.5">
                  {done ? t.completed : t.inProgress}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground font-sans">{t.pollNote}</p>
        </motion.div>
      </div>
    </div>
  );
}
