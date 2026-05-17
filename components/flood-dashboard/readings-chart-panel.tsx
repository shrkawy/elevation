import type { ReadingChartBucket } from "@/services/flood-monitoring/flood-monitoring.types";
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
  buckets,
  isLoading,
  error,
  onRetry,
}: {
  buckets: ReadingChartBucket[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <Panel className="min-h-90 overflow-hidden">
      <PanelHeader
        label="latest readings distribution"
        title="River level bands"
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
      ) : buckets.every((bucket) => bucket.count === 0) ? (
        <EmptyState
          title="No level readings available"
          message="The latest readings feed returned no numeric values to chart."
        />
      ) : (
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ left: -18, right: 8, top: 10 }}>
              <defs>
                <linearGradient id="levelFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--primary)", strokeOpacity: 0.4 }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Stations"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#levelFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Chart uses latest readings only, not historical trend data.
          </p>
        </div>
      )}
    </Panel>
  );
}
