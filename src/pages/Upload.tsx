import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/lib/TutorContext";
import { supabase } from "@/integrations/supabase/client";
import { generateLessons } from "@/lib/tutor-ai";
import MicButton from "@/components/MicButton";
import { FileText, Link as LinkIcon, Mic, Type } from "lucide-react";

const inputMethods = [
  { key: "text", icon: Type, label: "Paste text" },
  { key: "file", icon: FileText, label: "Upload file", desc: "PDF or document" },
  { key: "url", icon: LinkIcon, label: "Paste a link" },
  { key: "record", icon: Mic, label: "Record audio", desc: "Something you heard at a talk or meeting" },
];

const ACCEPTED_TYPES = ".pdf,.docx,.doc,.txt,.md";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = method === "text" ? content.trim().length >= 50
    : method === "url" ? url.trim().length > 10
    : method === "record" ? content.trim().length >= 50
    : method === "file" ? !!selectedFile
    : false;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is 50 MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      e.target.value = "";
      return;
    }
    const name = file.name.toLowerCase();
    const ok = [".pdf", ".docx", ".doc", ".txt", ".md"].some(ext => name.endsWith(ext));
    if (!ok) {
      setError("Unsupported file type. Use PDF, DOCX, or TXT.");
      e.target.value = "";
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  // Upload file directly to Supabase Storage with progress, then create the
  // module in `pending` state and trigger the background processor.
  const handleFileFlow = async () => {
    if (!user || !selectedFile) return;
    setUploading(true);
    setUploadPct(0);
    setStatus("Uploading…");

    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;

      // Use signed-upload URL so we can stream with XHR and report progress
      const { data: signed, error: signErr } = await supabase
        .storage.from("uploads").createSignedUploadUrl(path);
      if (signErr || !signed) throw new Error(signErr?.message || "Could not start upload");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signed.signedUrl);
        xhr.setRequestHeader("Content-Type", selectedFile.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) setUploadPct(Math.round((evt.loaded / evt.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(selectedFile);
      });

      setStatus("Saving…");
      const { data: moduleData, error: modErr } = await supabase.from("modules").insert({
        user_id: user.id,
        title: selectedFile.name.replace(/\.[^.]+$/, ""),
        source_content: "",
        source_type: `file:${selectedFile.name}`,
        status: "learning",
        lesson_count: 0,
        completed_lessons: 0,
        processing_state: "pending",
        storage_path: path,
      } as any).select().single();
      if (modErr) throw modErr;
      const moduleId = (moduleData as any).id;

      // Fire background job (don't await long work, just the trigger)
      supabase.functions.invoke("process-upload", { body: { module_id: moduleId } })
        .catch(err => console.error("Failed to trigger processing:", err));

      await refreshModules();
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!user || !isValid) return;
    if (method === "file") return handleFileFlow();
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
        source_type: method,
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
    <div className="min-h-screen bg-background flex flex-col px-8 pt-6 pb-14">
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate(-1)} className="text-[18px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
      </div>

      <div className="max-w-[560px] mx-auto w-full flex-1 flex flex-col">
        <h1 className="font-serif text-[2.5rem] leading-[1.1] text-foreground mb-3 tracking-tight animate-fade-up stagger-1">What are you learning?</h1>
        <p className="text-[15px] font-sans text-ink-3 mb-10 leading-[1.6] animate-fade-up stagger-2">
          Paste it, link it, or drop in a file.
        </p>

        {/* Input method selector — borderless tinted tiles */}
        <div className="grid grid-cols-2 gap-3 mb-10 animate-fade-up stagger-3">
          {inputMethods.map(m => (
            <button key={m.key}
              onClick={() => setMethod(m.key)}
              className={`rounded-[28px] p-6 text-left transition-all duration-[180ms] ${
                method === m.key ? "bg-primary text-primary-foreground" :
                "bg-surface-1 text-foreground hover:bg-surface-2"
              }`}>
              <m.icon className={`w-5 h-5 mb-3 ${method === m.key ? "text-primary-foreground" : "text-ink-3"}`} />
              <p className={`text-[14px] font-sans font-medium ${method === m.key ? "text-primary-foreground" : "text-foreground"}`}>{m.label}</p>
              {m.desc && <p className={`text-[12px] font-sans mt-1 leading-[1.5] ${method === m.key ? "text-primary-foreground/70" : "text-ink-3"}`}>{m.desc}</p>}
            </button>
          ))}
        </div>

        {/* Text input — invisible, edge-to-edge "blank paper" feel */}
        {method === "text" && (
          <div className="animate-fade-up stagger-4 mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing. Even one paragraph is enough."
              className="w-full min-h-[260px] bg-transparent border-0 outline-none focus:ring-0 px-0 py-4 font-serif text-[20px] leading-[1.6] text-foreground placeholder:text-ink-3 placeholder:italic placeholder:font-light resize-none caret-foreground"
              disabled={loading}
              autoFocus
            />
            {content.length > 0 && (
              <p className="text-[11px] font-sans text-ink-3 mt-2 tracking-wide">{content.length} characters</p>
            )}
          </div>
        )}

        {/* File upload — direct-to-storage with progress */}
        {method === "file" && (
          <div className="animate-fade-up stagger-4 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-[28px] bg-surface-1 hover:bg-surface-2 transition-all duration-[180ms] p-12 flex flex-col items-center gap-4"
              >
                <FileText className="w-10 h-10 text-ink-3" strokeWidth={1.25} />
                <p className="text-[15px] font-sans font-medium text-foreground">Choose a file</p>
                <p className="text-[12px] font-sans text-ink-3">PDF, DOCX, TXT · Max 50 MB</p>
              </button>
            ) : (
              <div className="rounded-[28px] bg-surface-1 p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-ink-3" />
                    <div>
                      <p className="text-[14px] font-sans font-medium text-foreground truncate max-w-[220px]">{selectedFile.name}</p>
                      <p className="text-[11px] font-sans text-ink-3 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-[12px] font-sans text-ink-3 hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {uploading && (
                  <div className="mt-5">
                    <div className="h-1.5 w-full bg-surface-2 rounded-pill overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all duration-200"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-sans text-ink-3 mt-2 tabular-nums">{status} {uploadPct}%</p>
                  </div>
                )}

                {!uploading && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[12px] font-sans text-foreground hover:opacity-70 transition-opacity mt-4"
                  >
                    Choose different file →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* URL input — invisible style */}
        {method === "url" && (
          <div className="animate-fade-up stagger-4 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-transparent border-0 outline-none focus:ring-0 px-0 py-4 font-serif text-[20px] leading-[1.6] text-foreground placeholder:text-ink-3 placeholder:italic placeholder:font-light caret-foreground"
              disabled={loading}
              autoFocus
            />
            <div className="h-px bg-surface-3 mt-1" />
          </div>
        )}

        {/* Record audio */}
        {method === "record" && (
          <div className="animate-fade-up stagger-4 mb-4">
            <div className="bg-surface-1 rounded-[28px] p-8 text-center">
              <p className="text-[14px] font-sans text-ink-3 mb-6 leading-[1.6]">Record a lecture, talk, or any audio content.</p>
              <MicButton onTranscript={(t) => setContent(prev => prev ? prev + " " + t : t)} />
              {content.length > 0 && (
                <div className="mt-6 text-left">
                  <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-3">Transcription</p>
                  <p className="text-[14px] font-serif text-ink-2 leading-[1.7] max-h-[140px] overflow-y-auto">{content}</p>
                  <p className="text-[11px] font-sans text-ink-3 text-right mt-2">{content.length} characters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-[20px] px-6 py-4 mb-4 text-[13px] font-sans bg-destructive/10 text-destructive animate-fade-up">
            {error}
          </div>
        )}

        {loading && status && (
          <div className="flex items-center gap-3 mb-4 animate-fade-up">
            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-sans text-ink-3">{status}</p>
          </div>
        )}

        <div className="mt-auto pt-8 animate-fade-up stagger-5">
          <button
            onClick={handleUpload}
            disabled={!isValid || loading || uploading}
            className="w-full rounded-pill bg-primary py-6 text-[15px] font-sans font-semibold text-primary-foreground hover:opacity-95 active:scale-[0.99] transition-all duration-[200ms] disabled:opacity-30 disabled:cursor-not-allowed tracking-wide">
            {uploading ? "Uploading…" : loading ? "Processing..." : method === "file" ? "Upload and process" : "Start coaching session"}
          </button>
          <p className="text-[12px] font-sans text-ink-3 text-center mt-4 leading-[1.6]">
            AI will split this into 3–5 sessions you can study and explain back.
          </p>
        </div>
      </div>
    </div>
  );
}
