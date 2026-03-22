import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";
import { supabase } from "@/integrations/supabase/client";
import { generateLessons } from "@/lib/tutor-ai";
import MicButton from "@/components/MicButton";

const inputMethods = [
  { key: "text", emoji: "📝", label: "Paste text" },
  { key: "file", emoji: "📄", label: "Upload file", desc: "PDF or document" },
  { key: "url", emoji: "🔗", label: "Paste a link" },
  { key: "record", emoji: "🎙️", label: "Record audio", desc: "Something you heard at a talk or meeting" },
];

const ACCEPTED_TYPES = ".pdf,.docx,.doc,.txt,.md,.csv,.json,.xml,.rtf";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv") || name.endsWith(".json") || name.endsWith(".xml") || name.endsWith(".rtf")) {
    return await file.text();
  }

  const formData = new FormData();
  formData.append("file", file);

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-document`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to parse file: ${err}`);
  }

  const result = await res.json();
  return result.text || "";
}

export default function Upload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshModules } = useTutor();
  const [method, setMethod] = useState("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileProcessing, setFileProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = method === "text" ? content.trim().length >= 50
    : method === "url" ? url.trim().length > 10
    : method === "record" ? content.trim().length >= 50
    : method === "file" ? content.trim().length >= 50
    : false;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 20 MB.");
      return;
    }

    setError("");
    setFileName(file.name);
    setFileProcessing(true);
    setStatus("Reading file...");

    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 50) {
        setError("Could not extract enough text from this file. Try pasting the content directly.");
        setContent("");
      } else {
        setContent(text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process file.");
      setContent("");
    } finally {
      setFileProcessing(false);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!user || !isValid) return;
    setLoading(true);
    setError("");

    const materialContent = method === "url"
      ? `Please analyze and create sessions from the following URL content reference: ${url}\n\nNote: Treat this URL as a topic reference. Create educational sessions about the subject matter this URL likely covers based on the URL path and domain.`
      : content;

    try {
      setStatus("Finding key concepts...");
      const result = await generateLessons(materialContent);

      setStatus("Creating your topic...");
      const { data: moduleData, error: modErr } = await supabase.from("modules").insert({
        user_id: user.id,
        title: result.title,
        source_content: materialContent,
        source_type: method === "file" ? `file:${fileName}` : method,
        status: "learning",
        lesson_count: result.lessons.length,
        completed_lessons: 0,
      } as any).select().single();

      if (modErr) throw modErr;
      const moduleId = (moduleData as any).id;

      setStatus("Building your sessions...");
      const lessonInserts = result.lessons.map((lesson, idx) => ({
        module_id: moduleId,
        user_id: user.id,
        title: lesson.title,
        content: lesson.content,
        key_idea: lesson.key_idea,
        lesson_order: idx,
        completed: false,
      }));

      await supabase.from("lessons").insert(lessonInserts as any);
      await refreshModules();
      navigate(`/learn-config/${moduleId}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
      </div>

      <div className="max-w-[460px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">What are you learning?</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">
          Paste it, link it, or drop in a file.
        </p>

        {/* Input method selector */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up stagger-3">
          {inputMethods.map(m => (
            <button key={m.key}
              onClick={() => setMethod(m.key)}
              className={`rounded-[16px] border-[1.5px] p-4 text-left transition-all duration-[180ms] ${
                method === m.key ? "border-accent bg-accent-pale/20" :
                "border-border bg-card hover:border-accent"
              }`}>
              <p className="text-[18px] mb-1">{m.emoji}</p>
              <p className="text-[13px] font-sans font-semibold text-foreground">{m.label}</p>
              {m.desc && <p className="text-[11px] font-sans text-ink-3 mt-1 leading-[1.4]">{m.desc}</p>}
            </button>
          ))}
        </div>

        {/* Text input */}
        {method === "text" && (
          <div className="animate-fade-up stagger-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste anything here. Even one paragraph is enough to start."
              className="w-full min-h-[180px] rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] resize-y mb-1"
              disabled={loading}
            />
            {content.length > 0 && (
              <p className="text-[11px] font-sans text-ink-3 text-right mb-2">{content.length} characters</p>
            )}
          </div>
        )}

        {/* File upload */}
        {method === "file" && (
          <div className="animate-fade-up stagger-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />

            {!fileName ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || fileProcessing}
                className="w-full rounded-[16px] border-[2px] border-dashed border-border bg-card hover:border-accent hover:bg-accent-pale/10 transition-all duration-[180ms] p-8 flex flex-col items-center gap-3"
              >
                <span className="text-[32px]">📄</span>
                <p className="text-[14px] font-sans font-medium text-foreground">Tap to choose a file</p>
                <p className="text-[12px] font-sans text-ink-3">PDF, DOCX, TXT, Markdown · Max 20 MB</p>
              </button>
            ) : (
              <div className="rounded-[16px] border-[1.5px] border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">📄</span>
                    <div>
                      <p className="text-[13px] font-sans font-medium text-foreground truncate max-w-[200px]">{fileName}</p>
                      {fileProcessing ? (
                        <p className="text-[11px] font-sans text-accent">Extracting text...</p>
                      ) : content.length > 0 ? (
                        <p className="text-[11px] font-sans text-sage">{content.length.toLocaleString()} characters extracted</p>
                      ) : (
                        <p className="text-[11px] font-sans text-destructive">No text extracted</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setFileName(""); setContent(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-[12px] font-sans text-ink-3 hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {content.length > 0 && (
                  <div className="bg-surface-2 rounded-[12px] p-4 max-h-[120px] overflow-y-auto">
                    <p className="text-[12px] font-sans text-ink-2 leading-[1.6] whitespace-pre-wrap">{content.slice(0, 500)}{content.length > 500 ? "..." : ""}</p>
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] font-sans text-accent hover:text-foreground transition-colors mt-3"
                >
                  Choose different file
                </button>
              </div>
            )}

            {fileProcessing && (
              <div className="flex items-center gap-3 mt-3">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] font-sans text-ink-3">Reading file contents...</p>
              </div>
            )}
          </div>
        )}

        {/* URL input */}
        {method === "url" && (
          <div className="animate-fade-up stagger-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full rounded-[14px] border-[1.5px] border-border bg-surface-2 px-5 py-4 text-[15px] font-sans text-foreground placeholder:text-ink-3 placeholder:italic focus:outline-none focus:border-accent-bright transition-colors duration-[180ms] mb-3"
              disabled={loading}
            />
          </div>
        )}

        {/* Record audio */}
        {method === "record" && (
          <div className="animate-fade-up stagger-4">
            <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 mb-4 text-center">
              <p className="text-[14px] font-sans text-ink-3 mb-4">Record a lecture, talk, or any audio content.</p>
              <MicButton onTranscript={(t) => setContent(prev => prev ? prev + " " + t : t)} />
              {content.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-2">TRANSCRIPTION</p>
                  <p className="text-[13px] font-sans text-ink-2 leading-[1.6] max-h-[120px] overflow-y-auto">{content}</p>
                  <p className="text-[11px] font-sans text-ink-3 text-right mt-1">{content.length} characters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[12px] px-5 py-3 mb-4 text-[13px] font-sans bg-block-low border border-destructive/20 text-destructive animate-fade-up">
            {error}
          </div>
        )}

        {loading && status && (
          <div className="flex items-center gap-3 mb-4 animate-fade-up">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-sans text-ink-3">{status}</p>
          </div>
        )}

        <div className="mt-auto animate-fade-up stagger-5">
          <button
            onClick={handleUpload}
            disabled={!isValid || loading || fileProcessing}
            className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Processing..." : "Start coaching session"}
          </button>
          <p className="text-[12px] font-sans text-ink-3 text-center mt-3">
            AI will split this into 3–5 sessions you can study and explain back.
          </p>
        </div>
      </div>
    </div>
  );
}
