import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { Activity, RefreshCcw } from "lucide-react";
import { RefreshingLabel, StatusBadge } from "./dashboard-states";

export function DashboardHeader({
  updatedAt,
  isRefreshing,
  hasError,
  onRefresh,
}: {
  updatedAt: string | null;
  isRefreshing: boolean;
  hasError: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={hasError ? "rose" : "emerald"}>
            <span className="size-1.5 rounded-full bg-current" />
            {hasError ? "partial feed" : "live"}
          </StatusBadge>
          <RefreshingLabel active={isRefreshing} />
        </div>
        <h1 className="mt-2 text-xl font-semibold leading-7 sm:text-2xl">
          Flood Monitoring Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Environment Agency flood warnings and latest river readings.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-border bg-card px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            latest update
          </p>
          <p className="mt-1 text-sm font-medium">{formatDateTime(updatedAt)}</p>
        </div>
        <Button type="button" variant="outline" onClick={onRefresh}>
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
        <Activity className="hidden size-5 text-primary sm:block" aria-hidden />
      </div>
    </header>
  );
}
