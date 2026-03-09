import { Link, Outlet, useLocation } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/hooks/useAuth";

const navTabs = [
  { path: "/home", label: "Home" },
  { path: "/input", label: "Practice" },
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
              <span className="text-[13px] text-foreground">🔥 {progress.current_streak}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-base leading-none text-muted-foreground hover:text-foreground"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground"
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
              className="text-xs transition-colors"
              style={{
                color: isActive(tab.path) ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                fontWeight: isActive(tab.path) ? 500 : 400,
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
