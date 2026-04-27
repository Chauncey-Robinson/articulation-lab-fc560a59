import { NavLink, useLocation } from "react-router-dom";
import { LibraryBig, Home, LineChart } from "lucide-react";

const tabs = [
  { to: "/library", label: "Library", Icon: LibraryBig },
  { to: "/dashboard", label: "Home", Icon: Home },
  { to: "/growth", label: "Growth", Icon: LineChart },
];

const HIDE_ON = [
  "/",
  "/signin",
  "/onboarding",
  "/upload",
  "/learn-config",
  "/study",
  "/quiz",
  "/teach-back",
  "/apply",
  "/dialogue",
  "/flashcards",
  "/test-config",
  "/meeting/record",
];

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  if (HIDE_ON.some((p) => path === p || path.startsWith(p + "/"))) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-6 pb-5 pt-2 pointer-events-none">
      <div className="mx-auto max-w-[420px] pointer-events-auto">
        <nav className="glass rounded-pill flex items-center justify-around px-3 py-2.5">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-5 py-1.5 rounded-pill transition-all duration-[180ms] ${
                  isActive ? "text-foreground" : "text-ink-3 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 1.75 : 1.4} />
                  <span className="text-[10px] font-sans tracking-wide" style={{ fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
