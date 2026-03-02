export interface Concept {
  id: string;
  text: string;
  source: string;
  strength: "weak" | "building" | "strong";
  retentionScore: number;
  lastArticulated: string;
  nextReview: string;
  createdAt: string;
  drillCount: number;
}

export interface UserProfile {
  useCase: string;
  tone: string;
  onboarded: boolean;
}

export interface DrillResult {
  conceptId: string;
  date: string;
  completeness: number;
  structure: number;
  clarity: number;
  precision: number;
  specificity: number;
  applicationDepth: "low" | "moderate" | "high";
}

export interface AppState {
  profile: UserProfile;
  concepts: Concept[];
  drillResults: DrillResult[];
  retentionScore: number;
  articulationDepth: "low" | "moderate" | "high";
  applicationClarity: "low" | "moderate" | "high";
}

const DEFAULT_STATE: AppState = {
  profile: { useCase: "", tone: "", onboarded: false },
  concepts: [],
  drillResults: [],
  retentionScore: 0,
  articulationDepth: "low",
  applicationClarity: "low",
};

export function getState(): AppState {
  try {
    const raw = localStorage.getItem("cognitive-drill-state");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...DEFAULT_STATE };
}

export function setState(state: AppState) {
  localStorage.setItem("cognitive-drill-state", JSON.stringify(state));
}

export function updateState(updater: (s: AppState) => AppState) {
  const s = getState();
  setState(updater(s));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function addDaysToDate(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
