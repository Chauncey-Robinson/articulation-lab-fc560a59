import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Lesson } from "@/lib/TutorContext";
import MicButton from "@/components/MicButton";
import { useTTS } from "@/hooks/useSpeech";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Dialogue() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak, stop } = useTTS();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      if (data) {
        const l = data as unknown as Lesson;
        setLesson(l);
        const greeting = `Let's discuss "${l.title}". Ask me anything about this topic — I'll explain, challenge your thinking, or help you connect ideas.`;
        setMessages([{ role: "assistant", content: greeting }]);
        speak(greeting);
      }
      setLoading(false);
    })();
  }, [lessonId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !lesson || sending) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          type: "dialogue",
          lessonTitle: lesson.title,
          lessonContent: lesson.content,
          keyIdea: lesson.key_idea,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const aiContent = data.content;
      setMessages(prev => [...prev, { role: "assistant", content: aiContent }]);
      speak(aiContent);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again." }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!lesson) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-[14px] font-sans text-ink-3">Lesson not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-border flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors">←</button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-accent">DIALOGUE</p>
          <p className="text-[13px] font-sans text-foreground truncate">{lesson.title}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-[16px] px-4 py-3 text-[14px] font-sans leading-[1.6] ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border-[1.5px] border-border text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-card border-[1.5px] border-border rounded-[16px] px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-ink-3 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-ink-3 animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-ink-3 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question..."
              rows={1}
              className="w-full rounded-[14px] border-[1.5px] border-border bg-surface-2 px-4 py-3 text-[14px] font-sans text-foreground placeholder:text-ink-3 focus:outline-none focus:border-accent-bright transition-colors resize-none"
            />
          </div>
          <MicButton onTranscript={(t) => setInput(prev => prev + " " + t)} />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="rounded-full bg-primary w-10 h-10 flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
