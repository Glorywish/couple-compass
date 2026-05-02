import { useLocation } from "wouter";
import { Heart, ArrowRight, Users, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();

  const steps = [
    { icon: Users, title: "Create a session", desc: "Partner 1 enters their name and gets a shareable code" },
    { icon: Heart, title: "Both answer together", desc: "Each partner completes 40 thoughtful questions privately" },
    { icon: FileText, title: "Receive your report", desc: "See your compatibility score, aligned values, and discussion prompts" },
  ];

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
              <span>For couples who want to go deeper</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-medium text-foreground leading-tight mb-6">
              Are you truly aligned<br />
              <span className="text-primary italic">before you say yes?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
              A thoughtful questionnaire for couples exploring compatibility across values, life plans,
              finances, family, and more. Not a quiz — a conversation starter that matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/start")}
                data-testid="button-start-session"
                className="gap-2 text-base px-8 py-6 h-auto"
              >
                Begin together
                <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/join")}
                data-testid="button-join-session"
                className="gap-2 text-base px-8 py-6 h-auto"
              >
                Join with a code
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
          <h2 className="text-2xl font-serif text-center text-foreground mb-2">How it works</h2>
          <p className="text-muted-foreground text-center mb-12">Three steps to a clearer picture</p>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <step.icon size={20} className="text-primary" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Step {i + 1}</div>
                <h3 className="font-serif text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="bg-accent/30 border-y border-border py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif text-foreground mb-3">8 dimensions of compatibility</h2>
          <p className="text-muted-foreground text-sm mb-8">Covering the areas that matter most for long-term alignment</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Core Values", "Life Plans", "Finances", "Family & Children", "Lifestyle", "Communication", "Intimacy", "Personal Growth"].map((cat) => (
              <span key={cat} className="bg-card border border-border text-sm text-foreground px-4 py-1.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-serif text-foreground mb-3">Ready to start the conversation?</h2>
        <p className="text-muted-foreground mb-8">It takes about 15 minutes. The insights last a lifetime.</p>
        <Button
          size="lg"
          onClick={() => setLocation("/start")}
          data-testid="button-footer-cta"
          className="gap-2 text-base px-8 py-6 h-auto"
        >
          Start now
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
