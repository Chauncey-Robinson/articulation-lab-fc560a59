import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard", label: "Overview" },
  { path: "/input", label: "Input" },
  { path: "/drill", label: "Drill" },
  { path: "/graph", label: "Graph" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight text-foreground">
            Cognitive Drill
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-1.5 text-xs font-medium tracking-wide transition-colors"
                  style={{ color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 -bottom-[9px] h-px bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
