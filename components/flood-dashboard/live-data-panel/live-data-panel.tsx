import type {
    DetailItem,
    FloodAlert,
    StationReading,
} from "@/services/flood-monitoring/flood-monitoring.types";
import { Panel, PanelHeader, SkeletonBlock } from "../dashboard-states";
import { AlertsTable } from "./live-data-alerts-table";
import { StationsTable } from "./live-data-stations-table";
import { TabButton } from "./live-data-tabs";

export type LiveTab = "alerts" | "stations";

export function LiveDataPanel({
  activeTab,
  alerts,
  readings,
  isLoading,
  alertsError,
  readingsError,
  onTabChange,
  onSelect,
  onRetryAlerts,
  onRetryReadings,
}: {
  activeTab: LiveTab;
  alerts: FloodAlert[];
  readings: StationReading[];
  isLoading: boolean;
  alertsError: Error | null;
  readingsError: Error | null;
  onTabChange: (tab: LiveTab) => void;
  onSelect: (item: DetailItem) => void;
  onRetryAlerts: () => void;
  onRetryReadings: () => void;
}) {
  const isAlerts = activeTab === "alerts";

  return (
    <Panel className="min-h-[22.5rem] overflow-hidden">
      <PanelHeader
        label="live table"
        title={isAlerts ? "Flood alerts" : "Monitoring stations"}
        action={
          <div className="flex rounded-md border border-border bg-background p-1">
            <TabButton active={isAlerts} onClick={() => onTabChange("alerts")}>
              Alerts
            </TabButton>
            <TabButton
              active={!isAlerts}
              onClick={() => onTabChange("stations")}
            >
              Stations
            </TabButton>
          </div>
        }
      />
      {isLoading ? (
        <div className="space-y-2 p-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isAlerts ? (
        <AlertsTable
          alerts={alerts}
          error={alertsError}
          onSelect={(item) => onSelect({ kind: "alert", item })}
          onRetry={onRetryAlerts}
        />
      ) : (
        <StationsTable
          readings={readings}
          error={readingsError}
          onSelect={(item) => onSelect({ kind: "station", item })}
          onRetry={onRetryReadings}
        />
      )}
    </Panel>
  );
}
