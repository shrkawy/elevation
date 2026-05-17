"use client";

import {
  applySearchParams,
  filterAlerts,
  filterReadings,
  getDashboardMetrics,
  limitDashboardAlerts,
  limitDashboardReadings,
  parseDashboardSearchParams,
  sortAlerts,
  sortReadings,
} from "@/services/flood-monitoring/flood-monitoring.helpers";
import {
  useFloodAlertsQuery,
  useLatestReadingsQuery,
} from "@/services/flood-monitoring/flood-monitoring.queries";
import type {
  DashboardSearchParams,
  DetailItem,
  FloodAlert,
  StationReading,
} from "@/services/flood-monitoring/flood-monitoring.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardSearchCommand } from "./dashboard-search-command";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DetailModal } from "./detail-modal";
import { LiveDataPanel, type LiveTab } from "./live-data-panel";
import { ReadingsChartPanel } from "./readings-chart-panel";

const EMPTY_ALERTS: FloodAlert[] = [];
const EMPTY_READINGS: StationReading[] = [];

export function FloodDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const params = parseDashboardSearchParams(searchParams);

  const floodsQuery = useFloodAlertsQuery();
  const readingsQuery = useLatestReadingsQuery();
  const alerts = floodsQuery.data?.alerts ?? EMPTY_ALERTS;
  const readings = readingsQuery.data?.readings ?? EMPTY_READINGS;
  const displayedTab: LiveTab = params.type === "stations" ? "stations" : "alerts";

  const visibleAlerts = limitDashboardAlerts(
    sortAlerts(filterAlerts(alerts, params), params.sort)
  );
  const visibleReadings = limitDashboardReadings(
    sortReadings(filterReadings(readings, params), params.sort)
  );
  const metrics = getDashboardMetrics(alerts, readings);

  const isInitialLoading = floodsQuery.isLoading || readingsQuery.isLoading;
  const isRefreshing = floodsQuery.isFetching || readingsQuery.isFetching;
  const hasError = Boolean(floodsQuery.error || readingsQuery.error);

  function updateParams(next: DashboardSearchParams) {
    const updated = applySearchParams(new URLSearchParams(searchParams), next);
    const query = updated.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function handleRefresh() {
    void Promise.all([floodsQuery.refetch(), readingsQuery.refetch()]);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader
        updatedAt={metrics.updatedAt}
        isRefreshing={isRefreshing && !isInitialLoading}
        hasError={hasError}
        onRefresh={handleRefresh}
      />
      <div className="lg:flex">
        <DashboardSidebar
          activeParams={params}
          isRefreshing={isRefreshing && !isInitialLoading}
          onPreset={updateParams}
        />
        <main className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">
          <DashboardMetrics metrics={metrics} isLoading={isInitialLoading} />
          <DashboardSearchCommand onApply={updateParams} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
            <ReadingsChartPanel
              readings={readings}
              isLoading={readingsQuery.isLoading}
              error={readingsQuery.error}
              onRetry={() => void readingsQuery.refetch()}
            />
            <LiveDataPanel
              activeTab={displayedTab}
              alerts={visibleAlerts}
              readings={visibleReadings}
              isLoading={isInitialLoading}
              alertsError={floodsQuery.error}
              readingsError={readingsQuery.error}
              onTabChange={(tab) => updateParams({ type: tab })}
              onSelect={setDetail}
              onRetryAlerts={() => void floodsQuery.refetch()}
              onRetryReadings={() => void readingsQuery.refetch()}
            />
          </div>
        </main>
      </div>
      <DetailModal detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
