import {
  extractFloodWarningLocation,
  interpretSearchLocally,
  naturalLanguageSearchSchema,
  type SearchInterpretation,
} from "@/services/flood-monitoring/search-interpreter";
import { buildSearchContext } from "@/services/flood-monitoring/search-knowledge";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export const runtime = "nodejs";

const SEARCH_INTENT_SYSTEM_PROMPT =
  "You are an intent parser for the Environment Agency Real Time flood-monitoring API. " +
  "Given the API reference and retrieved examples, output the correct resource and ALL relevant params for the user query. " +
  "CRITICAL: only use params listed for the chosen resource — do NOT mix params between resources. " +
  "flood-warnings accepts ONLY: min-severity, eaAreaName, county, lat, long, dist. NEVER use town for flood-warnings. " +
  "For flood-warnings: always set min-severity (1=Severe, 2=Warning, 3=Alert). Use eaAreaName for named EA areas or broader places like Yorkshire, East Anglia, or Thames, and county for explicit counties such as Kent or Somerset. " +
  "If a flood-warning query mentions a location, the params are incomplete unless eaAreaName or county is present. Never leave the location only in the summary. " +
  "The summary and params must agree. If the summary says a place like Yorkshire, the params must include eaAreaName='Yorkshire' or county='Yorkshire' as appropriate. " +
  "Before responding, check whether the query contains a flood-warning location phrase such as 'in Yorkshire', 'around Kent', or 'for East Anglia' and copy that place into eaAreaName or county. " +
  "For readings: set latest='' for current data, today='' for today, plus parameter and qualifier when relevant. " +
  "For stations: set riverName, town, catchmentName, search, type, or status as appropriate. " +
  "Flag params (latest, today, _sorted) use empty string as their value.";

/** Valid params per resource — prevents the model from using station params in flood-warnings etc. */
const ALLOWED_PARAMS: Record<string, Set<string>> = {
  "flood-warnings": new Set(["min-severity", "eaAreaName", "county", "lat", "long", "dist", "_limit"]),
  readings: new Set(["latest", "today", "date", "startdate", "enddate", "since", "parameter", "parameterName", "qualifier", "stationReference", "station", "lat", "long", "dist", "_view", "_sorted", "_limit"]),
  stations: new Set(["parameter", "parameterName", "qualifier", "town", "catchmentName", "riverName", "search", "RLOIid", "stationReference", "lat", "long", "dist", "type", "status", "label", "_view"]),
};

/** Strip undefined values and params that are not valid for the given resource. */
function compactParams(
  params: Record<string, string | undefined>,
  resource: string,
): Record<string, string> {
  const allowed = ALLOWED_PARAMS[resource] ?? new Set<string>();
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && allowed.has(entry[0]),
    ),
  );
}

export function ensureFloodWarningLocation(
  input: string,
  interpretation: SearchInterpretation,
): SearchInterpretation {
  if (interpretation.resource !== "flood-warnings") {
    return interpretation;
  }

  const actualLocation =
    interpretation.params.eaAreaName ?? interpretation.params.county;

  if (actualLocation) {
    return interpretation;
  }

  return {
    ...interpretation,
    params: {
      ...extractFloodWarningLocation(input),
      ...interpretation.params,
    },
  };
}

async function generateSearchInterpretation(
  input: string,
): Promise<SearchInterpretation> {
  const prompt = `${buildSearchContext(input)}\n\n=== User Query ===\n${input}`;

  const { object } = await generateObject({
    model: google("gemini-3.1-flash-lite-preview"),
    schema: naturalLanguageSearchSchema,
    system: SEARCH_INTENT_SYSTEM_PROMPT,
    prompt,
  });

  return object;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("q")?.trim() ?? "";

  if (!input) {
    return Response.json({
      input,
      params: {},
      resource: "readings",
      source: "local",
      summary: "Search cleared.",
    });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const fallback = interpretSearchLocally(input);

    return Response.json({
      input,
      source: "local",
      ...fallback,
      params: compactParams(fallback.params, fallback.resource),
    });
  }

  try {
    const object = ensureFloodWarningLocation(
      input,
      await generateSearchInterpretation(input),
    );

    return Response.json({
      input,
      params: compactParams(object.params, object.resource),
      resource: object.resource,
      source: "ai",
      summary: object.summary,
    });
  } catch {
    const fallback = interpretSearchLocally(input);

    return Response.json({
      input,
      source: "local",
      ...fallback,
      params: compactParams(fallback.params, fallback.resource),
    });
  }
}
