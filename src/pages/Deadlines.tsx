import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTutor } from "@/lib/TutorContext";

interface Deadline {
  moduleId: string;
  moduleTitle: string;
  date: string;
  reminder: boolean;
}

export default function Deadlines() {
  const navigate = useNavigate();
  const { modules } = useTutor();
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
    const saved = localStorage.getItem("tutor_deadlines");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [reminder, setReminder] = useState(true);

  const activeModules = modules.filter(m => m.status !== "completed");

  const handleAdd = () => {
    if (!selectedModule || !selectedDate) return;
    const mod = modules.find(m => m.id === selectedModule);
    if (!mod) return;
    const newDeadline: Deadline = { moduleId: mod.id, moduleTitle: mod.title, date: selectedDate, reminder };
    const updated = [...deadlines.filter(d => d.moduleId !== mod.id), newDeadline];
    setDeadlines(updated);
    localStorage.setItem("tutor_deadlines", JSON.stringify(updated));
    setSelectedModule("");
    setSelectedDate("");
  };

  const handleRemove = (moduleId: string) => {
    const updated = deadlines.filter(d => d.moduleId !== moduleId);
    setDeadlines(updated);
    localStorage.setItem("tutor_deadlines", JSON.stringify(updated));
  };

  const getDaysLeft = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-4 pb-10">
      <button onClick={() => navigate("/dashboard")} className="text-[15px] font-sans text-ink-3 hover:text-foreground transition-colors mb-6 self-start">←</button>

      <div className="max-w-[460px] mx-auto w-full">
        <h1 className="font-serif text-[2rem] text-foreground mb-2 animate-fade-up stagger-1">When do you need to know this?</h1>
        <p className="text-[14px] font-sans text-ink-3 mb-6 animate-fade-up stagger-2">Set a target date. We'll remind you.</p>

        {/* Active deadlines */}
        {deadlines.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-ink-3 mb-3 animate-fade-up stagger-3">ACTIVE DEADLINES</p>
            {deadlines.map(d => {
              const daysLeft = getDaysLeft(d.date);
              const isOverdue = daysLeft === "Overdue";
              return (
                <div key={d.moduleId} className={`bg-card rounded-[16px] border-[1.5px] p-4 mb-3 animate-fade-up ${isOverdue ? "border-destructive/30" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[14px] font-sans font-medium text-foreground">{d.moduleTitle}</h3>
                    <button onClick={() => handleRemove(d.moduleId)} className="text-[11px] font-sans text-ink-3 hover:text-destructive transition-colors">Remove</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-sans text-ink-3">{new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <span className={`text-[12px] font-sans font-medium ${isOverdue ? "text-destructive" : "text-accent"}`}>{daysLeft}</span>
                  </div>
                  {d.reminder && <p className="text-[11px] font-sans text-sage mt-2">🔔 Reminders on</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Add new */}
        {activeModules.length > 0 && (
          <div className="animate-fade-up stagger-4">
            <div className="bg-card rounded-[18px] border-[1.5px] border-border p-5">
              <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full rounded-[12px] border-[1.5px] border-border bg-surface-2 px-4 py-3 text-[14px] font-sans text-foreground mb-3 focus:outline-none focus:border-accent-bright">
                <option value="">Choose a topic</option>
                {activeModules.filter(m => !deadlines.some(d => d.moduleId === m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>

              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-[12px] border-[1.5px] border-border bg-surface-2 px-4 py-3 text-[14px] font-sans text-foreground mb-3 focus:outline-none focus:border-accent-bright" />

              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <div onClick={() => setReminder(!reminder)}
                  className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center text-[10px] transition-all ${
                    reminder ? "border-accent bg-accent text-accent-foreground" : "border-border"
                  }`}>
                  {reminder && "✓"}
                </div>
                <span className="text-[13px] font-sans text-foreground">Enable reminders</span>
              </label>

              <button onClick={handleAdd} disabled={!selectedModule || !selectedDate}
                className="w-full rounded-pill bg-primary py-3 text-[13px] font-sans font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40">
                Save
              </button>
            </div>
          </div>
        )}

        {activeModules.length === 0 && deadlines.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px] font-sans text-ink-3">Upload some material first to set deadlines.</p>
          </div>
        )}
      </div>
    </div>
  );
}
