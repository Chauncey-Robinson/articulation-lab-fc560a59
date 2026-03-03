import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
      <h1 className="font-serif text-[2.8rem] leading-tight text-foreground mb-4">
        Ready to sharpen<br />your thinking?
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        One idea. Two attempts. Sharper articulation.
      </p>
      <Link
        to="/onboarding"
        className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Start 7-Minute Drill
      </Link>
      <Link
        to="/progress"
        className="mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        View Progress
      </Link>
    </div>
  );
}
