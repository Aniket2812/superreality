import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="wondering home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-8 place-items-center rounded-[11px] bg-primary text-sm font-bold text-primary-foreground transition-transform duration-300 group-hover:-rotate-6">
        w
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.04em]">wondering</span>
      )}
    </Link>
  );
}
