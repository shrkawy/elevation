"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFloodAlerts, fetchLatestReadings } from "./flood-monitoring.api";

const REFRESH_INTERVAL_MS = 60_000;

export const floodMonitoringQueryKeys = {
  floods: ["flood-monitoring", "floods"] as const,
  readings: ["flood-monitoring", "readings", "latest"] as const,
};

export function useFloodAlertsQuery() {
  return useQuery({
    queryKey: floodMonitoringQueryKeys.floods,
    queryFn: fetchFloodAlerts,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: (previousData) => previousData,
  });
}

export function useLatestReadingsQuery() {
  return useQuery({
    queryKey: floodMonitoringQueryKeys.readings,
    queryFn: fetchLatestReadings,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: (previousData) => previousData,
  });
}
