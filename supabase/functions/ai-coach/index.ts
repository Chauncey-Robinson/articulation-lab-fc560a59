import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { type } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userMessage: string;
    let maxTokens = 300;

    if (type === "extract") {
      // [APP] AI finds the key idea from pasted content or topic
      systemPrompt = `You are a sharp personal thinking coach.
The user has shared something they are learning.
Your job is to read it and do the work for them.
Find the single most important idea in what they shared.
Not a summary. The ONE thing that if truly understood would be most useful to be able to explain.
Respond in exactly this format and nothing else:
KEY IDEA: [one sentence, plain language, under 25 words, no jargon, start with 'The key idea is...']
QUESTION: [one sentence asking them to explain it back, always end with: 'Explain that back to me like you are telling a friend who has never heard of this.']
Do not ask them what they already know.
Do not summarise everything.
Do not give them a list.
One idea. One question. That is it.`;
      userMessage = body.content;
      maxTokens = 200;
    } else if (type === "taste") {
      systemPrompt = `You are a warm, sharp thinking coach. The user just did their very first ever explanation. Give them ONE specific observation under 40 words. Be precise but warm — this is their first go. Do not ask a question here. Do not give generic praise like 'great job'. Start with 'You' or 'Your'. Name something specific about what they actually wrote.`;
      userMessage = `The idea: ${body.source}\nTheir explanation: ${body.explanation}`;
      maxTokens = 150;
    } else if (type === "challenge") {
      systemPrompt = `You are a sharp, economy-of-words thinking coach.
The user just explained an idea back in their own words.
Read their explanation carefully.
Find the single biggest gap: missing logic, vague claim, no example, weak structure, unexplained assumption.
Adapt how you respond to what they actually wrote:
— Vague or all over the place: Be direct. Say exactly what is missing. Then ask one question.
— Confident but missing something: Name the specific gap. Then ask one question.
— Structured but staying surface level: Ask one question that makes them go deeper. Do not give the answer away.
Hard rules:
Never ask two questions.
Never repeat what they wrote back to them.
Never start with praise.
Never use the words articulate, cognitive, Socratic.
Keep everything under 60 words.
Write like a smart friend, not a teacher.`;
      userMessage = `Original idea: ${body.keyIdea}\n\nTheir explanation: ${body.explanation}`;
      maxTokens = 300;
    } else if (type === "summary") {
      systemPrompt = `You are a thinking coach giving a short debrief.
Return ONLY valid JSON. No markdown. No backticks.
Exact shape:
{
  "clarity": <integer 0-10>,
  "example": <integer 0-10>,
  "held_together": <integer 0-10>,
  "what_worked": "<one sentence, max 25 words, plain language, specific>",
  "work_on_next": "<one sentence, max 25 words, plain language, not jargon>",
  "say_tomorrow": "<one sentence the user could say out loud in a meeting or conversation tomorrow, max 25 words, professionally worded, genuinely usable, NOT a rephrasing of the source>"
}
The say_tomorrow must sound like something a real person would actually say. Not a textbook definition. Not a summary. Something speakable.
Context: ${body.context}.`;
      userMessage = `Original idea: ${body.keyIdea}\nFirst try: ${body.attempt1}\nSecond try: ${body.attempt2}`;
      maxTokens = 400;
    } else if (type === "scenario") {
      // [APP] Scenario mode — generates a realistic professional situation for returning concepts
      systemPrompt = `You are a sharp thinking coach creating a realistic scenario.
The user has practiced this concept before and is returning to it.
Read the key idea and topic.
Generate ONE realistic professional situation the user is likely to face.
Frame as a direct challenge: "A client asks..." or "Your manager wants to know..." or "Someone in a meeting challenges..."
Under 30 words.
Match context to content: finance content → client or board scenario; leadership content → team scenario; technical content → colleague or presentation scenario.
Do not explain the concept. Do not give hints. Just the scenario.`;
      userMessage = `Topic: ${body.topicSnippet}\nKey idea: ${body.keyIdea}`;
      maxTokens = 100;
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

    // For extract type, parse the KEY IDEA and QUESTION
    if (type === "extract") {
      const keyIdeaMatch = content.match(/KEY IDEA:\s*(.+?)(?:\n|$)/i);
      const questionMatch = content.match(/QUESTION:\s*(.+?)(?:\n|$)/i);
      const keyIdea = keyIdeaMatch ? keyIdeaMatch[1].trim() : content;
      const question = questionMatch ? questionMatch[1].trim() : "Explain this back to me like you are telling a friend who has never heard of this.";
      return new Response(JSON.stringify({ keyIdea, question }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
