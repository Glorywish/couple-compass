import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/* ── floating sparkle dots ── */
const SPARKLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: (i * 41 + 13) % 100,
  y: (i * 57 + 9) % 100,
  r: 2 + (i % 3),
  dur: 3 + (i % 5) * 0.6,
  delay: -(i * 0.5) % 4,
  color: i % 3 === 0 ? "#e8607a" : i % 3 === 1 ? "#b8d4f0" : "#f0a0b0",
}));

/* ── Heart Compass SVG ── */
function HeartCompass({ size = 220 }: { size?: number }) {
  const s = size / 220;
  return (
    <svg width={size} height={size} viewBox="0 0 220 215" fill="none">
      {/* ── Outer heart (glow ring) ── */}
      <path
        d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="none" stroke="rgba(232,96,122,0.18)" strokeWidth="12"
      />
      {/* ── Outer heart (border) ── */}
      <path
        d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="rgba(252,232,236,0.55)" stroke="rgba(232,96,122,0.55)" strokeWidth="1.5"
      />
      {/* ── Inner heart (filled) ── */}
      <path
        d="M110,175 C65,143 28,113 28,79 C28,57 46,40 70,40 C86,40 100,49 110,61 C120,49 134,40 150,40 C174,40 192,57 192,79 C192,113 155,143 110,175 Z"
        fill="rgba(255,255,255,0.7)"
      />

      {/* ── Compass needle – North (rose) ── */}
      <polygon points="110,50 116,100 110,92 104,100" fill="#e8607a" opacity="0.9" />
      {/* ── Compass needle – South (light) ── */}
      <polygon points="110,175 116,120 110,128 104,120" fill="rgba(184,212,240,0.6)" />
      {/* ── Compass needle – East ── */}
      <polygon points="168,90 118,96 126,90 118,84" fill="rgba(232,96,122,0.3)" />
      {/* ── Compass needle – West ── */}
      <polygon points="52,90 102,96 94,90 102,84" fill="rgba(184,212,240,0.35)" />

      {/* ── Center dot ── */}
      <circle cx="110" cy="92" r="6" fill="#e8607a" />
      <circle cx="110" cy="92" r="3" fill="white" />

      {/* ── Cardinal letters ── */}
      <text x="110" y="44" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="0.1em" fill="#e8607a">N</text>
      <text x="110" y="183" textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">S</text>
      <text x="170" y="93" textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">E</text>
      <text x="50"  y="93" textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">W</text>

      {/* ── Small heart accent at top center ── */}
      <path d="M110,24 C107,21 103,20 103,23.5 C103,26 106,27.5 110,30 C114,27.5 117,26 117,23.5 C117,20 113,21 110,24 Z"
        fill="#e8607a" opacity="0.7" />
    </svg>
  );
}

