import { supabase } from "@/integrations/supabase/client";

export async function getChallenge(context: string, source: string, explanation: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "challenge", context, source, explanation },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);
  return data.content;
}

export interface SessionSummary {
  clarity: number;
  example: number;
  argument: number;
  what_worked: string;
  core_gap: string;
  meeting_line: string;
}

export async function getSummary(
  context: string,
  source: string,
  attempt1: string,
  attempt2: string
): Promise<SessionSummary> {
  const { data, error } = await supabase.functions.invoke("ai-coach", {
    body: { type: "summary", context, source, attempt1, attempt2 },
  });
  if (error) throw new Error(error.message || "AI request failed");
  if (data?.error) throw new Error(data.error);

  let content = data.content as string;
  // Strip markdown backticks if present
  content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(content) as SessionSummary;
}
