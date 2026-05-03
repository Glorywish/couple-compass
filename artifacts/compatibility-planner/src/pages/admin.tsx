import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Users, CheckCircle, Clock, Mail, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, Star } from "lucide-react";

const PAYPAL_URL = "https://paypal.me/morganamona";

interface SessionData {
  id: number;
  sessionCode: string;
  partner1Name: string;
  partner2Name: string | null;
  createdAt: string;
  partner1CompletedAt: string | null;
  partner2CompletedAt: string | null;
  status: "complete" | "partial" | "pending";
  reminders: { email: string; reminderDueAt: string; sentAt: string | null }[];
  rating: { stars: number; note: string | null } | null;
}

interface StatsData {
  summary: {
    total: number;
    bothCompleted: number;
    oneCompleted: number;
    noneCompleted: number;
    remindersSent: number;
    remindersPending: number;
    totalRatings: number;
    avgRating: number | null;
  };
  sessions: SessionData[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: `1px solid ${color}22`, borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(26,53,96,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <p style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a3560", margin: 0, lineHeight: 1.1 }}>{value}</p>
        <p style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.5)", margin: "4px 0 0", letterSpacing: "0.05em" }}>{label}</p>
      </div>
    </div>
  );
}

function StarsDisplay({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} color="#e8607a" fill={i <= n ? "#e8607a" : "none"} />
      ))}
    </span>
  );
}

function RatingsTab({ sessions, avgRating, totalRatings }: { sessions: SessionData[]; avgRating: number | null; totalRatings: number }) {
  const rated = sessions.filter(s => s.rating !== null).sort((a, b) => {
    if (!a.rating || !b.rating) return 0;
    return b.rating.stars - a.rating.stars;
  });

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: rated.filter(s => s.rating?.stars === star).length,
  }));

  if (totalRatings === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(26,53,96,0.35)", fontSize: "0.9rem" }}>
        No ratings yet. They will appear here once couples submit feedback.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Distribution bar */}
      <div style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 14, padding: "24px 28px", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "3rem", fontWeight: 700, color: "#1a3560", margin: 0, lineHeight: 1 }}>{avgRating}</p>
          <StarsDisplay n={Math.round(avgRating ?? 0)} />
          <p style={{ margin: "6px 0 0", fontSize: "0.72rem", color: "rgba(26,53,96,0.4)" }}>{totalRatings} rating{totalRatings !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
          {dist.map(({ star, count }) => (
            <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.5)", width: 12, textAlign: "right", flexShrink: 0 }}>{star}</span>
              <Star size={11} color="#e8607a" fill="#e8607a" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, height: 8, background: "rgba(26,53,96,0.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: "#e8607a", width: totalRatings > 0 ? `${(count / totalRatings) * 100}%` : "0%", transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.4)", width: 18, textAlign: "right", flexShrink: 0 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rated.map(s => (
          <div key={s.id} style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 6px rgba(26,53,96,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: s.rating?.note ? 10 : 0 }}>
              <StarsDisplay n={s.rating!.stars} />
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1a3560" }}>{s.partner1Name}{s.partner2Name ? ` & ${s.partner2Name}` : ""}</span>
              <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(26,53,96,0.28)" }}>{s.sessionCode}</span>
            </div>
            {s.rating?.note && (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(26,53,96,0.6)", fontStyle: "italic", lineHeight: 1.7, borderLeft: "2px solid rgba(232,96,122,0.3)", paddingLeft: 12 }}>
                "{s.rating.note}"
              </p>
            )}
          </div>
        ))}
        {rated.filter(s => !s.rating?.note).length > 0 && rated.filter(s => !s.rating?.note).length === rated.length && (
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "rgba(26,53,96,0.35)", marginTop: 8 }}>No written comments yet — only star ratings.</p>
        )}
      </div>
    </div>
  );
}

