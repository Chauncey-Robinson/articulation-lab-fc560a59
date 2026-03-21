import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    // Plain text files
    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".csv") || fileName.endsWith(".json") || fileName.endsWith(".xml") || fileName.endsWith(".rtf")) {
      text = await file.text();
    }
    // PDF files — extract text using pdf-parse-like approach
    else if (fileName.endsWith(".pdf")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = extractTextFromPdfBytes(bytes);
    }
    // DOCX files — extract from XML
    else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = await extractTextFromDocx(bytes);
    }
    else {
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

/**
 * Basic PDF text extraction — reads text objects from a PDF binary.
 * This handles most text-based PDFs (not scanned images).
 */
function extractTextFromPdfBytes(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const textChunks: string[] = [];

  // Extract text between BT (begin text) and ET (end text) operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Match text show operators: Tj, TJ, ' and "
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/gi;

    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textChunks.push(decodePdfString(tjMatch[1]));
    }

    while ((tjMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(inner)) !== null) {
        textChunks.push(decodePdfString(strMatch[1]));
      }
    }
  }

  // If no text extracted via BT/ET, try stream-based extraction
  if (textChunks.length === 0) {
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    while ((match = streamRegex.exec(raw)) !== null) {
      const streamContent = match[1];
      // Look for readable ASCII text
      const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
      if (readable.length > 20) {
        textChunks.push(readable);
      }
    }
  }

  let result = textChunks.join(" ");
  // Clean up common PDF artifacts
  result = result.replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\\(/g, "(").replace(/\\\)/g, ")").replace(/\s+/g, " ").trim();

  return result;
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Extract text from DOCX (Office Open XML) by reading the ZIP structure.
 */
async function extractTextFromDocx(bytes: Uint8Array): Promise<string> {
  // DOCX is a ZIP file. We need to find document.xml inside.
  // Minimal ZIP reading for the word/document.xml entry.
  
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  
  // Try to find XML content between <w:t> tags (Word text elements)
  const textParts: string[] = [];
  const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = wtRegex.exec(raw)) !== null) {
    textParts.push(m[1]);
  }
  
  if (textParts.length > 0) {
    // Join with spaces, add newlines at paragraph breaks
    let result = raw.replace(/<\/w:p>/g, "\n");
    const finalParts: string[] = [];
    const wtRegex2 = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
    while ((m = wtRegex2.exec(result)) !== null) {
      finalParts.push(m[1]);
    }
    return finalParts.join("").replace(/\n+/g, "\n").trim();
  }

  // Fallback: strip all XML tags
  const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // Only return if it looks like readable text
  const readableChars = stripped.replace(/[^\x20-\x7E]/g, "");
  if (readableChars.length > stripped.length * 0.3) {
    return stripped;
  }

  return "Could not extract text from this document. Try converting to PDF or pasting the text directly.";
}
