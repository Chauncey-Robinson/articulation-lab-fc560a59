import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { SessionSummary } from "@/lib/ai";

// [APP] Types matching DB schema
export interface Concept {
  id: string;
  user_id: string;
  created_at: string;
  topic_snippet: string;
  key_idea: string;
  source_content: string;
  status: "practicing" | "getting_there" | "solid";
  next_practice_date: string;
  last_practiced: string | null;
  practice_count: number;
}

export interface SessionRecord {
  id: string;
  concept_id: string;
  user_id: string;
  practiced_at: string;
  clarity: number;
  example: number;
  held_together: number;
  what_worked: string;
  work_on_next: string;
  say_tomorrow: string;
}

export interface UserProgress {
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
  total_sessions: number;
}

interface AppState {
  // Pain selections (stored locally, asked after first practice)
  painSelections: string[];
  setPainSelections: (s: string[]) => void;
  painAsked: boolean;
  setPainAsked: (v: boolean) => void;
  contextLabel: string;

  // Current practice state (ephemeral)
  source: string;
  setSource: (s: string) => void;
  keyIdea: string;
  setKeyIdea: (s: string) => void;
  keyQuestion: string;
  setKeyQuestion: (s: string) => void;
  attempt1: string;
  setAttempt1: (a: string) => void;
  attempt2: string;
  setAttempt2: (a: string) => void;
  challengeText: string;
  setChallengeText: (t: string) => void;
  summary: SessionSummary | null;
  setSummary: (s: SessionSummary | null) => void;

  // Current concept being practiced
  currentConceptId: string | null;
  setCurrentConceptId: (id: string | null) => void;

  // DB-backed data
  concepts: Concept[];
  progress: UserProgress;
  loadingData: boolean;

  // Actions
  saveConceptAndSession: (params: {
    topicSnippet: string;
    keyIdea: string;
    sourceContent: string;
    summary: SessionSummary;
    existingConceptId?: string;
  }) => Promise<void>;
  refreshData: () => Promise<void>;

  // Voice
  muted: boolean;
  toggleMute: () => void;