function SessionRow({ s }: { s: SessionData }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = s.status === "complete" ? "#e8607a" : s.status === "partial" ? "#d4a853" : "rgba(26,53,96,0.3)";
  const statusLabel = s.status === "complete" ? "Complete" : s.status === "partial" ? "In Progress" : "Pending";

  return (
    <div style={{ background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(26,53,96,0.04)" }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1a3560" }}>
            {s.partner1Name}{s.partner2Name ? ` & ${s.partner2Name}` : " (waiting for partner)"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "0.72rem", color: "rgba(26,53,96,0.4)", fontFamily: "monospace" }}>
            {s.sessionCode} · {timeAgo(s.createdAt)}
          </p>
        </div>
        <span style={{ fontSize: "0.62rem", padding: "3px 10px", borderRadius: 999, background: `${statusColor}15`, color: statusColor, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>{statusLabel}</span>
        <div style={{ color: "rgba(26,53,96,0.3)", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(184,212,240,0.3)", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#eaf3ff", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(26,53,96,0.4)", margin: "0 0 4px" }}>Partner 1</p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#1a3560", fontWeight: 500 }}>{s.partner1Name}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: s.partner1CompletedAt ? "#e8607a" : "rgba(26,53,96,0.35)" }}>
                {s.partner1CompletedAt ? `Completed ${timeAgo(s.partner1CompletedAt)}` : "Not completed"}
              </p>
            </div>
            <div style={{ background: "#fce8ec", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(26,53,96,0.4)", margin: "0 0 4px" }}>Partner 2</p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#1a3560", fontWeight: 500 }}>{s.partner2Name ?? "Not joined yet"}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: s.partner2CompletedAt ? "#e8607a" : "rgba(26,53,96,0.35)" }}>
                {s.partner2CompletedAt ? `Completed ${timeAgo(s.partner2CompletedAt)}` : "Not completed"}
              </p>
            </div>
          </div>

          {s.status === "complete" && (
            <a href={`/report/${s.sessionCode}`} target="_blank" rel="noreferrer"
              style={{ fontSize: "0.72rem", color: "#e8607a", textDecoration: "none", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              View Report →
            </a>
          )}

          {s.rating && (
            <div style={{ background: "rgba(232,96,122,0.05)", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(26,53,96,0.4)", margin: "0 0 4px" }}>Rating</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1rem" }}>{"⭐".repeat(s.rating.stars)}</span>
                <span style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.5)", fontWeight: 600 }}>{s.rating.stars}/5</span>
              </div>
              {s.rating.note && <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "rgba(26,53,96,0.6)", fontStyle: "italic", lineHeight: 1.5 }}>"{s.rating.note}"</p>}
            </div>
          )}

          {s.reminders.length > 0 && (
            <div>
              <p style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(26,53,96,0.4)", margin: "0 0 6px" }}>Reminders</p>
              {s.reminders.map((r, i) => (
                <div key={i} style={{ fontSize: "0.75rem", color: "rgba(26,53,96,0.6)", display: "flex", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: "monospace" }}>{r.email}</span>
                  <span style={{ color: r.sentAt ? "#e8607a" : "rgba(26,53,96,0.35)" }}>
                    {r.sentAt ? `Sent ${timeAgo(r.sentAt)}` : `Due ${timeAgo(r.reminderDueAt)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<StatsData | null>(null);
  const [filter, setFilter] = useState<"all" | "complete" | "partial" | "pending">("all");
  const [tab, setTab] = useState<"sessions" | "ratings">("sessions");

  const fetchStats = async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/stats`, {
        headers: { "x-admin-secret": s },
      });
      if (res.status === 401) { setError("Wrong password. Try again."); return; }
      if (!res.ok) { setError("Server error. Please try again."); return; }
      const json = await res.json() as StatsData;
      setData(json);
      setAuthed(true);
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data?.sessions.filter(s => filter === "all" || s.status === filter) ?? [];

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "white", borderRadius: 20, padding: "40px 36px", maxWidth: 380, width: "100%", boxShadow: "0 8px 40px rgba(232,96,122,0.12)", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#e8607a,#c94468)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Users size={22} color="white" />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#1a3560", margin: "0 0 6px" }}>Admin Dashboard</h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(26,53,96,0.5)", margin: "0 0 28px" }}>Couple Compass</p>

          <input
            type="password" value={secret} onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchStats(secret)}
            placeholder="Admin password"
            style={{ width: "100%", boxSizing: "border-box", background: "#f5f8ff", border: "1px solid rgba(184,212,240,0.5)", borderRadius: 10, padding: "12px 16px", fontSize: "0.9rem", color: "#1a3560", fontFamily: "Inter,sans-serif", outline: "none", marginBottom: 12 }}
          />
          {error && <p style={{ fontSize: "0.8rem", color: "#e8607a", marginBottom: 12 }}>{error}</p>}
          <button onClick={() => fetchStats(secret)} disabled={loading || !secret}
            style={{ width: "100%", background: "#e8607a", border: "none", borderRadius: 10, padding: "12px", color: "white", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: loading ? "wait" : "pointer", fontFamily: "Inter,sans-serif", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Checking..." : "Enter"}
          </button>
          <button onClick={() => setLocation("/")} style={{ marginTop: 16, background: "none", border: "none", color: "rgba(26,53,96,0.4)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
            Back to app
          </button>
        </motion.div>
      </div>
    );
  }

  const { summary } = data!;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f8ff", fontFamily: "Inter,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid rgba(184,212,240,0.4)", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => setLocation("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(26,53,96,0.4)", display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontFamily: "Inter,sans-serif", padding: 0 }}>
          <ArrowLeft size={14} /> Back to app
        </button>
        <div style={{ width: 1, height: 18, background: "rgba(184,212,240,0.5)" }} />
        <h1 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#1a3560" }}>Admin Dashboard</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => fetchStats(secret)} style={{ background: "rgba(232,96,122,0.1)", border: "1px solid rgba(232,96,122,0.22)", borderRadius: 8, padding: "6px 14px", color: "#e8607a", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif" }}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: 14, marginBottom: 32 }}>
          <StatCard label="Total sessions" value={summary.total} color="#1a3560" icon={<Users size={18} />} />
          <StatCard label="Both completed" value={summary.bothCompleted} color="#e8607a" icon={<CheckCircle size={18} />} />
          <StatCard label="In progress" value={summary.oneCompleted} color="#d4a853" icon={<Clock size={18} />} />
          <StatCard label="Pending" value={summary.noneCompleted} color="rgba(26,53,96,0.3)" icon={<AlertCircle size={18} />} />
          <StatCard label="Reminders sent" value={summary.remindersSent} color="#e8607a" icon={<Mail size={18} />} />
          <StatCard label="Reminders pending" value={summary.remindersPending} color="#d4a853" icon={<Mail size={18} />} />
          <StatCard label="Total ratings" value={summary.totalRatings} color="#e8607a" icon={<Star size={18} />} />
          <div style={{ background: "white", border: "1px solid rgba(232,96,122,0.15)", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(26,53,96,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(232,96,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={18} color="#e8607a" fill="rgba(232,96,122,0.4)" />
            </div>
            <div>
              <p style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a3560", margin: 0, lineHeight: 1.1 }}>{summary.avgRating !== null ? `${summary.avgRating}` : "—"}</p>
              <p style={{ fontSize: "0.72rem", color: "rgba(26,53,96,0.5)", margin: "4px 0 0", letterSpacing: "0.05em" }}>Avg rating / 5</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", border: "1px solid rgba(184,212,240,0.4)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {(["sessions", "ratings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ background: tab === t ? "#e8607a" : "transparent", border: "none", borderRadius: 9, padding: "7px 18px", color: tab === t ? "white" : "rgba(26,53,96,0.55)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "capitalize", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}>
              {t === "sessions" ? `Sessions (${summary.total})` : `Ratings & Comments (${summary.totalRatings})`}
            </button>
          ))}
        </div>

        {tab === "sessions" && (
          <>
            {/* Filter tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {(["all", "complete", "partial", "pending"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ background: filter === f ? "#1a3560" : "white", border: `1px solid ${filter === f ? "#1a3560" : "rgba(184,212,240,0.5)"}`, borderRadius: 8, padding: "6px 14px", color: filter === f ? "white" : "rgba(26,53,96,0.6)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "capitalize", cursor: "pointer", fontFamily: "Inter,sans-serif", transition: "all 0.15s" }}>
                  {f === "all" ? `All (${summary.total})` : f === "complete" ? `Complete (${summary.bothCompleted})` : f === "partial" ? `In Progress (${summary.oneCompleted})` : `Pending (${summary.noneCompleted})`}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0
                ? <p style={{ textAlign: "center", color: "rgba(26,53,96,0.35)", padding: 40, fontSize: "0.9rem" }}>No sessions found</p>
                : filtered.map(s => <SessionRow key={s.id} s={s} />)
              }
            </div>
          </>
        )}

        {tab === "ratings" && (
          <RatingsTab sessions={data!.sessions} avgRating={summary.avgRating} totalRatings={summary.totalRatings} />
        )}

        {/* Donation nudge */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg,#fce8ec 0%,#eaf3ff 100%)", border: "1px solid rgba(232,96,122,0.18)", borderRadius: 16, padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 6px", fontFamily: "'DM Serif Display', serif", fontSize: "1.15rem", color: "#1a3560" }}>Couple Compass is free</p>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(26,53,96,0.55)", lineHeight: 1.6 }}>Powered by Replit. Consider supporting future projects.</p>
          </div>
          <a href={PAYPAL_URL} target="_blank" rel="noreferrer"
            style={{ background: "#003087", borderRadius: 10, padding: "10px 22px", color: "white", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            PayPal Donate
          </a>
        </div>
      </div>
    </div>
  );
}
