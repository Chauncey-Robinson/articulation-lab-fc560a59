import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SignIn from "@/pages/SignIn";
import Onboarding from "@/pages/Onboarding";
import Taste from "@/pages/Taste";
import TimePromise from "@/pages/TimePromise";
import Privacy from "@/pages/Privacy";
import Trial from "@/pages/Trial";
import Home from "@/pages/Home";
import ContentInput from "@/pages/ContentInput";
import Drill from "@/pages/Drill";
import Summary from "@/pages/Summary";
import Notifications from "@/pages/Notifications";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/NotFound";
import { AppProvider, useApp } from "@/lib/AppContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const { onboarded } = useApp();
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />

              {/* Auth-guarded onboarding flow (no layout) */}
              <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
              <Route path="/taste" element={<RequireAuth><Taste /></RequireAuth>} />
              <Route path="/time-promise" element={<RequireAuth><TimePromise /></RequireAuth>} />
              <Route path="/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />
              <Route path="/trial" element={<RequireAuth><Trial /></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

              {/* Auth+onboarded app routes with layout */}
              <Route path="/" element={<RequireAuth><RequireOnboarded><Layout /></RequireOnboarded></RequireAuth>}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="input" element={<ContentInput />} />
                <Route path="drill" element={<Drill />} />
                <Route path="summary" element={<Summary />} />
                <Route path="progress" element={<Progress />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
