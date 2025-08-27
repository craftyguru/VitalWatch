import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import HomeEnhanced from "@/pages/home-enhanced";
import Mood from "@/pages/mood";
import ToolsComprehensive from "@/pages/tools-comprehensive";
import ContactsEnhanced from "@/pages/contacts-enhanced";
import ProfileEnhanced from "@/pages/profile-enhanced";
import BillingPage from "@/pages/billing";

import AuthPage from "@/pages/auth";
import VerifyEmail from "@/pages/verify-email";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>

      <Route path="/auth/login" component={AuthPage} />
      <Route path="/auth/signup" component={AuthPage} />
      <Route path="/verify-email" component={VerifyEmail} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={HomeEnhanced} />
          <Route path="/dashboard" component={HomeEnhanced} />
          <Route path="/mood" component={Mood} />
          <Route path="/tools" component={ToolsComprehensive} />
          <Route path="/contacts" component={ContactsEnhanced} />
          <Route path="/profile" component={ProfileEnhanced} />
          <Route path="/billing" component={BillingPage} />
          <Route path="/landing" component={Landing} />
          {user?.isAdmin && <Route path="/admin" component={AdminDashboard} />}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vitalwatch-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;