  // Notifications prompt
  notificationPromptShown: boolean;
  setNotificationPromptShown: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

function getContextLabel(selections: string[]): string {
  const joined = selections.join(" ");
  if (joined.includes("go blank") || joined.includes("freeze")) return "GETTING CLEARER";
  if (joined.includes("remember") || joined.includes("notes")) return "MAKING IT STICK";
  if (joined.includes("meetings")) return "SOUNDING SHARPER";
  return "ABOUT 5 MINUTES";
}

function calculateNextPracticeDate(practiceCount: number, clarity: number, example: number, heldTogether: number): string {
  let daysToAdd: number;
  if (practiceCount <= 1) daysToAdd = 3;
  else if (practiceCount === 2) daysToAdd = 7;
  else if (practiceCount === 3) daysToAdd = 14;
  else daysToAdd = 30;

  const avg = (clarity + example + heldTogether) / 3;
  if (avg < 3) daysToAdd = Math.max(1, daysToAdd - 1);
  if (clarity >= 5 && example >= 5 && heldTogether >= 5) daysToAdd += 3;

  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

function computeConceptStatus(practiceCount: number, avgScore: number, lastWasColdRecall: boolean): "practicing" | "getting_there" | "solid" {
  if (practiceCount >= 3 && avgScore >= 4 && lastWasColdRecall) return "solid";
  if (practiceCount >= 2 && avgScore >= 3) return "getting_there";
  return "practicing";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [painSelections, setPainSelections] = useState<string[]>([]);
  const [painAsked, setPainAsked] = useState(false);
  const [source, setSource] = useState("");
  const [keyIdea, setKeyIdea] = useState("");
  const [keyQuestion, setKeyQuestion] = useState("");
  const [attempt1, setAttempt1] = useState("");
  const [attempt2, setAttempt2] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [currentConceptId, setCurrentConceptId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [notificationPromptShown, setNotificationPromptShown] = useState(false);

  // DB state
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    current_streak: 0,
    longest_streak: 0,
    last_practice_date: null,
    total_sessions: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  const contextLabel = getContextLabel(painSelections);

  const refreshData = useCallback(async () => {
    if (!user) {
      setLoadingData(false);
      return;
    }
    try {
      const [conceptsRes, progressRes] = await Promise.all([
        supabase.from("concepts").select("*").eq("user_id", user.id).order("next_practice_date", { ascending: true }),
        supabase.from("user_progress").select("*").eq("user_id", user.id).single(),
      ]);

      if (conceptsRes.data) setConcepts(conceptsRes.data as unknown as Concept[]);

      if (progressRes.data) {
        setProgress(progressRes.data as unknown as UserProgress);
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const saveConceptAndSession = useCallback(async (params: {
    topicSnippet: string;
    keyIdea: string;
    sourceContent: string;
    summary: SessionSummary;
    existingConceptId?: string;
  }) => {
    if (!user) return;

    const { topicSnippet, keyIdea, sourceContent, summary: sum, existingConceptId } = params;
    const today = new Date().toISOString().split("T")[0];

    let conceptId = existingConceptId;
    let newPracticeCount = 1;

    if (existingConceptId) {
      // Update existing concept
      const existing = concepts.find(c => c.id === existingConceptId);
      newPracticeCount = (existing?.practice_count || 0) + 1;
      const avgScore = (sum.clarity + sum.example + sum.held_together) / 3;
      // For cold recall check — if practice_count was >= 3 before this session, this was cold recall
      const wasColdRecall = (existing?.practice_count || 0) >= 3;
      const newStatus = computeConceptStatus(newPracticeCount, avgScore, wasColdRecall);
      const nextDate = calculateNextPracticeDate(newPracticeCount, sum.clarity, sum.example, sum.held_together);

      await supabase.from("concepts").update({
        practice_count: newPracticeCount,
        last_practiced: today,
        next_practice_date: nextDate,
        status: newStatus,
      } as any).eq("id", existingConceptId);
    } else {
      // Create new concept
      const nextDate = calculateNextPracticeDate(1, sum.clarity, sum.example, sum.held_together);
      const { data: newConcept } = await supabase.from("concepts").insert({
        user_id: user.id,
        topic_snippet: topicSnippet,
        key_idea: keyIdea,
        source_content: sourceContent,
        status: "practicing",
        next_practice_date: nextDate,
        last_practiced: today,
        practice_count: 1,
      } as any).select().single();
      if (newConcept) conceptId = (newConcept as any).id;
    }

    // Save session
    if (conceptId) {
      await supabase.from("sessions").insert({
        concept_id: conceptId,
        user_id: user.id,
        clarity: sum.clarity,
        example: sum.example,
        held_together: sum.held_together,
        what_worked: sum.what_worked,
        work_on_next: sum.work_on_next,
        say_tomorrow: sum.say_tomorrow,
      } as any);
    }

    // Update streak
    const newTotal = progress.total_sessions + 1;
    let newStreak = progress.current_streak;
    let newLongest = progress.longest_streak;

    if (progress.last_practice_date === today) {
      // Already practiced today, no streak change
    } else if (progress.last_practice_date) {
      const last = new Date(progress.last_practice_date);
      const now = new Date(today);
      const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        newStreak += 1;
      } else if (diff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    newLongest = Math.max(newLongest, newStreak);

    // Upsert user_progress
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_practice_date: today,
      total_sessions: newTotal,
    } as any);

    await refreshData();
  }, [user, concepts, progress, refreshData]);

  const toggleMute = () => {
    setMuted((m) => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  };

  return (
    <Ctx.Provider
      value={{
        painSelections, setPainSelections,
        painAsked, setPainAsked,
        contextLabel,
        source, setSource,
        keyIdea, setKeyIdea,
        keyQuestion, setKeyQuestion,
        attempt1, setAttempt1,
        attempt2, setAttempt2,
        challengeText, setChallengeText,
        summary, setSummary,
        currentConceptId, setCurrentConceptId,
        concepts, progress, loadingData,
        saveConceptAndSession, refreshData,
        muted, toggleMute,
        notificationPromptShown, setNotificationPromptShown,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
