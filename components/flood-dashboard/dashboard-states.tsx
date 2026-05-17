import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  label,
  action,
}: {
  title: string;
  label?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        {label ? (
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        ) : null}
        <h2 className="text-base font-semibold leading-6">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "rose" | "emerald";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider",
        tone === "neutral" && "border-border bg-secondary text-muted-foreground",
        tone === "amber" && "border-amber-500/40 bg-amber-500/10 text-amber-300",
        tone === "rose" && "border-destructive/40 bg-destructive/10 text-destructive",
        tone === "emerald" && "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      )}
    >
      {children}
    </span>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/70 ring-1 ring-border/60",
        className
      )}
    />
  );
}

export function PanelError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-40 flex-col items-start justify-center gap-3 px-4 py-6">
      <StatusBadge tone="rose">
        <AlertTriangle className="size-3" />
        degraded
      </StatusBadge>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-start justify-center px-4 py-6">
      <StatusBadge>empty</StatusBadge>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function RefreshingLabel({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      <Loader2 className="size-3 animate-spin" />
      refreshing
    </span>
  );
}
