import { ApiError, fetchJson } from "@/services/api";
import type { ZodType } from "zod";
import {
  getRegions,
  normalizeFloodAlerts,
  normalizeStationReadings,
} from "./flood-monitoring.helpers";
import {
  eaFloodsResponseSchema,
  eaReadingsResponseSchema,
  type FloodsDataset,
  type ReadingsDataset,
} from "./flood-monitoring.types";

const API_ROOT = "https://environment.data.gov.uk/flood-monitoring";

export async function fetchFloodAlerts(): Promise<FloodsDataset> {
  const response = parseEaResponse(
    eaFloodsResponseSchema,
    await fetchJson<unknown>(`${API_ROOT}/id/floods`),
    "flood alerts"
  );
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
  const response = parseEaResponse(
    eaReadingsResponseSchema,
    await fetchJson<unknown>(`${API_ROOT}/data/readings?latest`),
    "latest readings"
  );
  const readings = normalizeStationReadings(response.items);

  return {
    readings,
    updatedAt:
      readings
        .map((reading) => reading.dateTime)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
  };
}

function parseEaResponse<T>(
  schema: ZodType<T>,
  value: unknown,
  label: string
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(`Invalid ${label} response from Environment Agency`);
  }

  return result.data;
}
