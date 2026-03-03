import { createContext, useContext, useState, ReactNode } from "react";
import type { SessionSummary } from "@/lib/ai";

export interface SessionScore {
  clarity: number;
  example: number;
  argument: number;
  date: string;
  context: string;
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

  // Drill state
  source: string;
  setSource: (s: string) => void;
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
  lastDrillDate: string;
  totalSessions: number;

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
  if (joined.includes("go blank") || joined.includes("freeze")) return "CLARITY UNDER PRESSURE";
  if (joined.includes("remember") || joined.includes("notes")) return "RETENTION";
  if (joined.includes("meetings")) return "COMMUNICATION";
  return "PRACTICE";
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [painSelections, setPainSelections] = useState<string[]>([]);
  const [privacyMode, setPrivacyMode] = useState<"improve" | "private">("private");
  const [source, setSource] = useState("");
  const [attempt1, setAttempt1] = useState("");
  const [attempt2, setAttempt2] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [sessions, setSessions] = useState<SessionScore[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [lastDrillDate, setLastDrillDate] = useState("");
  const [totalSessions, setTotalSessions] = useState(0);
  const [muted, setMuted] = useState(false);
  const [notificationPromptShown, setNotificationPromptShown] = useState(false);

  const contextLabel = getContextLabel(painSelections);

  const addSession = (s: SessionScore) => {
    const today = getTodayStr();
    setSessions((prev) => [...prev, s]);
    setTotalSessions((prev) => prev + 1);

    // Streak logic
    if (lastDrillDate === today) {
      // Already drilled today, streak intact
    } else if (lastDrillDate) {
      const last = new Date(lastDrillDate);
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
    setLastDrillDate(today);
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
        attempt1, setAttempt1,
        attempt2, setAttempt2,
        challengeText, setChallengeText,
        summary, setSummary,
        sessions, addSession,
        streakCount, lastDrillDate, totalSessions,
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
