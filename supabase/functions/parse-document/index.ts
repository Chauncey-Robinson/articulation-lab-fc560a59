import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
      text = extractTextFromPdfRaw(bytes);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      text = extractTextFromDocx(bytes);
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

/**
 * Extract readable text from a PDF by scanning the raw binary for text streams.
 * This handles uncompressed text streams and common encodings without needing
 * a full PDF parser library.
 */
function extractTextFromPdfRaw(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const textChunks: string[] = [];

  // Extract text between BT (Begin Text) and ET (End Text) operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Match text show operators: Tj, TJ, ', "
    // Tj = show string, TJ = show array of strings
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textChunks.push(decodeEscaped(tjMatch[1]));
    }

    // TJ arrays: [(text) 123 (more text)]
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(inner)) !== null) {
        textChunks.push(decodeEscaped(strMatch[1]));
      }
    }

    // ' operator (move to next line and show text)
    const quoteRegex = /\(([^)]*)\)\s*'/g;
    let qMatch;
    while ((qMatch = quoteRegex.exec(block)) !== null) {
      textChunks.push(decodeEscaped(qMatch[1]));
    }
  }

  // Also try to extract from uncompressed stream content
  const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
  while ((match = streamRegex.exec(raw)) !== null) {
    const streamContent = match[1];
    // Only process if it looks like it contains text operators
    if (streamContent.includes("Tj") || streamContent.includes("TJ")) {
      const btEt2 = /BT\s([\s\S]*?)ET/g;
      let m2;
      while ((m2 = btEt2.exec(streamContent)) !== null) {
        const block = m2[1];
        const tjRegex = /\(([^)]*)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          const decoded = decodeEscaped(tjMatch[1]);
          if (!textChunks.includes(decoded)) {
            textChunks.push(decoded);
          }
        }
      }
    }
  }

  let result = textChunks.join(" ").replace(/\s+/g, " ").trim();

  // If raw extraction didn't yield much, try a broader approach
  if (result.length < 50) {
    // Try extracting any readable strings from the PDF
    const readable = raw
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    // Filter out PDF structural keywords
    const pdfKeywords = /\b(obj|endobj|stream|endstream|xref|trailer|startxref|%%EOF)\b/g;
    const filtered = readable.replace(pdfKeywords, " ").replace(/\s+/g, " ").trim();
    
    if (filtered.length > result.length) {
      result = filtered;
    }
  }

  if (result.length < 50) {
    return "Could not extract text from this PDF. The file may use compressed streams or scanned images. Try pasting the text directly.";
  }

  return result;
}

function decodeEscaped(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

function extractTextFromDocx(bytes: Uint8Array): string {
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
