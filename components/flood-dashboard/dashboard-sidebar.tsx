import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardSearchParams } from "@/services/flood-monitoring/flood-monitoring.types";
import { AlertOctagon, Gauge, MapPinned } from "lucide-react";
import { RefreshingLabel } from "./dashboard-states";

const presets = [
  {
    id: "all",
    label: "All Regions",
    icon: MapPinned,
    params: { type: "all" } satisfies DashboardSearchParams,
  },
  {
    id: "severe",
    label: "Severe Alerts",
    icon: AlertOctagon,
    params: {
      type: "alerts",
      severity: "severe",
      sort: "severity",
    } satisfies DashboardSearchParams,
  },
  {
    id: "stations",
    label: "Monitoring Stations",
    icon: Gauge,
    params: {
      type: "stations",
      sort: "highest",
    } satisfies DashboardSearchParams,
  },
];

export function DashboardSidebar({
  activeParams,
  isRefreshing,
  onPreset,
}: {
  activeParams: DashboardSearchParams;
  isRefreshing: boolean;
  onPreset: (params: DashboardSearchParams) => void;
}) {
  return (
    <aside className="border-b border-border bg-sidebar p-3 text-sidebar-foreground lg:min-h-[calc(100vh-97px)] lg:w-64 lg:border-b-0 lg:border-r lg:p-4">
      <div className="mb-3 hidden lg:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          command presets
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fast filters for operational triage.
        </p>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:py-2">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const active = isPresetActive(activeParams, preset.params);

          return (
            <Button
              key={preset.id}
              type="button"
              variant={active ? "secondary" : "ghost"}
              className={cn(
                "h-10 justify-start gap-2 rounded-md px-3 cursor-pointer",
                active && "border border-primary/40 bg-primary/10 text-primary",
              )}
              onClick={() => onPreset(preset.params)}
            >
              <Icon className="size-4" />
              {preset.label}
            </Button>
          );
        })}
      </nav>
      <div className="mt-4 hidden lg:block">
        <RefreshingLabel active={isRefreshing} />
      </div>
    </aside>
  );
}

function isPresetActive(
  active: DashboardSearchParams,
  preset: DashboardSearchParams,
): boolean {
  if (preset.type === "stations") {
    return active.type === "stations";
  }

  if (preset.severity === "severe") {
    return active.severity === "severe";
  }

  return active.type !== "stations" && active.severity !== "severe";
}
