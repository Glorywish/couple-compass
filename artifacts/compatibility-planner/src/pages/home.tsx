import { useLocation } from "wouter";
import { Heart, ArrowRight, Users, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const STEP_ICONS = [Users, Heart, FileText];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data } = useI18n();
  const t = data.ui;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm px-4 py-1.5 rounded-full mb-8 border border-primary/10">
              <Sparkles size={14} />
              <span>{t.home.badge}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-medium text-foreground leading-tight mb-6">
              {t.home.title1}<br />
              <span className="text-primary italic">{t.home.title2}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
              {t.home.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/start")}
                data-testid="button-start-session"
                className="gap-2 text-base px-8 py-6 h-auto"
              >
                {t.home.cta1}
                <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/join")}
                data-testid="button-join-session"
                className="gap-2 text-base px-8 py-6 h-auto"
              >
                {t.home.cta2}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-serif text-center text-foreground mb-2">{t.home.howTitle}</h2>
          <p className="text-muted-foreground text-center mb-12">{t.home.howDesc}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {t.home.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Step {i + 1}</div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="bg-accent/30 border-y border-border py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-3">{t.home.dimensionsTitle}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t.home.dimensionsDesc}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(t.categories).map((cat) => (
              <span key={cat} className="bg-card border border-border text-sm text-foreground px-4 py-1.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-serif text-foreground mb-3">{t.home.footerCta1}</h2>
        <p className="text-muted-foreground mb-8">{t.home.footerCta2}</p>
        <Button
          size="lg"
          onClick={() => setLocation("/start")}
          data-testid="button-footer-cta"
          className="gap-2 text-base px-8 py-6 h-auto"
        >
          {t.home.footerBtn}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
