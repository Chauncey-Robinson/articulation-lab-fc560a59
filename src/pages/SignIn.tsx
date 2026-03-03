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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px] text-center">
        <h1 className="font-serif text-xl text-foreground mb-8">Cognitive Drill</h1>

        <h2 className="font-serif text-[1.8rem] leading-tight text-foreground mb-3 whitespace-pre-line">
          {"You know more than\nyou can explain."}
        </h2>
        <p className="text-sm text-muted-foreground mb-10">
          Practice explaining ideas until they stick.
        </p>

        {!emailMode ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogle}
              className="w-full rounded-full py-4 text-sm font-medium border border-border bg-card text-foreground hover:bg-accent transition-colors"
            >
              Continue with Google
            </button>
            <button
              onClick={handleApple}
              className="w-full rounded-full py-4 text-sm font-medium text-white"
              style={{ background: "#1a1917" }}
            >
              Continue with Apple
            </button>
            <button
              onClick={() => setEmailMode(true)}
              className="w-full rounded-full py-4 text-sm font-medium border border-border bg-card text-foreground hover:bg-accent transition-colors"
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
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {error && (
              <p className="text-xs" style={{ color: "#c00" }}>{error}</p>
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

        <p className="text-[10px] text-muted-foreground/60 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
