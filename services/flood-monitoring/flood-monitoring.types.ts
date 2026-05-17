import { z } from "zod";

export type AlertSeverity = "severe" | "warning" | "alert" | "removed";
export type DashboardType = "all" | "alerts" | "stations";
export type DashboardSort = "latest" | "severity" | "highest";

export const dashboardSearchParamsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  severity: z.enum(["severe", "warning", "alert", "removed"]).optional(),
  region: z.string().trim().max(80).optional(),
  eaAreaName: z.string().trim().max(80).optional(),
  county: z.string().trim().max(80).optional(),
  type: z.enum(["all", "alerts", "stations"]).optional(),
  sort: z.enum(["latest", "severity", "highest"]).optional(),
});

export type DashboardSearchParams = z.infer<
  typeof dashboardSearchParamsSchema
>;

const optionalString = z.string().optional();

export const eaFloodItemSchema = z.object({
  "@id": optionalString,
  description: optionalString,
  eaAreaName: optionalString,
  eaRegionName: optionalString,
  floodAreaID: optionalString,
  isTidal: z.boolean().optional(),
  message: optionalString,
  severity: optionalString,
  severityLevel: z.number().optional(),
  timeMessageChanged: optionalString,
  timeRaised: optionalString,
  timeSeverityChanged: optionalString,
  floodArea: z
    .object({
      "@id": optionalString,
      county: optionalString,
      notation: optionalString,
      polygon: optionalString,
      riverOrSea: optionalString,
    })
    .optional(),
});

export const eaFloodsResponseSchema = z.object({
  items: z.array(eaFloodItemSchema).optional(),
});

export type EaFloodItem = z.infer<typeof eaFloodItemSchema>;
export type EaFloodsResponse = z.infer<typeof eaFloodsResponseSchema>;

export const eaReadingMeasureSchema = z.object({
  "@id": optionalString,
  label: optionalString,
  notation: optionalString,
  parameter: optionalString,
  parameterName: optionalString,
  period: z.number().optional(),
  qualifier: optionalString,
  station: optionalString,
  stationReference: optionalString,
  unit: optionalString,
  unitName: optionalString,
});

export const eaReadingItemSchema = z.object({
  "@id": optionalString,
  dateTime: optionalString,
  value: z.union([z.number(), z.string(), z.null()]).optional(),
  measure: z.union([z.string(), eaReadingMeasureSchema]).optional(),
});

export const eaReadingsResponseSchema = z.object({
  items: z.array(eaReadingItemSchema).optional(),
});

export type EaReadingItem = z.infer<typeof eaReadingItemSchema>;
export type EaReadingsResponse = z.infer<typeof eaReadingsResponseSchema>;

export type FloodAlert = {
  id: string;
  sourceId: string;
  area: string;
  region: string;
  county: string;
  riverOrSea: string;
  message: string;
  severity: AlertSeverity;
  severityLabel: string;
  severityLevel: number;
  isTidal: boolean;
  raisedAt: string | null;
  changedAt: string | null;
  sourceUrl: string;
};

export type StationReading = {
  id: string;
  sourceId: string;
  station: string;
  stationReference: string;
  riverOrSea: string;
  parameter: string;
  qualifier: string;
  unit: string;
  value: number | null;
  valueLabel: string;
  dateTime: string | null;
  sourceUrl: string;
};

export type DashboardMetrics = {
  activeWarnings: number;
  criticalAlerts: number;
  latestReadings: number;
  averageRiverLevel: number | null;
  updatedAt: string | null;
};

export type FloodsDataset = {
  alerts: FloodAlert[];
  regions: string[];
  updatedAt: string | null;
};

export type ReadingsDataset = {
  readings: StationReading[];
  updatedAt: string | null;
};

export type DetailItem =
  | { kind: "alert"; item: FloodAlert }
  | { kind: "station"; item: StationReading };
