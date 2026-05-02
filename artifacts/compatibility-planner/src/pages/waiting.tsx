import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
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
    if (status?.bothCompleted) setLocation(`/report/${params.sessionCode}`);
  }, [status?.bothCompleted]);

  const mySlot = params.partnerSlot;
  const myName = mySlot === "partner1" ? status?.partner1Name : status?.partner2Name;
  const partnerName = mySlot === "partner1" ? status?.partner2Name : status?.partner1Name;
  const myDone = mySlot === "partner1" ? status?.partner1Completed : status?.partner2Completed;
  const partnerDone = mySlot === "partner1" ? status?.partner2Completed : status?.partner1Completed;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1729", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

          {/* Pulsing compass dot */}
          <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 36px" }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: -12, borderRadius: "50%", background: "rgba(126,170,146,0.15)" }}
            />
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#1a2540", border: "1px solid rgba(126,170,146,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2rem" }}>⊕</span>
            </div>
          </div>

          <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 600, marginBottom: 10 }}>
            {status?.bothCompleted ? "Both Complete" : "Waiting"}
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,38px)", color: "#f5f0e8", lineHeight: 1.15, marginBottom: 10 }}>
            {status?.bothCompleted ? t.titleDone : t.title}
          </h1>
          <p style={{ color: "rgba(245,240,232,0.5)", marginBottom: 44, lineHeight: 1.75, fontSize: "0.9rem" }}>
            {status?.bothCompleted ? t.descDone : t.desc}
          </p>

          {/* Status cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 36 }}>
            {[
              { name: myName ?? "You", done: myDone, testId: "status-partner1" },
              { name: partnerName ?? "Partner", done: partnerDone, testId: "status-partner2" },
            ].map(({ name, done, testId }) => (
              <div key={testId} data-testid={testId} style={{
                background: done ? "rgba(126,170,146,0.1)" : "#1a2540",
                border: `1px solid ${done ? "rgba(126,170,146,0.3)" : "rgba(245,240,232,0.08)"}`,
                borderRadius: 14, padding: "20px 16px", transition: "all 0.5s",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  {done ? (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7eaa92", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={15} color="#0f1729" />
                    </div>
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(126,170,146,0.4)", borderTopColor: "#7eaa92", animation: "spin 1s linear infinite" }} />
                  )}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#f5f0e8", fontWeight: 500, marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.4)", letterSpacing: "0.05em" }}>
                  {done ? t.completed : t.inProgress}
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.75rem", color: "rgba(245,240,232,0.3)" }}>{t.pollNote}</p>
        </motion.div>
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
