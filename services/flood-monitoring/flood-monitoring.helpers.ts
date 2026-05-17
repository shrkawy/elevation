import {
  type AlertSeverity,
  type DashboardMetrics,
  type DashboardSearchParams,
  type EaFloodItem,
  type EaReadingItem,
  type FloodAlert,
  type StationReading,
  dashboardSearchParamsSchema,
} from "./flood-monitoring.types";

export const MAX_VISIBLE_ALERTS = 250;
export const MAX_VISIBLE_READINGS = 600;
const EMPTY_VALUES = new Set(["", "unknown", "undefined", "null"]);
const SEVERITY_RANK: Record<AlertSeverity, number> = {
  severe: 4,
  warning: 3,
  alert: 2,
  removed: 1,
};

export function normalizeFloodAlerts(items: EaFloodItem[] = []): FloodAlert[] {
  return items.map((item, index) => {
    const sourceId = cleanString(item["@id"]) || `flood-alert-${index}`;
    const severity = normalizeSeverity(item.severity, item.severityLevel);

    return {
      id: item.floodAreaID || sourceId,
      sourceId,
      area: cleanString(item.description) || "Unspecified area",
      region:
        cleanString(item.eaAreaName) ||
        cleanString(item.eaRegionName) ||
        "Unassigned",
      county: cleanString(item.floodArea?.county) || "Not listed",
      riverOrSea: cleanString(item.floodArea?.riverOrSea) || "Not listed",
      message: cleanWhitespace(item.message) || "No message supplied.",
      severity,
      severityLabel: cleanString(item.severity) || labelForSeverity(severity),
      severityLevel: item.severityLevel ?? 0,
      isTidal: Boolean(item.isTidal),
      raisedAt: item.timeRaised ?? null,
      changedAt: item.timeMessageChanged ?? item.timeSeverityChanged ?? null,
      sourceUrl: safeSourceUrl(sourceId),
    };
  });
}

export function normalizeStationReadings(
  items: EaReadingItem[] = []
): StationReading[] {
  return items.map((item, index) => {
    const measure =
      typeof item.measure === "object" && item.measure ? item.measure : null;
    const measureId =
      typeof item.measure === "string"
        ? item.measure
        : cleanString(measure?.["@id"]) || "";
    const sourceId = cleanString(item["@id"]) || `station-reading-${index}`;
    const value = toFiniteNumber(item.value);
    const stationReference =
      cleanString(measure?.stationReference) || extractStationReference(measureId);
    const parameter =
      cleanString(measure?.parameterName) ||
      cleanString(measure?.parameter) ||
      inferMeasurePart(measureId, 1) ||
      "level";

    return {
      id: sourceId,
      sourceId,
      station:
        cleanString(measure?.label) ||
        cleanString(measure?.station) ||
        stationReference ||
        "Monitoring station",
      stationReference: stationReference || "Unlisted",
      riverOrSea: stationReference || "Station network",
      parameter,
      qualifier:
        cleanString(measure?.qualifier) || inferMeasurePart(measureId, 2) || "i",
      unit:
        cleanString(measure?.unitName) ||
        cleanString(measure?.unit) ||
        inferMeasureUnit(measureId) ||
        "m",
      value,
      valueLabel: value === null ? "No reading" : value.toFixed(2),
      dateTime: item.dateTime ?? null,
      sourceUrl: safeSourceUrl(sourceId),
    };
  });
}

const EA_ORIGIN = "https://environment.data.gov.uk";

function safeSourceUrl(url: string): string {
  return url.startsWith(EA_ORIGIN) ? url : "";
}

