import type { StationReading } from "@/services/flood-monitoring/flood-monitoring.types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EmptyState,
  Panel,
  PanelError,
  PanelHeader,
  SkeletonBlock,
} from "./dashboard-states";

export function ReadingsChartPanel({
  readings,
  isLoading,
  error,
  onRetry,
}: {
  readings: StationReading[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const chartReadings = readings
    .filter(
      (reading): reading is StationReading & { value: number } =>
        typeof reading.value === "number",
    )
    .slice(0, 12)
    .map((reading) => ({
      station: reading.station,
      shortStation:
        reading.station.length > 12
          ? `${reading.station.slice(0, 12).trimEnd()}…`
          : reading.station,
      level: reading.value,
      unit: reading.unit,
      timestamp: reading.dateTime,
    }));

  return (
    <Panel className="min-h-90 overflow-hidden">
      <PanelHeader
        label="latest readings snapshot"
        title="Highest river levels"
      />
      {isLoading ? (
        <div className="space-y-3 p-4">
          <SkeletonBlock className="h-64 w-full" />
          <SkeletonBlock className="h-4 w-52" />
        </div>
      ) : error ? (
        <PanelError
          title="Readings feed unavailable"
          message={error.message}
          onRetry={onRetry}
        />
      ) : chartReadings.length === 0 ? (
        <EmptyState
          title="No level readings available"
          message="The latest readings feed returned no numeric values to chart."
        />
      ) : (
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartReadings}
              margin={{ left: 4, right: 8, top: 10, bottom: 18 }}
            >
              <defs>
                <linearGradient id="levelFill" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="shortStation"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={52}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value.toFixed(1)}m`}
              />
              <Tooltip
                cursor={{ stroke: "var(--primary)", strokeOpacity: 0.4 }}
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value ?? 0);

                  return [`${numericValue.toFixed(2)} m`, "Level"];
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.station ?? "Station"
                }
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="level"
                name="Level"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#levelFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Top 12 stations by latest level reading. X shows station, Y shows
            metres.
          </p>
        </div>
      )}
    </Panel>
  );
}
