import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixBackground from "@/components/MatrixBackground";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import TermsPage          from '@/footer-components/terms';
import PrivacyPage        from '@/footer-components/privacy';
import CookiesPage        from '@/footer-components/cookies';
import AcceptableUsePage  from '@/footer-components/acceptable-use';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />

      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/acceptable-use" component={AcceptableUsePage} />
      
      <Route component={NotFound} />

    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <MatrixBackground>
            <ScrollToTop />
            <Navbar />
            <Toaster />
            <Router />
            <Footer />
          </MatrixBackground>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
