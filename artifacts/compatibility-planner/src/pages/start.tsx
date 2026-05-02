import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

export default function StartPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [session, setSession] = useState<{ sessionCode: string; partner1Name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { data } = useI18n();
  const t = data.ui.start;

  const createSession = useCreateSession({
    mutation: {
      onSuccess: (d) => {
        setSession({ sessionCode: d.sessionCode, partner1Name: d.partner1Name });
      },
      onError: () => {
        toast({ title: data.ui.errors.createFailed, variant: "destructive" });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSession.mutate({ data: { partner1Name: name.trim() } });
  };

  const shareUrl = session
    ? `${window.location.origin}${import.meta.env.BASE_URL}join?code=${session.sessionCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Share it with your partner" });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(353 55% 90% / 0.5) 0%, transparent 65%)" }}
    >
      <div className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-sans mb-12 transition-colors w-fit"
          data-testid="button-back-home"
        >
          <ArrowLeft size={14} />
          {data.ui.back}
        </button>

        {!session ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.4em] font-sans"
              style={{ color: "#c9a96e" }}
            >
              New Journey
            </span>
            <h1 className="text-4xl font-serif font-light text-foreground mt-2 mb-2">{t.title}</h1>
            <p className="text-muted-foreground mb-10 leading-relaxed font-sans text-sm">{t.desc}</p>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
                  {t.label}
                </Label>
                <Input
                  id="name"
                  data-testid="input-partner1-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.placeholder}
                  className="text-lg py-6 h-auto font-serif"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!name.trim() || createSession.isPending}
                data-testid="button-create-session"
                className="w-full py-6 h-auto text-sm gap-2 tracking-widest uppercase"
              >
                {createSession.isPending ? t.creating : t.btn}
                {!createSession.isPending && <ArrowRight size={14} />}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Session code card */}
            <div
              className="bg-card border border-border p-6 mb-8 text-center"
              style={{ borderRadius: "3px", borderLeft: "3px solid #c9a96e" }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.4em] font-sans mb-2"
                style={{ color: "#c9a96e" }}
              >
                {t.codeLabel}
              </p>
              <div
                className="text-5xl font-mono font-bold tracking-widest"
                data-testid="text-session-code"
                style={{ color: "hsl(var(--primary))" }}
              >
                {session.sessionCode}
              </div>
            </div>

            <h1 className="text-3xl font-serif font-light text-foreground mb-2">
              {t.created}, <em className="italic">{session.partner1Name}</em>
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed font-sans text-sm">{t.shareDesc}</p>

            {/* Share link */}
            <div className="space-y-3 mb-8">
              <div
                className="border border-border p-3 flex items-center gap-2"
                style={{ borderRadius: "3px", background: "hsl(var(--muted)/0.4)" }}
              >
                <span className="text-xs text-muted-foreground font-sans truncate flex-1">{shareUrl}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  data-testid="button-copy-link"
                  className="shrink-0 gap-1.5 text-xs uppercase tracking-wider"
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied ? t.copiedBtn : t.copyBtn}
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground font-sans mb-4">{t.readyText}</p>
              <Button
                size="lg"
                onClick={() =>
                  setLocation(
                    `/questionnaire/${session.sessionCode}/partner1?name=${encodeURIComponent(session.partner1Name)}`
                  )
                }
                data-testid="button-start-questionnaire"
                className="w-full py-6 h-auto text-sm gap-2 tracking-widest uppercase"
              >
                {t.startBtn}
                <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
