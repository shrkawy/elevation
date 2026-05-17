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

export type EaFloodsResponse = {
  items?: EaFloodItem[];
};

export type EaFloodItem = {
  "@id"?: string;
  description?: string;
  eaAreaName?: string;
  eaRegionName?: string;
  floodAreaID?: string;
  isTidal?: boolean;
  message?: string;
  severity?: string;
  severityLevel?: number;
  timeMessageChanged?: string;
  timeRaised?: string;
  timeSeverityChanged?: string;
  floodArea?: {
    "@id"?: string;
    county?: string;
    notation?: string;
    polygon?: string;
    riverOrSea?: string;
  };
};

export type EaReadingsResponse = {
  items?: EaReadingItem[];
};

export type EaReadingItem = {
  "@id"?: string;
  dateTime?: string;
  value?: number | string | null;
  measure?:
    | string
    | {
        "@id"?: string;
        label?: string;
        notation?: string;
        parameter?: string;
        parameterName?: string;
        period?: number;
        qualifier?: string;
        station?: string;
        stationReference?: string;
        unit?: string;
        unitName?: string;
      };
};

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
