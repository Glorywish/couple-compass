import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function StartPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [session, setSession] = useState<{ sessionCode: string; partner1Name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const createSession = useCreateSession({
    mutation: {
      onSuccess: (data) => {
        setSession({ sessionCode: data.sessionCode, partner1Name: data.partner1Name });
      },
      onError: () => {
        toast({ title: "Something went wrong", description: "Could not create a session. Please try again.", variant: "destructive" });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSession.mutate({ data: { partner1Name: name.trim() } });
  };

  const shareUrl = session
    ? `${window.location.origin}/join?code=${session.sessionCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Share it with your partner" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-10 transition-colors w-fit"
          data-testid="button-back-home"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {!session ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-serif text-foreground mb-2">Start your session</h1>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Enter your name to create a session. You'll get a code to share with your partner so they can join.
            </p>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  data-testid="input-partner1-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="text-lg py-6 h-auto"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!name.trim() || createSession.isPending}
                data-testid="button-create-session"
                className="w-full py-6 h-auto text-base gap-2"
              >
                {createSession.isPending ? "Creating..." : "Create session"}
                {!createSession.isPending && <ArrowRight size={18} />}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-accent/30 rounded-2xl border border-primary/10 p-6 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Session code</p>
              <div className="text-5xl font-mono font-bold text-primary tracking-widest" data-testid="text-session-code">
                {session.sessionCode}
              </div>
            </div>
            <h1 className="text-3xl font-serif text-foreground mb-3">Session created, {session.partner1Name}</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Share this link with your partner so they can join. Once they've got the link, you can both start the questionnaire independently.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  data-testid="input-share-link"
                  className="text-sm text-muted-foreground bg-muted"
                />
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  data-testid="button-copy-link"
                  className="shrink-0 gap-2"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground mb-4">Ready to start your own answers?</p>
              <Button
                size="lg"
                onClick={() => setLocation(`/questionnaire/${session.sessionCode}/partner1?name=${encodeURIComponent(session.partner1Name)}`)}
                data-testid="button-start-questionnaire"
                className="w-full py-6 h-auto text-base gap-2"
              >
                Start my questionnaire
                <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
