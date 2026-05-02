import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const STARS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  char: ["✦", "✧", "⋆"][i % 3],
  left: `${(i * 13 + 7) % 100}%`,
  top: `${(i * 17 + 11) % 100}%`,
  size: `${0.4 + (i % 3) * 0.22}rem`,
  dur: `${3 + (i % 5)}s`,
  delay: `-${(i * 0.7) % 6}s`,
}));

export default function Home() {
  const [, setLocation] = useLocation();
  const { data } = useI18n();
  const t = data.ui;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-[3px] pointer-events-none"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(to right, hsl(var(--primary)/0.5), hsl(var(--primary)), #c9a96e)",
          transition: "width 0.1s linear",
        }}
      />

      {/* Floating background stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        {STARS.map((s) => (
          <span
            key={s.id}
            className="absolute text-primary/25 select-none"
            style={{
              left: s.left,
              top: s.top,
              fontSize: s.size,
              animation: `twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
            }}
          >
            {s.char}
          </span>
        ))}
      </div>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, hsl(353 55% 90% / 0.75) 0%, transparent 72%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          {/* Floating heart */}
          <div
            className="text-5xl mb-8 inline-block select-none"
            style={{ animation: "float 3s ease-in-out infinite", color: "hsl(var(--primary))" }}
          >
            ♡
          </div>

          {/* Eyebrow label */}
          <p
            className="text-[11px] uppercase tracking-[0.45em] font-sans mb-5"
            style={{ color: "hsl(var(--primary))" }}
          >
            {t.home.badge}
          </p>

          {/* Main title */}
          <h1
            className="font-serif font-light text-foreground leading-[1.08] mb-8"
            style={{ fontSize: "clamp(44px, 7.5vw, 68px)" }}
          >
            {t.home.title1}
            <br />
            <em style={{ fontStyle: "italic", color: "hsl(var(--primary))" }}>
              {t.home.title2}
            </em>
          </h1>

          {/* Quote block */}
          <blockquote
            className="max-w-md mx-auto mb-12 text-left font-serif italic leading-loose"
            style={{
              fontSize: "1.1rem",
              color: "hsl(var(--muted-foreground))",
              borderLeft: "2px solid #c9a96e",
              paddingLeft: "1.25rem",
            }}
          >
            {t.home.desc}
          </blockquote>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/start")}
              data-testid="button-start-session"
              className="gap-2 text-sm px-10 py-6 h-auto tracking-widest uppercase"
            >
              {t.home.cta1}
              <ArrowRight size={14} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/join")}
              data-testid="button-join-session"
              className="gap-2 text-sm px-10 py-6 h-auto tracking-widest uppercase"
            >
              {t.home.cta2}
            </Button>
          </div>

          {/* Scroll hint */}
          <div
            className="mt-20 flex flex-col items-center gap-2"
            style={{
              animation: "slowpulse 2.2s ease-in-out infinite",
              color: "hsl(var(--primary))",
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-sans">
              Discover more
            </span>
            <div
              className="w-px h-12"
              style={{
                background: "linear-gradient(to bottom, hsl(var(--primary)), transparent)",
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── How it works — timeline ───────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.4em] text-center font-sans mb-3"
            style={{ color: "#c9a96e" }}
          >
            Step by Step
          </p>
          <h2
            className="font-serif font-light text-center text-foreground mb-3"
            style={{ fontSize: "clamp(30px, 5vw, 42px)" }}
          >
            {t.home.howTitle}
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-16 font-sans leading-relaxed">
            {t.home.howDesc}
          </p>

          <div className="relative pl-12">
            {/* Vertical line */}
            <div
              className="absolute left-5 top-2 bottom-2 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, hsl(var(--primary)/0.3), #c9a96e60, transparent)",
              }}
            />

            {t.home.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14, duration: 0.5 }}
                className="relative mb-6 last:mb-0"
              >
                {/* Dot */}
                <div
                  className="absolute -left-12 top-6 w-3 h-3 rounded-full border-2 border-background"
                  style={{ background: i === 1 ? "#c9a96e" : "hsl(var(--primary))" }}
                />

                <div
                  className="bg-card border border-border p-5 transition-all duration-300 hover:shadow-md hover:translate-x-1"
                  style={{ borderRadius: "3px", borderLeft: `3px solid ${i === 1 ? "#c9a96e" : "hsl(var(--primary))"}` }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.3em] mb-2 font-sans"
                    style={{ color: "#c9a96e" }}
                  >
                    Step {i + 1}
                  </p>
                  <h3 className="text-xl font-serif text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-loose font-sans">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── 8 Dimensions (dark panel) ─────────────────────── */}
      <div
        className="relative z-10 py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(327 12% 20%), hsl(327 15% 28%))" }}
      >
        {/* Decorative ✦ */}
        <span
          className="absolute text-white/5 pointer-events-none select-none"
          style={{ fontSize: "260px", top: "-40px", right: "-20px", lineHeight: 1 }}
        >
          ✦
        </span>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p
            className="text-[11px] uppercase tracking-[0.4em] font-sans mb-3"
            style={{ color: "#c9a96e" }}
          >
            {t.home.dimensionsTitle}
          </p>
          <h2
            className="font-serif font-light mb-4 leading-tight"
            style={{ fontSize: "clamp(28px, 5vw, 38px)", color: "white" }}
          >
            8 areas that reveal your harmony
          </h2>
          <p
            className="text-sm mb-12 font-sans leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {t.home.dimensionsDesc}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(t.categories).map((cat) => (
              <span
                key={cat}
                className="text-sm font-sans px-5 py-2"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "20px",
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: "0.06em",
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer CTA ────────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="text-3xl mb-6 inline-block select-none"
            style={{ animation: "float 2.5s ease-in-out infinite", color: "#c9a96e" }}
          >
            ✦
          </div>
          <h2
            className="font-serif font-light text-foreground mb-4 italic"
            style={{ fontSize: "clamp(28px, 5vw, 40px)" }}
          >
            {t.home.footerCta1}
          </h2>
          <p className="text-muted-foreground mb-10 font-sans leading-relaxed">
            {t.home.footerCta2}
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/start")}
            data-testid="button-footer-cta"
            className="gap-2 text-sm px-10 py-6 h-auto tracking-widest uppercase"
          >
            {t.home.footerBtn}
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div
        className="border-t border-border py-10 text-center"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <p className="font-serif italic text-foreground/70 text-xl">Couple Compass</p>
        <p
          className="text-[10px] uppercase tracking-[0.25em] mt-2 font-sans"
          style={{ color: "#c9a96e" }}
        >
          Discover your harmony together ✦
        </p>
      </div>
    </div>
  );
}
