import type { DashboardMetrics } from "@/services/flood-monitoring/flood-monitoring.types";
import { AlertTriangle, Gauge, RadioTower, Waves } from "lucide-react";
import { Panel, SkeletonBlock } from "./dashboard-states";

const metricConfig = [
  {
    key: "activeWarnings",
    label: "Active warnings",
    icon: AlertTriangle,
    format: (value: DashboardMetrics) => value.activeWarnings.toLocaleString(),
  },
  {
    key: "criticalAlerts",
    label: "Critical levels",
    icon: RadioTower,
    format: (value: DashboardMetrics) => value.criticalAlerts.toLocaleString(),
  },
  {
    key: "latestReadings",
    label: "Latest readings",
    icon: Gauge,
    format: (value: DashboardMetrics) => value.latestReadings.toLocaleString(),
  },
  {
    key: "averageRiverLevel",
    label: "Avg river height",
    icon: Waves,
    format: (value: DashboardMetrics) =>
      value.averageRiverLevel === null ? "n/a" : `${value.averageRiverLevel}m`,
  },
];

export function DashboardMetrics({
  metrics,
  isLoading,
}: {
  metrics: DashboardMetrics;
  isLoading: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricConfig.map((metric) => {
        const Icon = metric.icon;

        return (
          <Panel key={metric.key} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <SkeletonBlock className="mt-3 h-7 w-20" />
            ) : (
              <p className="mt-3 text-2xl font-bold leading-none tracking-tight">
                {metric.format(metrics)}
              </p>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
