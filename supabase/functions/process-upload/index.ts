// Background processor: downloads uploaded file from Storage, extracts text,
// generates lessons via Anthropic Claude, writes lessons, and marks the module ready.
//
// For long documents (>10,000 words or >20 estimated pages), the function pauses
// after extraction and surfaces a list of sections so the user can pick what to
// focus on. The client then re-invokes with `selected_section_indices` to build
// lessons from only those sections.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";
import { callAnthropic } from "../_shared/anthropic.ts";

const MAX_CHARS = 80_000;
const LONG_DOC_WORDS = 10_000;
const CHARS_PER_PAGE = 2_000; // rough heuristic
const LONG_DOC_PAGES = 20;
const TARGET_SECTIONS = 8;

interface SectionRange { title: string; start: number; end: number; preview: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;
    const userId = auth.user.id;

    const body = await req.json();
    const module_id = body?.module_id;
    const selected_section_indices: number[] | undefined = body?.selected_section_indices;
    if (!module_id || typeof module_id !== "string") {
      return json({ error: "module_id required" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: mod, error: modErr } = await admin
      .from("modules")
      .select("id, user_id, storage_path, source_type, source_content, sections, processing_state")
      .eq("id", module_id)
      .single();
    if (modErr || !mod) return json({ error: "Module not found" }, 404);
    if (mod.user_id !== userId) return json({ error: "Forbidden" }, 403);

    // Resume path: user has selected sections from a previously-paused doc
    if (Array.isArray(selected_section_indices) && mod.sections && mod.source_content) {
      EdgeRuntime.waitUntil(buildLessonsFromSelection(admin, mod, selected_section_indices));
      return json({ ok: true, resumed: true });
    }

    if (!mod.storage_path) return json({ error: "No file attached" }, 400);

    EdgeRuntime.waitUntil(processModule(admin, mod));
    return json({ ok: true, module_id });
  } catch (e) {
    console.error("process-upload error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

async function processModule(admin: any, mod: any) {
  const moduleId = mod.id;
  try {
    await admin.from("modules").update({
      processing_state: "processing",
      processing_started_at: new Date().toISOString(),
      processing_error: null,
    }).eq("id", moduleId);

    const { data: file, error: dlErr } = await admin.storage.from("uploads").download(mod.storage_path);
    if (dlErr || !file) throw new Error("Could not download uploaded file");

    const bytes = new Uint8Array(await file.arrayBuffer());
    const name = (mod.storage_path as string).toLowerCase();

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

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const estPages = Math.ceil(text.length / CHARS_PER_PAGE);
    const isLong = wordCount > LONG_DOC_WORDS || estPages > LONG_DOC_PAGES;

    if (isLong) {
      const sections = await extractSections(text);
      await admin.from("modules").update({
        source_content: text,
        sections,
        processing_state: "awaiting_selection",
      }).eq("id", moduleId);
      return;
    }

    const lessons = await generateLessons(text);
    await writeLessons(admin, mod, text, lessons);
  } catch (e) {
    console.error("Background processing failed for", moduleId, e);
    await admin.from("modules").update({
      processing_state: "failed",
      processing_error: e instanceof Error ? e.message : "Processing failed",
    }).eq("id", moduleId);
  }
}

async function buildLessonsFromSelection(admin: any, mod: any, indices: number[]) {
  const moduleId = mod.id;
  try {
    await admin.from("modules").update({
      processing_state: "processing",
      processing_started_at: new Date().toISOString(),
      processing_error: null,
      selected_section_indices: indices,
    }).eq("id", moduleId);

    const sections = mod.sections as SectionRange[];
    const fullText = mod.source_content as string;
    const picked = indices
      .map(i => sections[i])
      .filter(Boolean)
      .map(s => fullText.slice(s.start, s.end))
      .join("\n\n---\n\n");

    if (picked.trim().length < 50) throw new Error("Selected sections were empty.");

    const trimmed = picked.length > MAX_CHARS ? picked.slice(0, MAX_CHARS) : picked;
    const lessons = await generateLessons(trimmed);
    await writeLessons(admin, mod, trimmed, lessons);
  } catch (e) {
    console.error("Section build failed for", moduleId, e);
    await admin.from("modules").update({
      processing_state: "failed",
      processing_error: e instanceof Error ? e.message : "Processing failed",
    }).eq("id", moduleId);
  }
}

async function writeLessons(admin: any, mod: any, text: string, lessons: { title: string; lessons: { title: string; content: string; key_idea: string }[] }) {
  // Clear any pre-existing lessons for safety on re-build
  await admin.from("lessons").delete().eq("module_id", mod.id);
  const lessonRows = lessons.lessons.map((l, i) => ({
    module_id: mod.id,
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
    completed_lessons: 0,
    processing_state: "ready",
    status: "learning",
  }).eq("id", mod.id);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- Section extraction ----
// Splits the document into ~TARGET_SECTIONS chunks (preferring detected headings)
// and asks Anthropic to title each, plus generates a short preview.
async function extractSections(text: string): Promise<SectionRange[]> {
  const ranges = detectHeadingRanges(text) ?? equalSplitRanges(text, TARGET_SECTIONS);

  // Build a compact outline payload for the model: index + first 400 chars of each chunk
  const outline = ranges.map((r, i) => ({
    index: i,
    excerpt: text.slice(r.start, Math.min(r.end, r.start + 400)),
    candidate_title: r.title,
  }));

  const { tool_input } = await callAnthropic({
    system: `You are organising a long document into clear sections for a learner. For each section excerpt, write a short, descriptive title (4-8 words) and a one-sentence preview (under 18 words). Stay neutral and professional. Return one entry per section in the same order.`,
    messages: [{ role: "user", content: JSON.stringify({ sections: outline }) }],
    max_tokens: 2000,
    tool: {
      name: "label_sections",
      description: "Label each section with a clear title and short preview",
      input_schema: {
        type: "object",
        properties: {
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                title: { type: "string" },
                preview: { type: "string" },
              },
              required: ["index", "title", "preview"],
            },
          },
        },
        required: ["sections"],
      },
    },
  });

  const labelled = (tool_input as any)?.sections as { index: number; title: string; preview: string }[] | undefined;
  if (!labelled || labelled.length === 0) {
    return ranges.map((r, i) => ({ ...r, title: r.title || `Section ${i + 1}`, preview: text.slice(r.start, r.start + 120).trim() + "…" }));
  }
  return ranges.map((r, i) => {
    const m = labelled.find(l => l.index === i);
    return {
      start: r.start,
      end: r.end,
      title: m?.title || r.title || `Section ${i + 1}`,
      preview: m?.preview || (text.slice(r.start, r.start + 120).trim() + "…"),
    };
  });
}

function detectHeadingRanges(text: string): SectionRange[] | null {
  // Look for markdown #, "Chapter N", or ALL-CAPS short lines on their own line.
  const lines = text.split(/\r?\n/);
  const positions: { idx: number; title: string }[] = [];
  let cursor = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    const isMd = /^#{1,3}\s+\S/.test(trimmed);
    const isChapter = /^(chapter|part|section)\s+(\d+|[ivxlc]+)\b/i.test(trimmed);
    const isCaps = trimmed.length > 4 && trimmed.length < 80 && /^[A-Z0-9 ,.\-:]+$/.test(trimmed) && /[A-Z]/.test(trimmed) && trimmed.split(" ").length <= 10;
    if (isMd || isChapter || isCaps) {
      positions.push({ idx: cursor, title: trimmed.replace(/^#+\s*/, "").slice(0, 80) });
    }
    cursor += line.length + 1;
  }
  if (positions.length < 3 || positions.length > 30) return null;
  const ranges: SectionRange[] = [];
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx;
    const end = i + 1 < positions.length ? positions[i + 1].idx : text.length;
    if (end - start < 200) continue; // skip trivial chunks
    ranges.push({ start, end, title: positions[i].title, preview: "" });
  }
  if (ranges.length < 3) return null;
  // If too many, merge adjacent until we hit TARGET_SECTIONS-ish
  while (ranges.length > 12) {
    const merged: SectionRange[] = [];
    for (let i = 0; i < ranges.length; i += 2) {
      const a = ranges[i];
      const b = ranges[i + 1];
      if (!b) { merged.push(a); break; }
      merged.push({ start: a.start, end: b.end, title: a.title, preview: "" });
    }
    ranges.splice(0, ranges.length, ...merged);
  }
  return ranges;
}

function equalSplitRanges(text: string, n: number): SectionRange[] {
  const ranges: SectionRange[] = [];
  const size = Math.ceil(text.length / n);
  for (let i = 0; i < n; i++) {
    const start = i * size;
    const end = Math.min(text.length, start + size);
    if (start >= text.length) break;
    ranges.push({ start, end, title: `Section ${i + 1}`, preview: "" });
  }
  return ranges;
}

// ---- AI ----
async function generateLessons(content: string) {
  const { tool_input } = await callAnthropic({
    system: `You are an expert educator. Read the uploaded material and identify the 3-5 most important concepts. For each, write a mini-lecture: clear title (<10 words), 80-150 word explanation, and a one-sentence key idea (<25 words). Order foundational to advanced.`,
    messages: [{ role: "user", content }],
    max_tokens: 4000,
    tool: {
      name: "create_lessons",
      description: "Create structured lessons from the uploaded content",
      input_schema: {
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
  });
  if (!tool_input) throw new Error("AI returned no lessons");
  return tool_input as { title: string; lessons: { title: string; content: string; key_idea: string }[] };
}

// ---- PDF text extraction ----
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

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };
