import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic, AnthropicLimitError } from "../_shared/anthropic.ts";

const MAX_TRANSCRIPT_LENGTH = 100000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const { transcript, meetingType } = await req.json();
    if (typeof transcript !== "string" || transcript.length === 0 || transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return json({ error: `Transcript must be a non-empty string under ${MAX_TRANSCRIPT_LENGTH} characters` }, 400);
    }

    const system = `You are an expert meeting analyst. Analyze the following ${meetingType || "meeting"} transcript and extract structured insights. Be thorough but concise. Focus on actionable and educational content.`;

    const { tool_input } = await callAnthropic({
      system,
      messages: [{ role: "user", content: transcript }],
      max_tokens: 2048,
      tool: {
        name: "meeting_analysis",
        description: "Return structured meeting analysis",
        input_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Concise descriptive title" },
            summary: { type: "string", description: "2-4 paragraph summary" },
            action_items: { type: "array", items: { type: "string" } },
            key_learnings: { type: "array", items: { type: "string" } },
            decisions: { type: "array", items: { type: "string" } },
            questions_raised: { type: "array", items: { type: "string" } },
          },
          required: ["title", "summary", "action_items", "key_learnings", "decisions", "questions_raised"],
        },
      },
    });

    if (!tool_input) throw new Error("No structured analysis returned");
    return json(tool_input);
  } catch (e) {
    if (e instanceof AnthropicLimitError) return json({ error: e.message, limited: true });
    console.error("meeting-summary error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
