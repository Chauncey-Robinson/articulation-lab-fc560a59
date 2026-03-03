import { createContext, useContext, useState, ReactNode } from "react";
import type { SessionSummary } from "@/lib/ai";

export interface SessionScore {
  clarity: number;
  example: number;
  held_together: number;
  date: string;
  context: string;
  key_idea: string;
  topic_snippet: string;
  say_tomorrow: string;
}

interface AppState {
  // Onboarding
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  painSelections: string[];
  setPainSelections: (s: string[]) => void;
  privacyMode: "improve" | "private";
  setPrivacyMode: (m: "improve" | "private") => void;

  // Context label derived from pain selections
  contextLabel: string;

  // Input & drill state
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

  // Sessions & streak
  sessions: SessionScore[];
  addSession: (s: SessionScore) => void;
  streakCount: number;
  lastPracticeDate: string;
  totalPractices: number;
  lastTopicSnippet: string | null;

  // Voice
  muted: boolean;
  toggleMute: () => void;

  // Notifications prompt shown
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

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [painSelections, setPainSelections] = useState<string[]>([]);
  const [privacyMode, setPrivacyMode] = useState<"improve" | "private">("private");
  const [source, setSource] = useState("");
  const [keyIdea, setKeyIdea] = useState("");
  const [keyQuestion, setKeyQuestion] = useState("");
  const [attempt1, setAttempt1] = useState("");
  const [attempt2, setAttempt2] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [sessions, setSessions] = useState<SessionScore[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [lastPracticeDate, setLastPracticeDate] = useState("");
  const [totalPractices, setTotalPractices] = useState(0);
  const [lastTopicSnippet, setLastTopicSnippet] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [notificationPromptShown, setNotificationPromptShown] = useState(false);

  const contextLabel = getContextLabel(painSelections);

  const addSession = (s: SessionScore) => {
    const today = getTodayStr();
    setSessions((prev) => [...prev, s]);
    setTotalPractices((prev) => prev + 1);
    setLastTopicSnippet(s.topic_snippet);

    if (lastPracticeDate === today) {
      // Already practised today
    } else if (lastPracticeDate) {
      const last = new Date(lastPracticeDate);
      const now = new Date(today);
      const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        setStreakCount((prev) => prev + 1);
      } else if (diff > 1) {
        setStreakCount(1);
      }
    } else {
      setStreakCount(1);
    }
    setLastPracticeDate(today);
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  };

  return (
    <Ctx.Provider
      value={{
        onboarded, setOnboarded,
        painSelections, setPainSelections,
        privacyMode, setPrivacyMode,
        contextLabel,
        source, setSource,
        keyIdea, setKeyIdea,
        keyQuestion, setKeyQuestion,
        attempt1, setAttempt1,
        attempt2, setAttempt2,
        challengeText, setChallengeText,
        summary, setSummary,
        sessions, addSession,
        streakCount, lastPracticeDate, totalPractices,
        lastTopicSnippet,
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
