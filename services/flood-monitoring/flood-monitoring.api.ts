import { fetchJson } from "@/services/api";
import {
  getReadingChartBuckets,
  getRegions,
  normalizeFloodAlerts,
  normalizeStationReadings,
} from "./flood-monitoring.helpers";
import type {
  EaFloodsResponse,
  EaReadingsResponse,
  FloodsDataset,
  ReadingsDataset,
} from "./flood-monitoring.types";

const API_ROOT = "https://environment.data.gov.uk/flood-monitoring";

export async function fetchFloodAlerts(): Promise<FloodsDataset> {
  const response = await fetchJson<EaFloodsResponse>(`${API_ROOT}/id/floods`);
  const alerts = normalizeFloodAlerts(response.items);

  return {
    alerts,
    regions: getRegions(alerts),
    updatedAt:
      alerts
        .map((alert) => alert.changedAt ?? alert.raisedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
  };
}

export async function fetchLatestReadings(): Promise<ReadingsDataset> {
  const response = await fetchJson<EaReadingsResponse>(
    `${API_ROOT}/data/readings?latest`
  );
  const readings = normalizeStationReadings(response.items);

  return {
    readings,
    buckets: getReadingChartBuckets(readings),
    updatedAt:
      readings
        .map((reading) => reading.dateTime)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
  };
}
