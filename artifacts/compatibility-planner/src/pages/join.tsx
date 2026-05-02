import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetSession } from "@workspace/api-client-react";
import { getGetSessionQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function JoinPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const prefilledCode = params.get("code") ?? "";

  const [code, setCode] = useState(prefilledCode);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: session, isError, isLoading } = useGetSession(
    code.toUpperCase().trim(),
    { query: { enabled: submitted && !!code.trim(), queryKey: getGetSessionQueryKey(code.toUpperCase().trim()) } }
  );

  useEffect(() => {
    if (submitted && session && name.trim()) {
      setLocation(`/questionnaire/${session.sessionCode}/partner2?name=${encodeURIComponent(name.trim())}`);
    }
  }, [session, submitted, name]);

  useEffect(() => {
    if (submitted && isError) {
      toast({ title: "Session not found", description: "Please check your code and try again.", variant: "destructive" });
      setSubmitted(false);
    }
  }, [isError, submitted]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSubmitted(true);
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-serif text-foreground mb-2">Join a session</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Enter the session code your partner shared with you, then your name to get started.
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Session code</Label>
              <Input
                id="code"
                data-testid="input-session-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="text-xl font-mono py-6 h-auto tracking-widest uppercase"
                maxLength={8}
                autoFocus={!prefilledCode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                data-testid="input-partner2-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. James"
                className="text-lg py-6 h-auto"
                autoFocus={!!prefilledCode}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!code.trim() || !name.trim() || isLoading}
              data-testid="button-join-session"
              className="w-full py-6 h-auto text-base gap-2"
            >
              {isLoading ? "Checking code..." : "Join and start"}
              {!isLoading && <ArrowRight size={18} />}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
