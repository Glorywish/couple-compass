import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { useGetSessionStatus, getGetSessionStatusQueryKey } from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";

export default function WaitingPage() {
  const params = useParams<{ sessionCode: string; partnerSlot: string }>();
  const [, setLocation] = useLocation();
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
    if (!status?.bothCompleted) return;
    const timer = setTimeout(() => {
      setLocation(`/report/${params.sessionCode}`);
    }, 1400);
    return () => clearTimeout(timer);
  }, [status?.bothCompleted, params.sessionCode]);

  const mySlot = params.partnerSlot;
  const myName = mySlot === "partner1" ? status?.partner1Name : status?.partner2Name;
  const partnerName = mySlot === "partner1" ? status?.partner2Name : status?.partner1Name;
  const myDone = mySlot === "partner1" ? status?.partner1Completed : status?.partner2Completed;
  const partnerDone = mySlot === "partner1" ? status?.partner2Completed : status?.partner1Completed;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 36px" }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.12, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: -16, borderRadius: "50%", background: "rgba(232,96,122,0.18)" }}
            />
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", border: "1px solid rgba(232,96,122,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(232,96,122,0.12)" }}>
              <Heart size={32} color="#e8607a" fill="rgba(232,96,122,0.2)" style={{ animation: "heartbeat 2s ease-in-out infinite" }} />
            </div>
          </div>

          <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 10 }}>
            {status?.bothCompleted ? t.bothComplete : t.waitingLabel}
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,38px)", color: "#1a3560", lineHeight: 1.15, marginBottom: 10 }}>
            {status?.bothCompleted ? t.titleDone : t.title}
          </h1>
          <p style={{ color: "rgba(26,53,96,0.5)", marginBottom: 44, lineHeight: 1.8, fontSize: "0.9rem" }}>
            {status?.bothCompleted ? t.descDone : t.desc}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36 }}>
            {[
              { name: myName ?? data.ui.questionnaire.partner1, done: myDone, testId: "status-partner1" },
              { name: partnerName ?? data.ui.questionnaire.partner2, done: partnerDone, testId: "status-partner2" },
            ].map(({ name, done, testId }) => (
              <div key={testId} data-testid={testId} style={{
                background: done ? "rgba(232,96,122,0.07)" : "white",
                border: `1px solid ${done ? "rgba(232,96,122,0.3)" : "rgba(184,212,240,0.6)"}`,
                borderRadius: 16, padding: "22px 16px", transition: "all 0.5s",
                boxShadow: "0 2px 16px rgba(26,53,96,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  {done ? (
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#e8607a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(232,96,122,0.3)" }}>
                      <Check size={15} color="white" />
                    </div>
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: "50%", border: "2.5px solid rgba(184,212,240,0.8)", borderTopColor: "#e8607a", animation: "spin 1s linear infinite" }} />
                  )}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#1a3560", fontWeight: 500, marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.4)", letterSpacing: "0.04em" }}>
                  {done ? t.completed : t.inProgress}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.3)" }}>{t.pollNote}</p>
        </motion.div>
      </div>
    </div>
  );
}
