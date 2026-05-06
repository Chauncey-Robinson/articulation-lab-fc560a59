import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic, AnthropicLimitError } from "../_shared/anthropic.ts";

interface ToolDef {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

function buildRequest(body: Record<string, unknown>) {
  const { type } = body;

  let systemPrompt: string;
  let userMessage: string;
  let maxTokens = 500;
  let tool: ToolDef | null = null;

  if (type === "generate_lessons") {
    systemPrompt = `You are an expert educator. The user has uploaded learning material.
Your job: Read it carefully, identify the 3-5 most important concepts, and create a mini-lecture for each.
Each lesson should:
- Have a clear, specific title (under 10 words)
- Contain a concise explanation (80-150 words) written for someone encountering this for the first time
- Include a key idea summary (one sentence, under 25 words)
- Be ordered from foundational to advanced
Return the lessons using the provided tool.`;
    userMessage = body.content as string;
    maxTokens = 2000;
    tool = {
      name: "create_lessons",
      description: "Create structured lessons from the uploaded content",
      input_schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Overall module title, under 8 words" },
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                key_idea: { type: "string" },
              },
              required: ["title", "content", "key_idea"],
            },
          },
        },
        required: ["title", "lessons"],
      },
    };

  } else if (type === "generate_quiz") {
    const learningStyle = body.learningStyle as string || "";
    let questionMix = `Mix question types:
- 1 open-ended question (requires explanation)
- 1 multiple choice (4 options, one correct)
- 1 true/false`;

    if (learningStyle === "kinesthetic") {
      questionMix = `Generate 4 questions. Start with easier types and progress:
- 2 multiple choice (4 options, one correct) — application-focused
- 1 true/false
- 1 open-ended question requiring the user to explain how they'd apply the concept`;
    } else if (learningStyle === "visual") {
      questionMix = `Generate 3 questions. Focus on recognition and pattern-matching:
- 2 multiple choice (4 options, one correct) — include concrete examples
- 1 true/false with a tricky distinction`;
    } else if (learningStyle === "auditory") {
      questionMix = `Generate 3 questions. Favor discussion-style questions:
- 1 multiple choice (4 options, one correct)
- 1 true/false
- 1 open-ended question phrased as "How would you explain..."`;
    } else if (learningStyle === "reading") {
      questionMix = `Generate 4 questions. Include detail-oriented questions:
- 1 multiple choice (4 options, one correct)
- 1 true/false about a specific detail
- 2 open-ended questions testing precise understanding`;
    }

    systemPrompt = `You are a sharp knowledge tester. Given a lesson's content and key idea, generate quiz questions.
${questionMix}
Questions should test understanding, not memorization.
Return using the provided tool.`;
    userMessage = `Lesson: ${body.lessonTitle}\nContent: ${body.lessonContent}\nKey idea: ${body.keyIdea}`;
    maxTokens = 1200;
    tool = {
      name: "create_quiz",
      description: "Create quiz questions for a lesson",
      input_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                question_type: { type: "string", enum: ["open", "multiple_choice", "true_false"] },
                options: { type: "array", items: { type: "string" }, description: "For multiple_choice: 4 options. For true_false: ['True', 'False']. For open: empty array." },
                correct_answer: { type: "string", description: "The correct answer text" },
              },
              required: ["question", "question_type", "options", "correct_answer"],
            },
          },
        },
        required: ["questions"],
      },
    };

  } else if (type === "evaluate_answer") {
    systemPrompt = `You are a warm but precise knowledge evaluator.
The user answered a quiz question. Evaluate their answer.
- For open questions: assess understanding, not exact wording. Be specific about what they got right and what's missing.
- For multiple choice/true-false: state if correct and explain why.
Keep feedback under 60 words. Be encouraging but honest.
Return using the provided tool.`;
    userMessage = `Question: ${body.question}\nCorrect answer: ${body.correctAnswer}\nUser's answer: ${body.userAnswer}\nQuestion type: ${body.questionType}`;
    maxTokens = 300;
    tool = {
      name: "evaluate",
      description: "Evaluate the user's answer",
      input_schema: {
        type: "object",
        properties: {
          is_correct: { type: "boolean" },
          feedback: { type: "string" },
        },
        required: ["is_correct", "feedback"],
      },
    };

  } else if (type === "teach_back") {
    systemPrompt = `You are a sharp thinking coach. The user is trying to teach back a concept they learned.
Read their explanation carefully. Find the single biggest gap: missing logic, vague claim, no example, weak structure.
Give ONE specific observation under 50 words. Then ask ONE follow-up question.
Never repeat what they said. Never start with praise. Write like a smart friend.`;
    userMessage = `Concept: ${body.keyIdea}\nTheir explanation: ${body.explanation}`;
    maxTokens = 200;

  } else if (type === "apply_scenario") {
    systemPrompt = `You are creating a realistic professional scenario for the user to apply what they learned.
Generate ONE realistic situation (under 40 words) where they'd need to use this knowledge.
Frame as a direct challenge: "A client asks..." or "Your manager wants..." or "In a meeting, someone says..."
Match context to the topic. Just the scenario, nothing else.`;
    userMessage = `Topic: ${body.lessonTitle}\nKey idea: ${body.keyIdea}`;
    maxTokens = 100;

  } else if (type === "evaluate_application") {
    systemPrompt = `You are evaluating how well the user applied a concept in a real-life scenario.
Score their response and give specific feedback.
Return using the provided tool.`;
    userMessage = `Scenario: ${body.scenario}\nKey idea: ${body.keyIdea}\nTheir response: ${body.response}`;
    maxTokens = 400;
    tool = {
      name: "evaluate_application",
      description: "Evaluate real-life application",
      input_schema: {
        type: "object",
        properties: {
          score: { type: "integer", description: "Score 1-10" },
          feedback: { type: "string", description: "Specific feedback under 60 words" },
          improved_response: { type: "string", description: "A stronger version of their response, under 40 words" },
        },
        required: ["score", "feedback", "improved_response"],
      },
    };

  } else if (type === "dialogue") {
    systemPrompt = `You are a knowledgeable tutor having a conversation about a specific topic.
Context — Lesson: "${body.lessonTitle}"
Key idea: "${body.keyIdea}"
Full content: "${body.lessonContent}"

Rules:
- Answer questions clearly and concisely (under 80 words)
- Challenge the user's thinking with follow-up questions
- Connect ideas to real-world applications
- If they ask something outside the lesson scope, gently redirect
- Be conversational, not lecturing`;
    userMessage = "";
    maxTokens = 300;

    // Dialogue uses full conversation history
    const msgs = (body.messages as Array<{ role: string; content: string }>) || [];
    return { type: "dialogue", systemPrompt, messages: msgs, maxTokens };

  } else if (type === "generate_flashcards") {
    systemPrompt = `You are creating flashcards from lesson content. For each lesson provided, create 2 flashcards.
Each flashcard should have:
- A "front" with a question or prompt (concise, under 15 words)
- A "back" with the answer (concise, under 30 words)
Focus on key concepts and understanding, not trivial details.
Return using the provided tool. Maximum 10 flashcards total.`;
    const lessonsText = (body.lessons as any[]).map((l: any) => `Title: ${l.title}\nKey idea: ${l.key_idea}\nContent: ${l.content}`).join("\n\n---\n\n");
    userMessage = lessonsText;
    maxTokens = 1500;
    tool = {
      name: "create_flashcards",
      description: "Create flashcards from lesson content",
      input_schema: {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                front: { type: "string", description: "Question or prompt shown on front of card" },
                back: { type: "string", description: "Answer shown on back of card" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["flashcards"],
      },
    };

  } else {
    return null; // invalid type
  }

  return { type: "standard", systemPrompt, userMessage, maxTokens, tool };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();

    const config = buildRequest(body);
    if (!config) {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build OpenAI-compatible request for Lovable AI Gateway (Gemini)
    const requestBody: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      max_tokens: config.maxTokens,
      reasoning: { effort: "medium" },
    };

    if (config.type === "dialogue") {
      const dialogueConfig = config as { type: string; systemPrompt: string; messages: Array<{ role: string; content: string }>; maxTokens: number };
      requestBody.messages = [
        { role: "system", content: dialogueConfig.systemPrompt },
        ...(dialogueConfig.messages.length > 0 ? dialogueConfig.messages : [{ role: "user", content: "Tell me about this topic." }]),
      ];
    } else {
      const stdConfig = config as { type: string; systemPrompt: string; userMessage: string; maxTokens: number; tool: ToolDef | null };
      requestBody.messages = [
        { role: "system", content: stdConfig.systemPrompt },
        { role: "user", content: stdConfig.userMessage },
      ];

      if (stdConfig.tool) {
        requestBody.tools = [{
          type: "function",
          function: {
            name: stdConfig.tool.name,
            description: stdConfig.tool.description,
            parameters: stdConfig.tool.input_schema,
          },
        }];
        requestBody.tool_choice = { type: "function", function: { name: stdConfig.tool.name } };
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly.", limited: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits in Settings → Workspace → Usage.", limited: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();

    // Extract tool call results
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Extract text content
    const content = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("ai-tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
