import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic, AnthropicLimitError, AnthropicTool } from "../_shared/anthropic.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { type, title, source } = body as { type: "refresher" | "books"; title?: string; source?: string };
    if (!type || !title) return json({ error: "Missing fields" }, 400);

    const safeSource = (source || "").slice(0, 6000);

    let system: string;
    let userMessage: string;
    let tool: AnthropicTool;

    if (type === "refresher") {
      system = "You are a sharp thinking coach. Generate a 3-question Deep Recall set on the user's completed topic. Each question forces them to retrieve and reconstruct, not recognise. Plain language. Under 18 words each. Also write a 2-sentence refresher summary.";
      userMessage = `Topic: ${title}\n\nReference material (excerpt):\n${safeSource}`;
      tool = {
        name: "deep_recall",
        description: "Return a refresher summary plus three deep recall questions.",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-sentence refresher" },
            questions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          },
          required: ["summary", "questions"],
        },
      };
    } else if (type === "books") {
      system = "You are a high-end editorial curator. Recommend 3 widely respected books that deepen the user's mastery of the given topic. Prefer canonical, author-authoritative works. Keep the 'why' under 14 words and elegant.";
      userMessage = `Topic: ${title}`;
      tool = {
        name: "curated_reading",
        description: "Return three curated book recommendations.",
        input_schema: {
          type: "object",
          properties: {
            books: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  why: { type: "string" },
                },
                required: ["title", "author", "why"],
              },
            },
          },
          required: ["books"],
        },
      };
    } else {
      return json({ error: "Invalid type" }, 400);
    }

    const { tool_input } = await callAnthropic({
      system,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 1024,
      tool,
    });

    return json(tool_input ?? {});
  } catch (e) {
    if (e instanceof AnthropicLimitError) return json({ error: e.message, limited: true });
    console.error("topic-extras error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
