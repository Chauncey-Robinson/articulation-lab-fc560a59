import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getState } from "@/lib/store";
import Layout from "@/components/Layout";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import ContentInput from "@/pages/ContentInput";
import Drill from "@/pages/Drill";
import CognitiveGraph from "@/pages/CognitiveGraph";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const state = getState();
  if (!state.profile.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Layout>{children}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/input" element={<ProtectedRoute><ContentInput /></ProtectedRoute>} />
          <Route path="/drill" element={<ProtectedRoute><Drill /></ProtectedRoute>} />
          <Route path="/graph" element={<ProtectedRoute><CognitiveGraph /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
