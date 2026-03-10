import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SignIn from "@/pages/SignIn";
import Landing from "@/pages/Landing";
import ContentInput from "@/pages/ContentInput";
import Drill from "@/pages/Drill";
import Summary from "@/pages/Summary";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import Progress from "@/pages/Progress";
import Notifications from "@/pages/Notifications";
import PainSelection from "@/pages/PainSelection";
import NotFound from "@/pages/NotFound";
import { AppProvider } from "@/lib/AppContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import IPhoneFrame from "@/components/IPhoneFrame";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing is the entry point — public */}
              <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
              <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />

              {/* Main app with bottom tabs */}
              <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route path="home" element={<Home />} />
              </Route>

              {/* Full-screen routes */}
              <Route path="/input" element={<RequireAuth><ContentInput /></RequireAuth>} />
              <Route path="/practice" element={<RequireAuth><Drill /></RequireAuth>} />
              <Route path="/summary" element={<RequireAuth><Summary /></RequireAuth>} />
              <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
              <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
              <Route path="/pain-selection" element={<RequireAuth><PainSelection /></RequireAuth>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
