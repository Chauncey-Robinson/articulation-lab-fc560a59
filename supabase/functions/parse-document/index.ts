import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { getDocument } from "https://esm.sh/pdfjs-serverless@0.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".csv") || fileName.endsWith(".json") || fileName.endsWith(".xml") || fileName.endsWith(".rtf")) {
      text = await file.text();
    } else if (fileName.endsWith(".pdf")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = await extractTextFromPdf(bytes);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = await extractTextFromDocx(bytes);
    } else {
      return new Response(JSON.stringify({ error: `Unsupported file type: ${fileName}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text: text.trim(), fileName: file.name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Parse error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to parse document" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function extractTextFromPdf(data: Uint8Array): Promise<string> {
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str).join(" ");
    pages.push(strings);
  }

  return pages.join("\n\n");
}

async function extractTextFromDocx(bytes: Uint8Array): Promise<string> {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const textParts: string[] = [];
  const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;

  while ((m = wtRegex.exec(raw)) !== null) {
    textParts.push(m[1]);
  }

  if (textParts.length > 0) {
    let result = raw.replace(/<\/w:p>/g, "\n");
    const finalParts: string[] = [];
    const wtRegex2 = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    while ((m = wtRegex2.exec(result)) !== null) {
      finalParts.push(m[1]);
    }
    return finalParts.join("").replace(/\n+/g, "\n").trim();
  }

  const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const readableChars = stripped.replace(/[^\x20-\x7E]/g, "");
  if (readableChars.length > stripped.length * 0.3) {
    return stripped;
  }

  return "Could not extract text from this document. Try converting to PDF or pasting the text directly.";
}
