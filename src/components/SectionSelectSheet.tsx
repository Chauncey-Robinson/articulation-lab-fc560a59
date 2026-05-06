import { useEffect, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

interface Section { title: string; preview: string; start: number; end: number }

interface Props {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle: string;
  sections: Section[];
}

export default function SectionSelectSheet({ open, onClose, moduleId, moduleTitle, sections }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Default: all sections selected
  useEffect(() => {
    if (open) {
      setSelected(new Set(sections.map((_, i) => i)));
      setError("");
    }
  }, [open, sections]);

  const toggle = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const handleBuild = async () => {
    if (selected.size === 0) {
      setError("Pick at least one section.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const indices = Array.from(selected).sort((a, b) => a - b);
      const { error: invErr } = await supabase.functions.invoke("process-upload", {
        body: { module_id: moduleId, selected_section_indices: indices },
      });
      if (invErr) throw invErr;
      onClose();
    } catch (e: any) {
      setError(e?.message || "Could not start building.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="pt-2">
        <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3 mb-2">
          Document overview
        </p>
        <h2 className="font-serif text-[1.6rem] text-foreground tracking-tight mb-1">
          {moduleTitle}
        </h2>
        <p className="text-[13px] font-sans text-ink-3 mb-6 leading-[1.55]">
          This is a long document. Pick the sections you want to focus on first. You can always come back for the rest.
        </p>

        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-sans font-medium uppercase tracking-[0.18em] text-ink-3">
            Sections · {selected.size} of {sections.length}
          </p>
          <button
            onClick={() =>
              setSelected(prev =>
                prev.size === sections.length ? new Set() : new Set(sections.map((_, i) => i))
              )
            }
            className="text-[11px] font-sans text-ink-3 hover:text-foreground transition-colors"
          >
            {selected.size === sections.length ? "Clear all" : "Select all"}
          </button>
        </div>

        <div className="space-y-2 mb-6 max-h-[46vh] overflow-y-auto">
          {sections.map((s, i) => {
            const on = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full text-left rounded-[20px] p-4 flex items-start gap-3 transition-all ${
                  on ? "bg-surface-2" : "bg-surface-1 hover:bg-surface-2"
                }`}
              >
                <span
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    on ? "bg-foreground text-background" : "bg-surface-3 text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-sans font-medium text-foreground leading-[1.4]">
                    {s.title}
                  </p>
                  {s.preview && (
                    <p className="text-[11px] font-sans text-ink-3 mt-1 leading-[1.5] line-clamp-2">
                      {s.preview}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-[12px] font-sans text-destructive mb-3">{error}</p>
        )}

        <button
          onClick={handleBuild}
          disabled={submitting || selected.size === 0}
          className="w-full rounded-pill bg-primary py-4 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Starting…" : "Build my session"}
        </button>
      </div>
    </BottomSheet>
  );
}
