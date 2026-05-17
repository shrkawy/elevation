import { formatDate } from "@/lib/utils";
import type { StationReading } from "@/services/flood-monitoring/flood-monitoring.types";
import { Gauge } from "lucide-react";
import { EmptyState, PanelError, StatusBadge } from "../dashboard-states";

export function StationsTable({
  readings,
  error,
  onSelect,
  onRetry,
}: {
  readings: StationReading[];
  error: Error | null;
  onSelect: (item: StationReading) => void;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <PanelError
        title="Station readings unavailable"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (!readings.length) {
    return (
      <EmptyState
        title="No matching stations"
        message="Adjust the station search or switch back to alerts."
      />
    );
  }

  return (
    <div className="max-h-[25.625rem] overflow-auto">
      {readings.map((reading) => (
        <button
          key={reading.id}
          type="button"
          className="grid w-full gap-2 border-b border-border px-4 py-2 text-left transition hover:bg-secondary focus:bg-secondary focus:outline-none md:grid-cols-[1fr_auto]"
          onClick={() => onSelect(reading)}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Gauge className="size-4 text-primary" />
              <p className="truncate text-sm font-semibold">{reading.station}</p>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {reading.stationReference} / {reading.parameter}
            </p>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <StatusBadge tone="neutral">
              {reading.valueLabel}
              {reading.value === null ? "" : reading.unit}
            </StatusBadge>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {formatDate(reading.dateTime)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
