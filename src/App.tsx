import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import ContentInput from "@/pages/ContentInput";
import Drill from "@/pages/Drill";
import Summary from "@/pages/Summary";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/NotFound";
import { AppProvider } from "@/lib/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="input" element={<ContentInput />} />
              <Route path="drill" element={<Drill />} />
              <Route path="summary" element={<Summary />} />
              <Route path="progress" element={<Progress />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
