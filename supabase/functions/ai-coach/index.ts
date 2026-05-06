import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic, AnthropicLimitError } from "../_shared/anthropic.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const { type } = body;

    let systemPrompt: string;
    let userMessage: string;
    let maxTokens = 300;

    if (type === "extract") {
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
      return json({ error: "Invalid type" }, 400);
    }

    const { text } = await callAnthropic({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: maxTokens,
    });

    if (type === "extract") {
      const keyIdeaMatch = text.match(/KEY IDEA:\s*(.+?)(?:\n|$)/i);
      const questionMatch = text.match(/QUESTION:\s*(.+?)(?:\n|$)/i);
      const keyIdea = keyIdeaMatch ? keyIdeaMatch[1].trim() : text;
      const question = questionMatch ? questionMatch[1].trim() : "Explain this back to me like you are telling a friend who has never heard of this.";
      return json({ keyIdea, question });
    }

    return json({ content: text });
  } catch (e) {
    if (e instanceof AnthropicLimitError) {
      return json({ error: e.message, limited: true });
    }
    console.error("ai-coach error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
