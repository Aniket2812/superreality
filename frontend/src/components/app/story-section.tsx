import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

// A labeled section for the Overview narrative: a title, a one-line explainer, and an optional
// CockroachDB memory badge. Presentational only (no data fetching).
export function StorySection({
  title,
  subtitle,
  cockroach = false,
  children,
}: {
  title: string;
  subtitle?: string;
  cockroach?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {cockroach && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="size-3" /> Powered by CockroachDB vector memory
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
