import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Forums from "@/pages/forums";
import Jobs from "@/pages/jobs";
import Resources from "@/pages/resources";
import Events from "@/pages/events";
import Profile from "@/pages/profile";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={Auth} />
          <Route path="/forums">
            <ProtectedRoute>
              <Forums />
            </ProtectedRoute>
          </Route>
          <Route path="/jobs">
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          </Route>
          <Route path="/resources">
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          </Route>
          <Route path="/events">
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
