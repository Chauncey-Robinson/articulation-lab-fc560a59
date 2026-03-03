import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Splash from "@/pages/Splash";
import SignIn from "@/pages/SignIn";
import Onboarding from "@/pages/Onboarding";
import ContentInput from "@/pages/ContentInput";
import Drill from "@/pages/Drill";
import Summary from "@/pages/Summary";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/NotFound";
import { AppProvider } from "@/lib/AppContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/splash" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/input" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/splash" element={<PublicOnly><Splash /></PublicOnly>} />
              <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />

              {/* Auth-guarded onboarding (no layout nav) */}
              <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

              {/* Auth-guarded app routes with layout */}
              <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<Navigate to="/input" replace />} />
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
