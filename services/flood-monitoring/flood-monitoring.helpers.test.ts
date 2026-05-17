import { describe, expect, it } from "vitest";
import {
  filterAlerts,
  getDashboardMetrics,
  getReadingChartBuckets,
  normalizeFloodAlerts,
  normalizeStationReadings,
  parseDashboardSearchParams,
  parseSearchIntentFallback,
  sanitizeDashboardSearchParams,
  sortAlerts,
  sortReadings,
} from "./flood-monitoring.helpers";

describe("flood monitoring helpers", () => {
  it("normalizes flood alerts into app models", () => {
    const alerts = normalizeFloodAlerts([
      {
        "@id": "https://example.test/flood/1",
        description: "Tidal Thames",
        eaAreaName: "London",
        floodAreaID: "063WAT",
        severity: "Flood warning",
        severityLevel: 2,
        timeRaised: "2026-05-17T10:00:00",
        floodArea: {
          county: "Greater London",
          riverOrSea: "River Thames",
        },
      },
    ]);

    expect(alerts[0]).toMatchObject({
      id: "063WAT",
      area: "Tidal Thames",
      region: "London",
      county: "Greater London",
      riverOrSea: "River Thames",
      severity: "warning",
    });
  });

  it("normalizes station readings and ignores non-numeric values", () => {
    const readings = normalizeStationReadings([
      {
        "@id": "https://example.test/reading/1",
        dateTime: "2026-05-17T11:00:00Z",
        value: "1.42",
        measure: {
          "@id": "https://example.test/measures/THM-level-stage-i-15_min-mAOD",
          label: "Thames at Test Lock",
          stationReference: "THM",
          unitName: "mAOD",
        },
      },
      {
        value: "NaN",
        measure: "https://example.test/measures/ABC-level-stage-i-15_min-mAOD",
      },
    ]);

    expect(readings[0]).toMatchObject({
      station: "Thames at Test Lock",
      stationReference: "THM",
      value: 1.42,
      unit: "mAOD",
    });
    expect(readings[1].value).toBeNull();
  });

  it("aggregates dashboard metrics", () => {
    const alerts = normalizeFloodAlerts([
      { severity: "Severe flood warning", severityLevel: 1 },
      { severity: "Flood alert", severityLevel: 3 },
    ]);
    const readings = normalizeStationReadings([{ value: 1 }, { value: 3 }]);

    expect(getDashboardMetrics(alerts, readings)).toMatchObject({
      activeWarnings: 2,
      criticalAlerts: 1,
      latestReadings: 2,
      averageRiverLevel: 2,
    });
  });

  it("filters and sorts alerts", () => {
    const alerts = normalizeFloodAlerts([
      {
        description: "Yorkshire coast",
        eaAreaName: "Yorkshire",
        severity: "Flood alert",
        severityLevel: 3,
        timeRaised: "2026-05-17T08:00:00",
        floodArea: {
          county: "North Yorkshire",
        },
      },
      {
        description: "River Thames",
        eaAreaName: "London",
        severity: "Severe flood warning",
        severityLevel: 1,
        timeRaised: "2026-05-17T09:00:00",
        floodArea: {
          county: "Greater London",
        },
      },
    ]);

    expect(filterAlerts(alerts, { region: "Yorkshire" })).toHaveLength(1);
    expect(filterAlerts(alerts, { eaAreaName: "Yorkshire" })).toHaveLength(1);
    expect(filterAlerts(alerts, { county: "North Yorkshire" })).toHaveLength(1);
    expect(sortAlerts(alerts, "severity")[0].severity).toBe("severe");
  });

  it("sorts readings by highest value and builds chart buckets", () => {
    const readings = normalizeStationReadings([
      { value: 0.2 },
      { value: 1.2 },
      { value: 4.4 },
    ]);

    expect(sortReadings(readings, "highest")[0].value).toBe(4.4);
    expect(getReadingChartBuckets(readings).map((bucket) => bucket.count)).toEqual([
      1, 0, 1, 0, 1,
    ]);
  });

  it("validates supported search params", () => {
    expect(
      sanitizeDashboardSearchParams({
        q: "Thames",
        severity: "severe",
        type: "stations",
        sort: "highest",
      })
    ).toEqual({
      q: "Thames",
      severity: "severe",
      type: "stations",
      sort: "highest",
    });

    expect(sanitizeDashboardSearchParams({ severity: "extreme" })).toEqual({});
  });

  it("parses flood warning endpoint params into dashboard filters", () => {
    const params = new URLSearchParams({
      "min-severity": "1",
      eaAreaName: "Yorkshire",
    });

    expect(parseDashboardSearchParams(params)).toEqual({
      eaAreaName: "Yorkshire",
      severity: "severe",
      type: "alerts",
    });
  });

  it("preserves flood warning county params in dashboard filters", () => {
    const params = new URLSearchParams({
      "min-severity": "2",
      county: "Kent",
    });

    expect(parseDashboardSearchParams(params)).toEqual({
      county: "Kent",
      severity: "warning",
      type: "alerts",
    });
  });

  it("parses station endpoint params into dashboard filters", () => {
    const params = new URLSearchParams({
      type: "stations",
      riverName: "Thames",
      parameter: "level",
      _sorted: "",
    });

    expect(parseDashboardSearchParams(params)).toEqual({
      q: "Thames",
      sort: "highest",
      type: "stations",
    });
  });

  it("parses fallback natural-language intent", () => {
    expect(parseSearchIntentFallback("show severe alerts in yorkshire")).toEqual({
      severity: "severe",
      type: "alerts",
      sort: "severity",
      region: "Yorkshire",
    });

    expect(parseSearchIntentFallback("highest station readings near thames")).toEqual({
      type: "stations",
      sort: "highest",
      region: "Thames",
    });
  });
});
