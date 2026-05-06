// Background processor: downloads uploaded file from Storage, extracts text,
// generates lessons via Anthropic Claude, writes lessons, and marks the module ready.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic } from "../_shared/anthropic.ts";

const MAX_CHARS = 80_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;
    const userId = auth.user.id;

    const { module_id } = await req.json();
    if (!module_id || typeof module_id !== "string") {
      return json({ error: "module_id required" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: mod, error: modErr } = await admin
      .from("modules")
      .select("id, user_id, storage_path, source_type")
      .eq("id", module_id)
      .single();
    if (modErr || !mod) return json({ error: "Module not found" }, 404);
    if (mod.user_id !== userId) return json({ error: "Forbidden" }, 403);
    if (!mod.storage_path) return json({ error: "No file attached" }, 400);

    // Kick off background work; respond immediately
    EdgeRuntime.waitUntil(processModule(admin, mod, LOVABLE_API_KEY));
    return json({ ok: true, module_id });
  } catch (e) {
    console.error("process-upload error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

async function processModule(admin: any, mod: any, LOVABLE_API_KEY: string) {
  const moduleId = mod.id;
  try {
    await admin.from("modules").update({
      processing_state: "processing",
      processing_started_at: new Date().toISOString(),
      processing_error: null,
    }).eq("id", moduleId);

    // 1. Download the file
    const { data: file, error: dlErr } = await admin.storage.from("uploads").download(mod.storage_path);
    if (dlErr || !file) throw new Error("Could not download uploaded file");

    const bytes = new Uint8Array(await file.arrayBuffer());
    const name = (mod.storage_path as string).toLowerCase();

    // 2. Extract text
    let text = "";
    if (name.endsWith(".txt") || name.endsWith(".md")) {
      text = new TextDecoder().decode(bytes);
    } else if (name.endsWith(".pdf")) {
      text = extractPdfText(bytes);
    } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
      text = extractDocxText(bytes);
    } else {
      throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
    }

    text = text.trim();
    if (text.length < 50) {
      throw new Error("Could not extract enough text. The file may be scanned or encrypted.");
    }
    if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);

    // 3. Generate lessons via AI
    const lessons = await generateLessons(text, LOVABLE_API_KEY);

    // 4. Insert lessons + update module
    const lessonRows = lessons.lessons.map((l, i) => ({
      module_id: moduleId,
      user_id: mod.user_id,
      title: l.title,
      content: l.content,
      key_idea: l.key_idea,
      lesson_order: i,
      completed: false,
    }));
    if (lessonRows.length > 0) {
      const { error: lErr } = await admin.from("lessons").insert(lessonRows);
      if (lErr) throw new Error(lErr.message);
    }

    await admin.from("modules").update({
      title: lessons.title,
      source_content: text,
      lesson_count: lessonRows.length,
      processing_state: "ready",
      status: "learning",
    }).eq("id", moduleId);
  } catch (e) {
    console.error("Background processing failed for", moduleId, e);
    await admin.from("modules").update({
      processing_state: "failed",
      processing_error: e instanceof Error ? e.message : "Processing failed",
    }).eq("id", moduleId);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- AI ----
async function generateLessons(content: string, apiKey: string) {
  const tool = {
    type: "function",
    function: {
      name: "create_lessons",
      description: "Create structured lessons from the uploaded content",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Overall topic title, under 8 words" },
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
    },
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: 2500,
      reasoning: { effort: "medium" },
      messages: [
        { role: "system", content: `You are an expert educator. Read the uploaded material and identify the 3-5 most important concepts. For each, write a mini-lecture: clear title (<10 words), 80-150 word explanation, and a one-sentence key idea (<25 words). Order foundational to advanced.` },
        { role: "user", content },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: "create_lessons" } },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("AI returned no lessons");
  return JSON.parse(call.function.arguments) as { title: string; lessons: { title: string; content: string; key_idea: string }[] };
}

// ---- PDF text extraction (heuristic, handles uncompressed text streams) ----
function extractPdfText(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  const btEt = /BT\s([\s\S]*?)ET/g;
  let m: RegExpExecArray | null;
  while ((m = btEt.exec(raw)) !== null) {
    const block = m[1];
    const tj = /\(([^)]*)\)\s*Tj/g;
    let x;
    while ((x = tj.exec(block)) !== null) chunks.push(decodeEsc(x[1]));
    const tjArr = /\[([\s\S]*?)\]\s*TJ/g;
    let a;
    while ((a = tjArr.exec(block)) !== null) {
      const inner = a[1];
      const s = /\(([^)]*)\)/g;
      let sm;
      while ((sm = s.exec(inner)) !== null) chunks.push(decodeEsc(sm[1]));
    }
  }
  const result = chunks.join(" ").replace(/\s+/g, " ").trim();
  if (!looksLikeProse(result)) {
    throw new Error("This PDF appears to be scanned or uses compressed streams we can't read. Try exporting it as text or pasting the content directly.");
  }
  return result;
}
function decodeEsc(s: string) {
  return s.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\\\\/g, "\\");
}
function looksLikeProse(s: string): boolean {
  if (s.length < 200) return false;
  const letters = (s.match(/[a-zA-Z]/g) || []).length;
  if (letters / s.length < 0.6) return false;
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length < 30 || letters / tokens.length < 2.5) return false;
  if (/<<\/|\/Linearized|\/Filter|\/FlateDecode|endobj|xref/i.test(s.slice(0, 2000))) return false;
  return true;
}

function extractDocxText(bytes: Uint8Array): string {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const parts: string[] = [];
  const re = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = re.exec(raw)) !== null) parts.push(m[1]);
  const result = parts.join(" ").replace(/\s+/g, " ").trim();
  if (result.length < 50) throw new Error("Could not extract text from this document.");
  return result;
}

// EdgeRuntime.waitUntil typing shim
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };
