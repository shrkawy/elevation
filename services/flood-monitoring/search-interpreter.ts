import { z } from "zod";

// All documented EA flood-monitoring API params as named optional fields.
// Using z.object() instead of z.record() so generateObject/generateText produces
// a JSON Schema with explicit property names — models fill named fields reliably.
const eaParamsSchema = z.object({
  // flood-warnings (/id/floods)
  "min-severity": z.string().optional(),
  eaAreaName: z.string().optional(),
  county: z.string().optional(),

  // readings (/data/readings)
  latest: z.string().optional(),
  today: z.string().optional(),
  date: z.string().optional(),
  startdate: z.string().optional(),
  enddate: z.string().optional(),
  since: z.string().optional(),
  _view: z.string().optional(),
  _sorted: z.string().optional(),
  _limit: z.string().optional(),

  // shared — readings + stations
  parameter: z.string().optional(),
  parameterName: z.string().optional(),
  qualifier: z.string().optional(),
  stationReference: z.string().optional(),
  station: z.string().optional(),
  lat: z.string().optional(),
  long: z.string().optional(),
  dist: z.string().optional(),

  // stations (/id/stations)
  town: z.string().optional(),
  catchmentName: z.string().optional(),
  riverName: z.string().optional(),
  search: z.string().optional(),
  RLOIid: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  label: z.string().optional(),
});

export type EaParams = z.infer<typeof eaParamsSchema>;

export const naturalLanguageSearchSchema = z.object({
  params: eaParamsSchema,
  resource: z.enum(["readings", "stations", "flood-warnings"]),
  summary: z.string(),
});

export type SearchInterpretation = z.infer<typeof naturalLanguageSearchSchema>;

const FLOOD_WARNING_LOCATION_PATTERN =
  /\b(?:in|around|for|near)\s+([a-z\s'-]+?)(?:\s*$|\bwith\b|\band\b|,|\.)/i;

const UK_COUNTIES = new Set([
  "bedfordshire",
  "berkshire",
  "bristol",
  "buckinghamshire",
  "cambridgeshire",
  "cheshire",
  "cornwall",
  "cumbria",
  "derbyshire",
  "devon",
  "dorset",
  "durham",
  "east sussex",
  "east yorkshire",
  "essex",
  "gloucestershire",
  "greater london",
  "greater manchester",
  "hampshire",
  "herefordshire",
  "hertfordshire",
  "isle of wight",
  "kent",
  "lancashire",
  "leicestershire",
  "lincolnshire",
  "merseyside",
  "norfolk",
  "north yorkshire",
  "northamptonshire",
  "northumberland",
  "nottinghamshire",
  "oxfordshire",
  "rutland",
  "shropshire",
  "somerset",
  "south yorkshire",
  "staffordshire",
  "suffolk",
  "surrey",
  "tyne and wear",
  "warwickshire",
  "west midlands",
  "west sussex",
  "west yorkshire",
  "wiltshire",
  "worcestershire",
]);

export function interpretSearchLocally(input: string): SearchInterpretation {
  const normalized = input.toLowerCase();
  const params: EaParams = {};
  let resource: "readings" | "stations" | "flood-warnings" = "readings";

  // Detect resource type
  if (
    /\b(warning|alert|flood warning|flood alert|severe|flood)\b/.test(normalized)
  ) {
    resource = "flood-warnings";
  } else if (/\b(station|gauge|monitoring station)\b/.test(normalized)) {
    resource = "stations";
  }

  // Flood warning params
  if (resource === "flood-warnings") {
    if (/\b(severe|critical|danger)\b/.test(normalized)) {
      params["min-severity"] = "1";
    } else if (/\bwarning\b/.test(normalized)) {
      params["min-severity"] = "2";
    } else {
      params["min-severity"] = "3";
    }

    Object.assign(params, extractFloodWarningLocation(input));
  }

  // Readings params
  if (resource === "readings") {
    if (/\b(today)\b/.test(normalized)) {
      params.today = "";
    } else {
      params.latest = "";
    }

    if (/\b(level|water level|river level|height)\b/.test(normalized)) {
      params.parameter = "level";
      params.parameterName = "Water Level";
    } else if (/\b(flow|discharge)\b/.test(normalized)) {
      params.parameter = "flow";
    } else if (/\b(rainfall|rain)\b/.test(normalized)) {
      params.parameter = "rainfall";
    } else if (/\b(groundwater)\b/.test(normalized)) {
      params.parameter = "level";
      params.qualifier = "Groundwater";
    }
  }

  // Station params
  if (resource === "stations") {
    const searchTerms = input
      .replace(
        /\b(station|gauge|monitoring|show|find|list|near|in|all)\b/gi,
        ""
      )
      .trim();
    if (searchTerms) {
      params.search = searchTerms;
    }

    if (/\b(level|water level|river level)\b/.test(normalized)) {
      params.parameter = "level";
    } else if (/\b(flow|discharge)\b/.test(normalized)) {
      params.parameter = "flow";
    }
  }

  const filterCount = Object.values(params).filter((v) => v !== undefined).length;
  const resourceLabel = resource.replace("-", " ");
  const summary =
    filterCount > 0
      ? `Searching ${resourceLabel} with ${filterCount} filter${filterCount !== 1 ? "s" : ""}.`
      : `Showing all ${resourceLabel}.`;

  return { params, resource, summary };
}

function titleCaseWords(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function extractFloodWarningLocation(input: string): Pick<
  EaParams,
  "eaAreaName" | "county"
> {
  const locationMatch = input.match(FLOOD_WARNING_LOCATION_PATTERN);
  const location = locationMatch?.[1]?.trim().replace(/\s+/g, " ");

  if (!location) {
    return {};
  }

  const normalizedLocation = location.toLowerCase();
  const titleCasedLocation = titleCaseWords(normalizedLocation);

  if (UK_COUNTIES.has(normalizedLocation)) {
    return { county: titleCasedLocation };
  }

  return { eaAreaName: titleCasedLocation };
}
