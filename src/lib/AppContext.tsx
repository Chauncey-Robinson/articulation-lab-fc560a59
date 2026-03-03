import { createContext, useContext, useState, ReactNode } from "react";
import type { SessionSummary } from "@/lib/ai";

export interface SessionScore {
  clarity: number;
  example: number;
  argument: number;
}

interface AppState {
  context: string;
  setContext: (c: string) => void;
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
  sessions: SessionScore[];
  addSession: (s: SessionScore) => void;
  muted: boolean;
  toggleMute: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState("");
  const [source, setSource] = useState("");
  const [attempt1, setAttempt1] = useState("");
  const [attempt2, setAttempt2] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [sessions, setSessions] = useState<SessionScore[]>([]);
  const [muted, setMuted] = useState(false);

  const addSession = (s: SessionScore) => setSessions((prev) => [...prev, s]);
  const toggleMute = () => {
    setMuted((m) => {
      if (!m) window.speechSynthesis?.cancel();
      return !m;
    });
  };

  return (
    <Ctx.Provider
      value={{
        context, setContext,
        source, setSource,
        attempt1, setAttempt1,
        attempt2, setAttempt2,
        challengeText, setChallengeText,
        summary, setSummary,
        sessions, addSession,
        muted, toggleMute,
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
