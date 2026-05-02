import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/* ── tiny star field ── */
const STARS = Array.from({ length: 38 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  r: 0.8 + (i % 3) * 0.6,
  dur: 2.5 + (i % 5) * 0.7,
  delay: -(i * 0.4) % 5,
}));

/* ── compass SVG ── */
function CompassRose({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      {/* outer ring */}
      <circle cx="110" cy="110" r="105" stroke="rgba(126,170,146,0.18)" strokeWidth="1" />
      <circle cx="110" cy="110" r="85"  stroke="rgba(126,170,146,0.10)" strokeWidth="0.5" strokeDasharray="4 6" />
      <circle cx="110" cy="110" r="60"  stroke="rgba(126,170,146,0.12)" strokeWidth="0.5" />
      {/* tick marks */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180;
        const big = i % 9 === 0;
        const r1 = big ? 95 : 100, r2 = 105;
        return (
          <line key={i}
            x1={110 + r1 * Math.sin(a)} y1={110 - r1 * Math.cos(a)}
            x2={110 + r2 * Math.sin(a)} y2={110 - r2 * Math.cos(a)}
            stroke={big ? "rgba(126,170,146,0.55)" : "rgba(126,170,146,0.2)"}
            strokeWidth={big ? 1.2 : 0.6}
          />
        );
      })}
      {/* N/S arrow – ivory */}
      <polygon points="110,18 118,110 110,100 102,110" fill="#f5f0e8" opacity="0.9" />
      <polygon points="110,202 118,110 110,120 102,110" fill="rgba(245,240,232,0.3)" />
      {/* E/W arrow – sage */}
      <polygon points="202,110 110,118 120,110 110,102" fill="rgba(126,170,146,0.5)" />
      <polygon points="18,110  110,118 100,110 110,102" fill="rgba(126,170,146,0.25)" />
      {/* center dot */}
      <circle cx="110" cy="110" r="5" fill="#7eaa92" />
      <circle cx="110" cy="110" r="2.5" fill="#f5f0e8" />
      {/* cardinal letters */}
      {[
        { label: "N", x: 110, y: 11 },
        { label: "S", x: 110, y: 215 },
        { label: "E", x: 214, y: 114 },
        { label: "W", x: 6,   y: 114 },
      ].map(({ label, x, y }) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="0.1em"
          fill={label === "N" ? "#f5f0e8" : "rgba(126,170,146,0.6)"}>
          {label}
        </text>
      ))}
    </svg>
  );
}

const STEP_ICONS = ["01", "02", "03"];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data } = useI18n();
  const t = data.ui;

  return (
    <div style={{ background: "#0f1729", minHeight: "100vh", color: "#f5f0e8", overflowX: "hidden" }}>

      {/* ── star field ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {STARS.map(s => (
          <div key={s.id} className="absolute rounded-full"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.r * 2, height: s.r * 2,
              background: "white",
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── HERO ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 pb-24"
        style={{ background: "radial-gradient(ellipse 70% 65% at 50% -5%, rgba(26,37,64,0.95) 0%, transparent 75%)" }}>

        {/* Compass rose */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10"
          style={{ animation: "spin-slow 60s linear infinite" }}
        >
          <CompassRose size={200} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div style={{ width: 28, height: 1, background: "rgba(126,170,146,0.6)" }} />
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 500 }}>
              {t.home.badge}
            </span>
            <div style={{ width: 28, height: 1, background: "rgba(126,170,146,0.6)" }} />
          </div>

          {/* headline */}
          <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", fontFamily: "'DM Serif Display', serif", fontWeight: 400, lineHeight: 1.05, color: "#f5f0e8", marginBottom: "1.25rem" }}>
            {t.home.title1}
            <br />
            <em style={{ fontStyle: "italic", color: "#7eaa92" }}>{t.home.title2}</em>
          </h1>

          <p style={{ fontSize: "1.05rem", color: "rgba(245,240,232,0.6)", maxWidth: 460, margin: "0 auto 2.5rem", lineHeight: 1.75, fontWeight: 300 }}>
            {t.home.desc}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/start")}
              data-testid="button-start-session"
              style={{
                display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
                background: "#7eaa92", color: "#0f1729",
                border: "none", borderRadius: 12, padding: "14px 32px",
                fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
              }}
            >
              {t.home.cta1} <ArrowRight size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/join")}
              data-testid="button-join-session"
              style={{
                display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
                background: "transparent", color: "#f5f0e8",
                border: "1px solid rgba(245,240,232,0.2)", borderRadius: 12, padding: "14px 32px",
                fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
              }}
            >
              {t.home.cta2}
            </motion.button>
          </div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
          style={{ animation: "pulse-soft 2.5s ease-in-out infinite", color: "rgba(126,170,146,0.6)" }}
        >
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(126,170,146,0.7), transparent)" }} />
        </motion.div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: "#f5f0e8", color: "#1a2540", padding: "96px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 600, marginBottom: 12 }}>
              How it works
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,42px)", color: "#1a2540", lineHeight: 1.15, marginBottom: 12 }}>
              {t.home.howTitle}
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#7a8ba8", maxWidth: 420, margin: "0 auto", lineHeight: 1.75 }}>
              {t.home.howDesc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {t.home.steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                style={{
                  background: "white", border: "1px solid rgba(26,37,64,0.08)",
                  borderRadius: 16, padding: "28px 24px",
                  boxShadow: "0 2px 24px rgba(15,23,41,0.06)",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#0f1729", color: "#7eaa92",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.05em",
                  marginBottom: 18,
                }}>
                  {STEP_ICONS[i]}
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.25rem", color: "#1a2540", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#7a8ba8", lineHeight: 1.75 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8 DIMENSIONS ── */}
      <div style={{ background: "#1a2540", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <p style={{ fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7eaa92", fontWeight: 600, marginBottom: 12 }}>
              {t.home.dimensionsTitle}
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px,4.5vw,38px)", color: "#f5f0e8", marginBottom: 10, lineHeight: 1.2 }}>
              8 dimensions of alignment
            </h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(245,240,232,0.45)", marginBottom: 36, lineHeight: 1.75 }}>
              {t.home.dimensionsDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.values(t.categories).map((cat) => (
                <span key={cat} style={{
                  background: "rgba(126,170,146,0.1)", border: "1px solid rgba(126,170,146,0.25)",
                  color: "#a8c5b3", borderRadius: 999, padding: "6px 16px",
                  fontSize: "0.82rem", fontWeight: 500,
                }}>
                  {cat}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{ background: "#0f1729", padding: "96px 24px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <Compass size={32} color="#7eaa92" style={{ margin: "0 auto 20px" }} />
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,42px)", color: "#f5f0e8", marginBottom: 12, lineHeight: 1.15 }}>
            <em style={{ fontStyle: "italic" }}>{t.home.footerCta1}</em>
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(245,240,232,0.5)", marginBottom: 36, maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.75 }}>
            {t.home.footerCta2}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/start")}
            data-testid="button-footer-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#7eaa92", color: "#0f1729",
              border: "none", borderRadius: 12, padding: "14px 36px",
              fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
            }}
          >
            {t.home.footerBtn} <ArrowRight size={15} />
          </motion.button>
        </motion.div>

        <div style={{ marginTop: 72, borderTop: "1px solid rgba(245,240,232,0.07)", paddingTop: 32 }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "rgba(245,240,232,0.35)", fontStyle: "italic" }}>
            Couple Compass
          </p>
        </div>
      </div>
    </div>
  );
}
