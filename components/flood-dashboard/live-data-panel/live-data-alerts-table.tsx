import { formatDate } from "@/lib/utils";
import type { FloodAlert } from "@/services/flood-monitoring/flood-monitoring.types";
import { AlertTriangle } from "lucide-react";
import { EmptyState, PanelError, StatusBadge } from "../dashboard-states";

export function AlertsTable({
  alerts,
  error,
  onSelect,
  onRetry,
}: {
  alerts: FloodAlert[];
  error: Error | null;
  onSelect: (item: FloodAlert) => void;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <PanelError
        title="Flood alerts unavailable"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (!alerts.length) {
    return (
      <EmptyState
        title="No matching alerts"
        message="Adjust the search, severity, or region filters."
      />
    );
  }

  return (
    <div className="max-h-102.5 overflow-auto">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          className="grid w-full gap-2 border-b border-border px-4 py-2 text-left transition hover:bg-secondary focus:bg-secondary focus:outline-none md:grid-cols-[1fr_auto]"
          onClick={() => onSelect(alert)}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="size-4 text-primary" />
              <p className="truncate text-sm font-semibold">{alert.area}</p>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {alert.region} / {alert.riverOrSea}
            </p>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <StatusBadge tone={alert.severity === "severe" ? "rose" : "amber"}>
              {alert.severityLabel}
            </StatusBadge>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {formatDate(alert.changedAt ?? alert.raisedAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
