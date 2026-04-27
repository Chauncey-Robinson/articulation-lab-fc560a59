import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { type, title, source } = body as { type: "refresher" | "books"; title?: string; source?: string };
    if (!type || !title) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeSource = (source || "").slice(0, 6000);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: any[];
    let tools: any[];
    let toolName: string;

    if (type === "refresher") {
      toolName = "deep_recall";
      messages = [
        {
          role: "system",
          content:
            "You are a sharp thinking coach. Generate a 3-question Deep Recall set on the user's completed topic. Each question forces them to retrieve and reconstruct, not recognise. Plain language. Under 18 words each. Also write a 2-sentence refresher summary.",
        },
        {
          role: "user",
          content: `Topic: ${title}\n\nReference material (excerpt):\n${safeSource}`,
        },
      ];
      tools = [
        {
          type: "function",
          function: {
            name: "deep_recall",
            description: "Return a refresher summary plus three deep recall questions.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "2-sentence refresher" },
                questions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["summary", "questions"],
              additionalProperties: false,
            },
          },
        },
      ];
    } else if (type === "books") {
      toolName = "curated_reading";
      messages = [
        {
          role: "system",
          content:
            "You are a high-end editorial curator. Recommend 3 widely respected books that deepen the user's mastery of the given topic. Prefer canonical, author-authoritative works. Keep the 'why' under 14 words and elegant.",
        },
        { role: "user", content: `Topic: ${title}` },
      ];
      tools = [
        {
          type: "function",
          function: {
            name: "curated_reading",
            description: "Return three curated book recommendations.",
            parameters: {
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
                    additionalProperties: false,
                  },
                },
              },
              required: ["books"],
              additionalProperties: false,
            },
          },
        },
      ];
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
        messages,
        tools,
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("topic-extras gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    let parsed: any = {};
    if (args) {
      try { parsed = JSON.parse(args); } catch { /* ignore */ }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("topic-extras error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
