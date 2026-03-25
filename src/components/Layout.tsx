import { Link, Outlet, useLocation } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { Flame } from "lucide-react";

const navTabs = [
  { path: "/home", label: "Home" },
  { path: "/input", label: "Practice" },
  { path: "/library", label: "Library" },
  { path: "/progress", label: "Progress" },
];

export default function Layout() {
  const location = useLocation();
  const { muted, toggleMute, progress } = useApp();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background px-6 pt-3 pb-2">
        <div className="mx-auto flex max-w-[460px] items-center justify-between">
          <div className="flex items-center gap-2">
            {progress.current_streak > 0 && (
              <span className="text-[13px] font-sans font-medium text-foreground flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-accent-bright" /> {progress.current_streak}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-[15px] leading-none text-ink-3 hover:text-foreground transition-colors duration-[180ms]"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={signOut}
              className="text-[12px] font-sans text-ink-3 hover:text-foreground transition-colors duration-[180ms]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col mx-auto w-full max-w-[460px] px-6 py-4">
        <Outlet />
      </main>

      <nav className="border-t border-border bg-background px-6 pb-safe">
        <div className="mx-auto flex max-w-[460px] items-center justify-around py-3">
          {navTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className="text-[12px] font-sans font-medium transition-colors duration-[180ms]"
              style={{
                color: isActive(tab.path) ? "hsl(var(--foreground))" : "hsl(var(--ink-3))",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
