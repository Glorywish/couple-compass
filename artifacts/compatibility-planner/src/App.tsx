import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import StartPage from "@/pages/start";
import JoinPage from "@/pages/join";
import QuestionnairePage from "@/pages/questionnaire";
import WaitingPage from "@/pages/waiting";
import ReportPage from "@/pages/report";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/start" component={StartPage} />
      <Route path="/join" component={JoinPage} />
      <Route path="/questionnaire/:sessionCode/:partnerSlot" component={QuestionnairePage} />
      <Route path="/waiting/:sessionCode/:partnerSlot" component={WaitingPage} />
      <Route path="/report/:sessionCode" component={ReportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
