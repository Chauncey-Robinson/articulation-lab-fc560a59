import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context, source, explanation, attempt1, attempt2 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userMessage: string;
    let maxTokens = 300;

    if (type === "taste") {
      systemPrompt = `You are a warm, sharp thinking coach. The user just did their very first practice explanation. Give them ONE specific observation in under 40 words. Be precise but encouraging — this is their first attempt. Do not ask a question. Do not give generic praise. Start with 'You' or 'Your'. Name something specific about what they actually wrote.`;
      userMessage = `Source: ${source}\nExplanation: ${explanation}`;
      maxTokens = 150;
    } else if (type === "challenge") {
      systemPrompt = `You are a sharp, economy-of-words thinking coach.
Read the user's explanation carefully.
Find the single biggest gap: missing logic, vague claim, no example, weak structure, or unexplained assumption.
Adapt your style to what they wrote:
— Vague or scattered → be direct. Name exactly what's missing. Then ask one question.
— Confident but incomplete → be analytical. Name the specific gap. Then ask one question.
— Structured but shallow → be Socratic. Ask one question that forces depth. Don't give the answer.
Rules: Never ask two questions. Never summarise what they wrote back to them. Never open with praise. Never use the word 'articulation'. Keep total response under 60 words.
Context: ${context}.`;
      userMessage = `Source: ${source}\n\nExplanation: ${explanation}`;
      maxTokens = 300;
    } else if (type === "summary") {
      systemPrompt = `You are a thinking coach giving a session debrief.
Return ONLY valid JSON. No markdown. No backticks.
Exact shape:
{
  "clarity": <integer 0-10>,
  "example": <integer 0-10>,
  "argument": <integer 0-10>,
  "what_worked": "<one sentence, max 25 words>",
  "core_gap": "<one sentence, max 25 words>",
  "meeting_line": "<one sentence usable in a real meeting tomorrow, max 25 words, professionally worded, not a rephrasing of the source>"
}
Be a coach, not a cheerleader.
The meeting_line must be genuinely speakable out loud.
Context: ${context}.`;
      userMessage = `Source: ${source}\nAttempt 1: ${attempt1}\nAttempt 2: ${attempt2}`;
      maxTokens = 400;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
