import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateLessons } from "@/lib/tutor-ai";
import { toast } from "sonner";
import { useTutor } from "@/lib/TutorContext";

interface MeetingData {
  id: string;
  title: string;
  meeting_type: string;
  status: string;
  transcript: string;
  summary: string;
  action_items: string[];
  key_learnings: string[];
  duration_seconds: number;
  module_id: string | null;
  created_at: string;
}

export default function MeetingReview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshModules } = useTutor();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "actions" | "learn">("summary");

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error || !data) {
        toast.error("Meeting not found");
        navigate("/dashboard");
        return;
      }
      setMeeting(data as unknown as MeetingData);
      setLoading(false);
    })();
  }, [user, id, navigate]);

  const formatDuration = (s: number) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const generateStudyModule = async () => {
    if (!meeting || !user) return;
    setGenerating(true);
    try {
      const content = meeting.key_learnings?.length
        ? `Meeting: ${meeting.title}\n\nKey Learnings:\n${meeting.key_learnings.map((l, i) => `${i + 1}. ${l}`).join("\n")}\n\nFull Summary:\n${meeting.summary}`
        : meeting.transcript;

      // Generate lessons from the meeting content
      const result = await generateLessons(content);

      // Create module
      const { data: mod, error: modErr } = await supabase
        .from("modules")
        .insert({
          user_id: user.id,
          title: `📝 ${meeting.title}`,
          source_content: content,
          source_type: "meeting",
          status: "learning",
          lesson_count: result.lessons.length,
        })
        .select()
        .single();

      if (modErr) throw modErr;

      // Insert lessons
      const lessonsToInsert = result.lessons.map((l, i) => ({
        module_id: mod.id,
        user_id: user.id,
        title: l.title,
        content: l.content,
        key_idea: l.key_idea,
        lesson_order: i,
      }));

      await supabase.from("lessons").insert(lessonsToInsert);

      // Link module to meeting
      await supabase.from("meetings").update({ module_id: mod.id } as any).eq("id", meeting.id);

      await refreshModules();
      toast.success("Study module created!");
      navigate(`/module/${mod.id}`);
    } catch (e) {
      console.error("Generate module error:", e);
      toast.error("Failed to generate study module");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!meeting) return null;

  const tabs = [
    { key: "summary" as const, label: "Summary" },
    { key: "actions" as const, label: "Actions" },
    { key: "learn" as const, label: "Learn" },
    { key: "transcript" as const, label: "Transcript" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-24">
      <div className="max-w-[460px] mx-auto w-full">
        {/* Header */}
        <button onClick={() => navigate("/dashboard")} className="text-[13px] font-sans text-ink-3 hover:text-foreground transition-colors mb-4">
          ← Back
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-accent px-2.5 py-0.5 rounded-pill bg-accent/10">
            {meeting.meeting_type}
          </span>
        </div>

        <h1 className="font-serif text-[1.5rem] text-foreground mb-1">{meeting.title}</h1>
        <p className="text-[12px] font-sans text-ink-3 mb-4">
          {new Date(meeting.created_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          {" · "}
          {formatDuration(meeting.duration_seconds)}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-surface-2 rounded-[12px] p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 text-[12px] font-sans font-medium py-2 rounded-[10px] transition-all duration-[180ms] ${
                activeTab === t.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-ink-3 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "summary" && (
          <div className="animate-fade-up">
            {meeting.summary ? (
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5">
                <p className="text-[14px] font-sans text-foreground leading-relaxed whitespace-pre-line">{meeting.summary}</p>
              </div>
            ) : (
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 text-center">
                <p className="text-[13px] font-sans text-ink-3">Summary not yet generated.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "actions" && (
          <div className="animate-fade-up space-y-2">
            {meeting.action_items?.length > 0 ? (
              meeting.action_items.map((item, i) => (
                <div key={i} className="bg-card rounded-[14px] border-[1.5px] border-border p-4 flex gap-3">
                  <span className="text-accent text-[14px] mt-0.5">○</span>
                  <p className="text-[13px] font-sans text-foreground leading-relaxed">{item}</p>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 text-center">
                <p className="text-[13px] font-sans text-ink-3">No action items found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "learn" && (
          <div className="animate-fade-up space-y-3">
            {meeting.key_learnings?.length > 0 ? (
              <>
                {meeting.key_learnings.map((learning, i) => (
                  <div key={i} className="bg-card rounded-[14px] border-[1.5px] border-border p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-[13px] font-sans font-semibold text-accent mt-0.5">{i + 1}</span>
                      <p className="text-[13px] font-sans text-foreground leading-relaxed">{learning}</p>
                    </div>
                  </div>
                ))}

                {!meeting.module_id && (
                  <button
                    onClick={generateStudyModule}
                    disabled={generating}
                    className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all duration-[180ms] disabled:opacity-50 mt-4"
                  >
                    {generating ? "Generating study module..." : "📚 Turn into study module"}
                  </button>
                )}

                {meeting.module_id && (
                  <button
                    onClick={() => navigate(`/module/${meeting.module_id}`)}
                    className="w-full rounded-pill bg-accent py-4 text-[13px] font-sans font-semibold text-white hover:opacity-90 transition-all duration-[180ms] mt-4"
                  >
                    📖 View study module
                  </button>
                )}
              </>
            ) : (
              <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5 text-center">
                <p className="text-[13px] font-sans text-ink-3">No key learnings extracted.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="animate-fade-up">
            <div className="bg-card rounded-[16px] border-[1.5px] border-border p-5">
              {meeting.transcript ? (
                <p className="text-[13px] font-sans text-foreground leading-relaxed whitespace-pre-line">{meeting.transcript}</p>
              ) : (
                <p className="text-[13px] font-sans text-ink-3 text-center">No transcript available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