export function getRegions(alerts: FloodAlert[]): string[] {
  return Array.from(new Set(alerts.map((alert) => alert.region))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getDashboardMetrics(
  alerts: FloodAlert[],
  readings: StationReading[]
): DashboardMetrics {
  const numericReadings = readings.filter(
    (reading): reading is StationReading & { value: number } =>
      typeof reading.value === "number"
  );
  const latestTimes = [
    ...alerts.map((alert) => alert.changedAt ?? alert.raisedAt),
    ...readings.map((reading) => reading.dateTime),
  ].filter(Boolean) as string[];

  return {
    activeWarnings: alerts.length,
    criticalAlerts: alerts.filter(
      (alert) => alert.severity === "severe" || alert.severity === "warning"
    ).length,
    latestReadings: readings.length,
    averageRiverLevel: numericReadings.length
      ? roundTo(
          numericReadings.reduce((total, reading) => total + reading.value, 0) /
            numericReadings.length,
          2
        )
      : null,
    updatedAt: latestTimes.sort().at(-1) ?? null,
  };
}

export function getHighestRiverLevelReadings(
  readings: StationReading[],
  limit = 12
): StationReading[] {
  const highestByStation = new Map<string, StationReading & { value: number }>();

  for (const reading of readings) {
    if (typeof reading.value !== "number") {
      continue;
    }

    if (normalizeSearch(reading.parameter) !== "level") {
      continue;
    }

    const stationKey = normalizeSearch(reading.stationReference || reading.station);
    const current = highestByStation.get(stationKey);

    if (!current) {
      highestByStation.set(stationKey, reading as StationReading & { value: number });
      continue;
    }

    const currentTime = dateValue(current.dateTime);
    const nextTime = dateValue(reading.dateTime);

    if (reading.value > current.value) {
      highestByStation.set(stationKey, reading as StationReading & { value: number });
      continue;
    }

    if (reading.value === current.value && nextTime > currentTime) {
      highestByStation.set(stationKey, reading as StationReading & { value: number });
    }
  }

  return Array.from(highestByStation.values())
    .toSorted((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }

      const timestampDiff = dateValue(b.dateTime) - dateValue(a.dateTime);
      if (timestampDiff !== 0) {
        return timestampDiff;
      }

      return a.station.localeCompare(b.station);
    })
    .slice(0, limit);
}

export function filterAlerts(
  alerts: FloodAlert[],
  params: DashboardSearchParams
): FloodAlert[] {
  const query = normalizeSearch(params.q);
  const region = normalizeSearch(params.region);
  const eaAreaName = normalizeSearch(params.eaAreaName);
  const county = normalizeSearch(params.county);

  return alerts.filter((alert) => {
    if (params.severity && alert.severity !== params.severity) {
      return false;
    }

    if (region && normalizeSearch(alert.region) !== region) {
      return false;
    }

    if (eaAreaName && normalizeSearch(alert.region) !== eaAreaName) {
      return false;
    }

    if (county && normalizeSearch(alert.county) !== county) {
      return false;
    }

    if (!query) {
      return true;
    }

    return normalizeSearch(
      `${alert.area} ${alert.region} ${alert.county} ${alert.riverOrSea} ${alert.message}`
    ).includes(query);
  });
}

export function filterReadings(
  readings: StationReading[],
  params: DashboardSearchParams
): StationReading[] {
  const query = normalizeSearch(params.q);

  if (!query) {
    return readings;
  }

  return readings.filter((reading) =>
    normalizeSearch(
      `${reading.station} ${reading.stationReference} ${reading.riverOrSea} ${reading.parameter} ${reading.qualifier}`
    ).includes(query)
  );
}

export function sortAlerts(
  alerts: FloodAlert[],
  sort: DashboardSearchParams["sort"] = "latest"
): FloodAlert[] {
  return alerts.toSorted((a, b) => {
    if (sort === "severity") {
      return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    }

    return dateValue(b.changedAt ?? b.raisedAt) - dateValue(a.changedAt ?? a.raisedAt);
  });
}

export function sortReadings(
  readings: StationReading[],
  sort: DashboardSearchParams["sort"] = "latest"
): StationReading[] {
  return readings.toSorted((a, b) => {
    if (sort === "highest") {
      return (b.value ?? Number.NEGATIVE_INFINITY) - (a.value ?? Number.NEGATIVE_INFINITY);
    }

    return dateValue(b.dateTime) - dateValue(a.dateTime);
  });
}

export function limitDashboardAlerts(
  alerts: FloodAlert[],
  limit = MAX_VISIBLE_ALERTS
): FloodAlert[] {
  return alerts.slice(0, limit);
}

export function limitDashboardReadings(
  readings: StationReading[],
  limit = MAX_VISIBLE_READINGS
): StationReading[] {
  return readings.slice(0, limit);
}

export function parseDashboardSearchParams(
  params: URLSearchParams
): DashboardSearchParams {
  const direct = sanitizeDashboardSearchParams({
    q: params.get("q") ?? undefined,
    severity: params.get("severity") ?? undefined,
    region: params.get("region") ?? undefined,
    eaAreaName: params.get("eaAreaName") ?? undefined,
    county: params.get("county") ?? undefined,
    type: params.get("type") ?? undefined,
    sort: params.get("sort") ?? undefined,
  });
  const resource = inferEndpointResource(params);
  const endpointParams = Object.fromEntries(params.entries());

  return sanitizeDashboardSearchParams({
    ...mapEndpointParamsToDashboardParams(resource, endpointParams),
    ...direct,
  });
}

export function mapEndpointParamsToDashboardParams(
  resource: string | undefined,
  params: Record<string, string | undefined>
): DashboardSearchParams {
  const dash: Record<string, unknown> = {};

  if (resource === "flood-warnings") {
    dash.type = "alerts";

    const minSeverity = params["min-severity"];
    if (minSeverity === "1") dash.severity = "severe";
    else if (minSeverity === "2") dash.severity = "warning";
    else if (minSeverity === "3") dash.severity = "alert";

    if (params.eaAreaName) {
      dash.eaAreaName = params.eaAreaName;
    }

    if (params.county) {
      dash.county = params.county;
    }
  } else if (resource === "stations") {
    dash.type = "stations";

    const query =
      params.search ??
      params.town ??
      params.riverName ??
      params.catchmentName ??
      params.stationReference;
    if (query) dash.q = query;

    if (params.parameter === "level" && params._sorted !== undefined) {
      dash.sort = "highest";
    }
  } else if (resource === "readings") {
    const query = params.search ?? params.stationReference;
    if (query) dash.q = query;

    if (params.parameter === "level" && params._sorted !== undefined) {
      dash.sort = "highest";
    }
  }

  return sanitizeDashboardSearchParams(dash);
}

export function sanitizeDashboardSearchParams(
  value: unknown
): DashboardSearchParams {
  const result = dashboardSearchParamsSchema.safeParse(value);

  if (!result.success) {
    return {};
  }

  return stripEmptyParams(result.data);
}

export function applySearchParams(
  current: URLSearchParams,
  next: DashboardSearchParams
): URLSearchParams {
  const params = new URLSearchParams(current);
  const clean = stripEmptyParams(next);

  (["q", "severity", "region", "eaAreaName", "county", "type", "sort"] as const).forEach((key) => {
    const value = clean[key];

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });

  return params;
}

function stripEmptyParams(
  params: DashboardSearchParams
): DashboardSearchParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (typeof value !== "string") {
        return Boolean(value);
      }

      return !EMPTY_VALUES.has(value.trim().toLowerCase());
    })
  ) as DashboardSearchParams;
}

