import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "@/pages/SignIn";
import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import ModuleView from "@/pages/ModuleView";
import LessonStudy from "@/pages/LessonStudy";
import Quiz from "@/pages/Quiz";
import TeachBack from "@/pages/TeachBack";
import Apply from "@/pages/Apply";
import Analytics from "@/pages/Analytics";
import Dialogue from "@/pages/Dialogue";
import Flashcards from "@/pages/Flashcards";
import TestConfig from "@/pages/TestConfig";
import Deadlines from "@/pages/Deadlines";
import LearnConfig from "@/pages/LearnConfig";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Demo from "@/pages/Demo";
import Pricing from "@/pages/Pricing";
import MeetingRecord from "@/pages/MeetingRecord";
import MeetingReview from "@/pages/MeetingReview";
import Screenshots from "@/pages/Screenshots";

import { TutorProvider } from "@/lib/TutorContext";
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
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TutorProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/demo" element={<Demo />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/screenshots" element={<Screenshots />} />
              

              <Route path="/*" element={
                <IPhoneFrame>
                  <Routes>
                    <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
                    <Route path="/signin" element={<PublicOnly><SignIn /></PublicOnly>} />

                    <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
                    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                    <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
                    <Route path="/learn-config/:moduleId" element={<RequireAuth><LearnConfig /></RequireAuth>} />
                    <Route path="/module/:id" element={<RequireAuth><ModuleView /></RequireAuth>} />
                    <Route path="/study/:id" element={<RequireAuth><LessonStudy /></RequireAuth>} />
                    <Route path="/quiz/:moduleId" element={<RequireAuth><Quiz /></RequireAuth>} />
                    <Route path="/teach-back/:lessonId" element={<RequireAuth><TeachBack /></RequireAuth>} />
                    <Route path="/apply/:lessonId" element={<RequireAuth><Apply /></RequireAuth>} />
                    <Route path="/dialogue/:lessonId" element={<RequireAuth><Dialogue /></RequireAuth>} />
                    <Route path="/flashcards/:moduleId" element={<RequireAuth><Flashcards /></RequireAuth>} />
                    <Route path="/test-config/:moduleId" element={<RequireAuth><TestConfig /></RequireAuth>} />
                    <Route path="/deadlines" element={<RequireAuth><Deadlines /></RequireAuth>} />
                    <Route path="/meeting/record" element={<RequireAuth><MeetingRecord /></RequireAuth>} />
                    <Route path="/meeting/:id" element={<RequireAuth><MeetingReview /></RequireAuth>} />
                    <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
                    <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </IPhoneFrame>
              } />
            </Routes>
          </BrowserRouter>
        </TutorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
