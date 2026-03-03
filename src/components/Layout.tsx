import { Link, Outlet, useLocation } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { path: "/input", label: "Home" },
  { path: "/drill", label: "Rehearsal" },
  { path: "/progress", label: "Progress" },
];

export default function Layout() {
  const location = useLocation();
  const { muted, toggleMute } = useApp();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[620px] items-center justify-between px-6">
          <Link to="/input" className="font-serif text-base text-foreground">
            Cognitive Drill
          </Link>
          <div className="flex items-center gap-5">
            <nav className="flex items-center gap-4">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  style={
                    isActive(item.path)
                      ? { color: "hsl(var(--foreground))", borderBottom: "1.5px solid hsl(40, 6%, 10%)", paddingBottom: 2 }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
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
      <main className="mx-auto max-w-[620px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
