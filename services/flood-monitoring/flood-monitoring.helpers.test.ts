import { describe, expect, it } from "vitest";
import {
  filterAlerts,
  getDashboardMetrics,
  getHighestRiverLevelReadings,
  limitDashboardAlerts,
  normalizeFloodAlerts,
  normalizeStationReadings,
  parseDashboardSearchParams,
  sanitizeDashboardSearchParams,
  sortAlerts,
  sortReadings,
} from "./flood-monitoring.helpers";
import {
  eaFloodsResponseSchema,
  eaReadingsResponseSchema,
} from "./flood-monitoring.types";

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

  it("normalizes full datasets and caps display results separately", () => {
    const alerts = normalizeFloodAlerts(
      Array.from({ length: 251 }, (_, index) => ({
        "@id": `https://environment.data.gov.uk/flood-monitoring/id/floods/${index}`,
        description: `Area ${index}`,
      }))
    );

    expect(alerts).toHaveLength(251);
    expect(limitDashboardAlerts(alerts)).toHaveLength(250);
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

  it("sorts readings by highest value", () => {
    const readings = normalizeStationReadings([
      { value: 0.2 },
      { value: 1.2 },
      { value: 4.4 },
    ]);

    expect(sortReadings(readings, "highest")[0].value).toBe(4.4);
  });

  it("builds highest river level chart data from level readings only", () => {
    const readings = normalizeStationReadings([
      {
        value: 2.7,
        dateTime: "2026-05-17T10:00:00Z",
        measure: {
          label: "Lower Thames",
          stationReference: "THM-1",
          parameter: "level",
        },
      },
      {
        value: 3.1,
        dateTime: "2026-05-17T11:00:00Z",
        measure: {
          label: "Lower Thames",
          stationReference: "THM-1",
          parameter: "level",
        },
      },
      {
        value: 9.9,
        dateTime: "2026-05-17T09:00:00Z",
        measure: {
          label: "Rain Gauge Alpha",
          stationReference: "RAIN-1",
          parameter: "rainfall",
        },
      },
      {
        value: 2.9,
        dateTime: "2026-05-17T08:00:00Z",
        measure: {
          label: "River Ouse",
          stationReference: "OUSE-1",
          parameter: "level",
        },
      },
    ]);

    expect(getHighestRiverLevelReadings(readings)).toMatchObject([
      {
        station: "Lower Thames",
        stationReference: "THM-1",
        value: 3.1,
      },
      {
        station: "River Ouse",
        stationReference: "OUSE-1",
        value: 2.9,
      },
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

  it("validates Environment Agency response envelopes", () => {
    expect(
      eaFloodsResponseSchema.safeParse({
        items: [
          {
            "@id":
              "https://environment.data.gov.uk/flood-monitoring/id/floods/1",
          },
        ],
      }).success
    ).toBe(true);

    expect(
      eaReadingsResponseSchema.safeParse({
        items: [{ value: "not-a-number", measure: { period: "15" } }],
      }).success
    ).toBe(false);
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
});