const STEP_ICONS = ["01", "02", "03"];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data } = useI18n();
  const t = data.ui;

  return (
    <div style={{ background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 50%,#eaf3ff 100%)", minHeight: "100vh", color: "#1a3560", overflowX: "hidden" }}>

      {/* ── floating sparkles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {SPARKLES.map(s => (
          <div key={s.id} className="absolute rounded-full"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.r * 2, height: s.r * 2,
              background: s.color,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* ── HERO ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">

        {/* Soft radial glow behind heart */}
        <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,96,122,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Heart Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-10"
          style={{ animation: "heartbeat 3.5s ease-in-out infinite", filter: "drop-shadow(0 8px 32px rgba(232,96,122,0.22))" }}
        >
          <HeartCompass size={210} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div style={{ width: 24, height: 1, background: "rgba(232,96,122,0.4)" }} />
            <span style={{ fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600 }}>
              {t.home.badge}
            </span>
            <div style={{ width: 24, height: 1, background: "rgba(232,96,122,0.4)" }} />
          </div>

          <h1 style={{ fontSize: "clamp(38px,7vw,70px)", fontFamily: "'DM Serif Display', serif", fontWeight: 400, lineHeight: 1.06, color: "#1a3560", marginBottom: "1.2rem" }}>
            {t.home.title1}
            <br />
            <em style={{ fontStyle: "italic", color: "#e8607a" }}>{t.home.title2}</em>
          </h1>

          <p style={{ fontSize: "1rem", color: "rgba(26,53,96,0.58)", maxWidth: 440, margin: "0 auto 2.5rem", lineHeight: 1.8, fontWeight: 300 }}>
            {t.home.desc}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/start")}
              data-testid="button-start-session"
              style={{
                display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
                background: "#e8607a", color: "white",
                border: "none", borderRadius: 14, padding: "14px 32px",
                fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
                boxShadow: "0 4px 20px rgba(232,96,122,0.35)",
              }}
            >
              {t.home.cta1} <ArrowRight size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setLocation("/join")}
              data-testid="button-join-session"
              style={{
                display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
                background: "rgba(255,255,255,0.7)", color: "#1a3560",
                border: "1px solid rgba(26,53,96,0.15)", borderRadius: 14, padding: "14px 32px",
                fontSize: "0.83rem", fontWeight: 500, letterSpacing: "0.06em",
                textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
              }}
            >
              {t.home.cta2}
            </motion.button>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
          style={{ animation: "pulse-soft 2.5s ease-in-out infinite", color: "rgba(232,96,122,0.5)" }}
        >
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(232,96,122,0.6), transparent)" }} />
        </motion.div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: "white", color: "#1a3560", padding: "96px 24px", borderTop: "1px solid rgba(184,212,240,0.5)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 12 }}>
              How it works
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,42px)", color: "#1a3560", lineHeight: 1.15, marginBottom: 12 }}>
              {t.home.howTitle}
            </h2>
            <p style={{ fontSize: "0.92rem", color: "rgba(26,53,96,0.55)", maxWidth: 420, margin: "0 auto", lineHeight: 1.8 }}>
              {t.home.howDesc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {t.home.steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                style={{
                  background: i % 2 === 0 ? "#fce8ec" : "#eaf3ff",
                  border: "1px solid rgba(184,212,240,0.4)",
                  borderRadius: 18, padding: "28px 24px",
                  boxShadow: "0 2px 20px rgba(26,53,96,0.06)",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#e8607a", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 18,
                }}>
                  {STEP_ICONS[i]}
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.25rem", color: "#1a3560", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.87rem", color: "rgba(26,53,96,0.55)", lineHeight: 1.8 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8 DIMENSIONS ── */}
      <div style={{ background: "linear-gradient(135deg,#eaf3ff 0%,#fce8ec 100%)", padding: "80px 24px", borderTop: "1px solid rgba(232,96,122,0.12)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8607a", fontWeight: 600, marginBottom: 12 }}>
              {t.home.dimensionsTitle}
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px,4.5vw,38px)", color: "#1a3560", marginBottom: 10, lineHeight: 1.2 }}>
              8 dimensions of alignment
            </h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(26,53,96,0.5)", marginBottom: 36, lineHeight: 1.8 }}>
              {t.home.dimensionsDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.values(t.categories).map((cat) => (
                <span key={cat} style={{
                  background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,96,122,0.25)",
                  color: "#e8607a", borderRadius: 999, padding: "6px 16px",
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
      <div style={{ background: "white", padding: "96px 24px", textAlign: "center", borderTop: "1px solid rgba(184,212,240,0.5)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <Heart size={28} color="#e8607a" fill="#e8607a" style={{ margin: "0 auto 20px", opacity: 0.85 }} />
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,42px)", color: "#1a3560", marginBottom: 12, lineHeight: 1.15 }}>
            <em style={{ fontStyle: "italic" }}>{t.home.footerCta1}</em>
          </h2>
          <p style={{ fontSize: "0.92rem", color: "rgba(26,53,96,0.5)", marginBottom: 36, maxWidth: 380, margin: "0 auto 36px", lineHeight: 1.8 }}>
            {t.home.footerCta2}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setLocation("/start")}
            data-testid="button-footer-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#e8607a", color: "white",
              border: "none", borderRadius: 14, padding: "14px 36px",
              fontSize: "0.83rem", fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif",
              boxShadow: "0 4px 20px rgba(232,96,122,0.3)",
            }}
          >
            {t.home.footerBtn} <ArrowRight size={14} />
          </motion.button>
        </motion.div>

        <div style={{ marginTop: 72, borderTop: "1px solid rgba(26,53,96,0.07)", paddingTop: 32 }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "rgba(26,53,96,0.3)", fontStyle: "italic" }}>
            Couple Compass
          </p>
        </div>
      </div>
    </div>
  );
}