function inferEndpointResource(
  params: URLSearchParams
): "flood-warnings" | "stations" | "readings" | undefined {
  const type = params.get("type");

  if (type === "alerts") {
    return "flood-warnings";
  }

  if (type === "stations") {
    return "stations";
  }

  if (
    params.has("min-severity") ||
    params.has("eaAreaName") ||
    params.has("county")
  ) {
    return "flood-warnings";
  }

  if (
    params.has("town") ||
    params.has("catchmentName") ||
    params.has("riverName") ||
    params.has("search") ||
    params.has("RLOIid") ||
    params.has("status") ||
    params.has("label") ||
    params.has("type")
  ) {
    return "stations";
  }

  if (
    params.has("latest") ||
    params.has("today") ||
    params.has("date") ||
    params.has("startdate") ||
    params.has("enddate") ||
    params.has("since") ||
    params.has("stationReference") ||
    params.has("station") ||
    params.has("parameter") ||
    params.has("qualifier") ||
    params.has("_sorted")
  ) {
    return "readings";
  }

  return undefined;
}

function normalizeSeverity(label = "", level = 0): AlertSeverity {
  const normalized = label.toLowerCase();

  if (level === 1 || normalized.includes("severe")) {
    return "severe";
  }

  if (level === 2 || normalized.includes("warning")) {
    return "warning";
  }

  if (level >= 4 || normalized.includes("removed")) {
    return "removed";
  }

  return "alert";
}

function labelForSeverity(severity: AlertSeverity): string {
  return {
    severe: "Severe flood warning",
    warning: "Flood warning",
    alert: "Flood alert",
    removed: "Warning removed",
  }[severity];
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanWhitespace(value: unknown): string {
  return cleanString(value).replace(/\s+/g, " ");
}

function normalizeSearch(value: unknown): string {
  return cleanWhitespace(value).toLowerCase();
}

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function roundTo(value: number, places: number): number {
  const factor = 10 ** places;

  return Math.round(value * factor) / factor;
}

function dateValue(value: string | null): number {
  return value ? new Date(value).getTime() || 0 : 0;
}

function extractStationReference(measureId: string): string {
  const slug = measureId.split("/").at(-1) ?? "";

  return slug.split("-")[0] ?? "";
}

function inferMeasurePart(measureId: string, index: number): string {
  const slug = measureId.split("/").at(-1) ?? "";

  return slug.split("-")[index] ?? "";
}

function inferMeasureUnit(measureId: string): string {
  const slug = measureId.split("/").at(-1) ?? "";
  const parts = slug.split("-");

  return parts.at(-1) || "m";
}
