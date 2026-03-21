import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, meetingType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert meeting analyst. Analyze the following ${meetingType || "meeting"} transcript and extract structured insights.

Return a JSON object with these fields:
- title: A concise, descriptive title for the meeting (string)
- summary: A clear 2-4 paragraph summary of what was discussed (string)
- action_items: Array of action items/tasks mentioned (array of strings)
- key_learnings: Array of key concepts, insights, or takeaways someone could study (array of strings)
- decisions: Array of decisions that were made (array of strings)
- questions_raised: Array of open questions or unresolved items (array of strings)

Be thorough but concise. Focus on actionable and educational content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        tools: [{
          type: "function",
          function: {
            name: "meeting_analysis",
            description: "Return structured meeting analysis",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                action_items: { type: "array", items: { type: "string" } },
                key_learnings: { type: "array", items: { type: "string" } },
                decisions: { type: "array", items: { type: "string" } },
                questions_raised: { type: "array", items: { type: "string" } },
              },
              required: ["title", "summary", "action_items", "key_learnings", "decisions", "questions_raised"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "meeting_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      throw new Error(`AI gateway error [${response.status}]: ${errText}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meeting-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
