import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import StartPage from "@/pages/start";
import JoinPage from "@/pages/join";
import QuestionnairePage from "@/pages/questionnaire";
import WaitingPage from "@/pages/waiting";
import ReportPage from "@/pages/report";
import AdminPage from "@/pages/admin";

const queryClient = new QueryClient();

/* ── Per-route page transitions ── */
function AnimatedRoutes() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        style={{ position: "relative", width: "100%", minHeight: "100vh" }}
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/start" component={StartPage} />
          <Route path="/join" component={JoinPage} />
          <Route path="/questionnaire/:sessionCode/:partnerSlot" component={QuestionnairePage} />
          <Route path="/waiting/:sessionCode/:partnerSlot" component={WaitingPage} />
          <Route path="/report/:sessionCode" component={ReportPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AnimatedRoutes />
            <LanguageSwitcher />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
