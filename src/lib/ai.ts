import { supabase } from "@/integrations/supabase/client";

export async function extractKeyIdea(content: string): Promise<{ keyIdea: string; question: string }> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "extract", content },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function getChallenge(contextLabel: string, keyIdea: string, explanation: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "challenge", context: contextLabel, keyIdea, explanation },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export async function getTasteFeedback(source: string, explanation: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "taste", source, explanation },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export interface SessionSummary {
  clarity: number;
  example: number;
  held_together: number;
  what_worked: string;
  work_on_next: string;
  say_tomorrow: string;
}

export async function getSummary(
  contextLabel: string,
  keyIdea: string,
  attempt1: string,
  attempt2: string
): Promise<SessionSummary> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "summary", context: contextLabel, keyIdea, attempt1, attempt2 },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);

  let content = data.content as string;
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(content) as SessionSummary;
}
