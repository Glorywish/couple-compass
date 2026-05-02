import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Heart, Check } from "lucide-react";
import { useGetSessionStatus, getGetSessionStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function WaitingPage() {
  const params = useParams<{ sessionCode: string; partnerSlot: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto w-20 h-20 mb-8">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-accent flex items-center justify-center"
            >
              <Heart size={32} className="text-primary fill-primary/20" />
            </motion.div>
          </div>

          <h1 className="text-3xl font-serif text-foreground mb-3">
            {status?.bothCompleted ? "Both done! Loading your report..." : "Waiting for your partner"}
          </h1>
          <p className="text-muted-foreground mb-12 leading-relaxed">
            {status?.bothCompleted
              ? "Generating your compatibility report now..."
              : "Your answers are in. Once your partner finishes, your report will be ready automatically."}
          </p>

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div
              className={`rounded-2xl border p-5 transition-all ${
                myDone ? "border-primary/30 bg-accent/30" : "border-border bg-card"
              }`}
              data-testid="status-partner1"
            >
              <div className="flex items-center justify-center mb-2">
                {myDone ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check size={16} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
                )}
              </div>
              <div className="text-sm font-medium text-foreground">{myName ?? "You"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{myDone ? "Completed" : "In progress"}</div>
            </div>

            <div
              className={`rounded-2xl border p-5 transition-all ${
                partnerDone ? "border-primary/30 bg-accent/30" : "border-border bg-card"
              }`}
              data-testid="status-partner2"
            >
              <div className="flex items-center justify-center mb-2">
                {partnerDone ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check size={16} className="text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-dashed animate-pulse" />
                )}
              </div>
              <div className="text-sm font-medium text-foreground">{partnerName ?? "Partner"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{partnerDone ? "Completed" : "Waiting..."}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This page updates automatically every 5 seconds
          </p>
        </motion.div>
      </div>
    </div>
  );
}
