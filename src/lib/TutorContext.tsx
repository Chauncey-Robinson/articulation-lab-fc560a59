import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Module {
  id: string;
  user_id: string;
  title: string;
  source_content: string;
  source_type: string;
  status: string;
  lesson_count: number;
  completed_lessons: number;
  created_at: string;
  processing_state?: "pending" | "processing" | "ready" | "failed";
  processing_started_at?: string | null;
  processing_error?: string | null;
  storage_path?: string | null;
}

export interface Lesson {
  id: string;
  module_id: string;
  user_id: string;
  title: string;
  content: string;
  key_idea: string;
  lesson_order: number;
  completed: boolean;
  created_at: string;
}

export interface Profile {
  user_id: string;
  display_name: string | null;
  profession: string | null;
  degree: string | null;
  interests: string[];
  gender: string | null;
  age_range: string | null;
  learning_style: string | null;
  onboarded: boolean;
}

interface TutorState {
  profile: Profile | null;
  modules: Module[];
  loading: boolean;
  refreshModules: () => Promise<void>;
  saveProfile: (data: Partial<Profile>) => Promise<void>;
  progress: { total_sessions: number; current_streak: number; longest_streak: number; last_practice_date: string | null };
}

const TutorContext = createContext<TutorState | null>(null);

export function TutorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ total_sessions: 0, current_streak: 0, longest_streak: 0, last_practice_date: null as string | null });

  const refreshModules = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("modules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setModules(data as unknown as Module[]);
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    
    (async () => {
      try {
        const [profileRes, modulesRes, progressRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("modules").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
        ]);
        if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
        if (modulesRes.data) setModules(modulesRes.data as unknown as Module[]);
        if (progressRes.data) setProgress(progressRes.data as unknown as typeof progress);
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveProfile = useCallback(async (data: Partial<Profile>) => {
    if (!user) return;
    const profileData = { ...data, user_id: user.id };
    await supabase.from("profiles").upsert(profileData as any);
    const { data: updated } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (updated) setProfile(updated as unknown as Profile);
  }, [user]);

  return (
    <TutorContext.Provider value={{ profile, modules, loading, refreshModules, saveProfile, progress }}>
      {children}
    </TutorContext.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorContext);
  if (!ctx) throw new Error("useTutor must be used within TutorProvider");
  return ctx;
}
