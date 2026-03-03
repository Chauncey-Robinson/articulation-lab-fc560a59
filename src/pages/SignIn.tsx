import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export default function SignIn() {
  const navigate = useNavigate();
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setError("");
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const handleApple = async () => {
    setError("");
    await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
  };

  const handleEmail = async () => {
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      navigate("/onboarding");
    } catch (e: any) {
      setError(e.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "hsl(var(--surface-light))" }}>
      <div className="w-full max-w-[460px] text-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-accent mb-4">
          KNOW IT. SAY IT.
        </p>

        <h1 className="font-serif text-[2.2rem] leading-[1.2] text-foreground mb-3 whitespace-pre-line">
          {"You know more than\nyou can explain."}
        </h1>
        <p className="text-sm text-muted-foreground mb-[52px]">
          Practice explaining ideas until they stick.
        </p>

        {!emailMode ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogle}
              className="w-full rounded-full py-4 text-sm font-medium border border-border bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.706C4.672 4.58 6.656 2.997 9 3.58Z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <button
              onClick={handleApple}
              className="w-full rounded-full py-4 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor"><path d="M13.34 9.48c-.02-2.08 1.7-3.08 1.78-3.13-0.97-1.42-2.48-1.61-3.02-1.64-1.28-.13-2.51.76-3.16.76-.65 0-1.66-.74-2.73-.72A4.04 4.04 0 0 0 2.8 7.02c-1.45 2.51-.37 6.24 1.04 8.28.69 1 1.51 2.12 2.59 2.08 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.82-1.02 2.5-2.02.79-1.15 1.11-2.27 1.13-2.33-.02-.01-2.17-.83-2.19-3.31l.08-.22ZM11.3 3.54c.57-.7.96-1.66.85-2.63-.82.03-1.82.55-2.41 1.24-.52.61-.99 1.58-.86 2.51.92.07 1.85-.46 2.42-1.12Z"/></svg>
              Continue with Apple
            </button>
            <button
              onClick={() => setEmailMode(true)}
              className="w-full rounded-full py-4 text-sm font-medium border border-border bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
            >
              Continue with Email
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {error && (
              <p className="text-xs" style={{ color: "#C05050" }}>{error}</p>
            )}
            <button
              onClick={handleEmail}
              disabled={loading || !email || !password}
              className="w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
            <button
              onClick={() => setEmailMode(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
          </div>
        )}

        <p className="text-[10px] text-legal mt-5">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
