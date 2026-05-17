// Source: https://environment.data.gov.uk/flood-monitoring/doc/reference
// App endpoints: GET /id/floods · GET /data/readings?latest · GET /id/stations

type ResourceDef = {
  description: string;
  endpoint: string;
  params: Record<string, string>;
};

type SearchExample = {
  query: string;
  resource: "readings" | "stations" | "flood-warnings";
  params: Record<string, string>;
  summary: string;
};

// ---------------------------------------------------------------------------
// Official EA Real Time flood-monitoring API — parameter reference
// Severity levels: 1 Severe Flood Warning, 2 Flood Warning, 3 Flood Alert, 4 No Longer in Force
// ---------------------------------------------------------------------------

const RESOURCES: Record<string, ResourceDef> = {
  "flood-warnings": {
    description:
      "Current flood warnings and alerts from the Environment Agency, updated every 15 min. " +
      "Severity: 1=Severe Flood Warning (Danger to Life), 2=Flood Warning (Action Required), " +
      "3=Flood Alert (Be Prepared), 4=Warning no Longer in Force (do not use as min-severity).",
    endpoint: "/id/floods",
    params: {
      "min-severity":
        "Integer 1–3. Returns warnings AT LEAST as severe as this level. " +
        "1=Severe only · 2=Warning and above · 3=Alert and above (all active). Never use 4.",
      eaAreaName:
        "Environment Agency area name, e.g. 'Yorkshire' or 'Thames'. " +
        "Use this for named flood warning areas and broader regions shown in the EA data.",
      county:
        "County name or comma-separated list, e.g. 'Yorkshire' or 'Kent,Surrey'. " +
        "Case-insensitive substring match against the flood area county field.",
      lat: "Latitude WGS84. Must pair with long and dist.",
      long: "Longitude WGS84. Must pair with lat and dist.",
      dist: "Radius in km from lat/long to filter flood areas geographically.",
    },
  },

  readings: {
    description:
      "Real-time water level, flow, rainfall, groundwater, wind and temperature readings " +
      "from EA monitoring stations. Data updated every 15 minutes. " +
      "Endpoint /data/readings returns all stations; " +
      "/id/stations/{id}/readings for a single station (supports 'since').",
    endpoint: "/data/readings",
    params: {
      // Time filters — pick at most one
      latest:
        "Flag param (empty string value). Returns the single most recent reading per measure. " +
        "Most cache-friendly — preferred for current state queries.",
      today:
        "Flag param (empty string value). Returns all readings taken since midnight today.",
      date:
        "ISO date YYYY-MM-DD. All readings for that specific calendar day. Example: '2025-01-15'.",
      startdate:
        "ISO date YYYY-MM-DD. Start of inclusive date range. Must pair with enddate.",
      enddate:
        "ISO date YYYY-MM-DD. End of inclusive date range. Must pair with startdate.",
      since:
        "ISO datetime e.g. '2025-01-15T10:30:00Z'. Readings strictly after this moment. " +
        "Only valid when also filtering by stationReference or station URI.",

      // Measurement filters
      parameter:
        "Short measurement code (lowercase). Valid values: " +
        "'level' (water level) · 'flow' (river flow rate) · 'rainfall' · " +
        "'groundwater' · 'wind' · 'temperature'.",
      parameterName:
        "Full human-readable name. Valid values: " +
        "'Water Level' · 'Flow' · 'Rainfall' · 'Groundwater' · 'Wind' · 'Temperature'.",
      qualifier:
        "Measurement qualifier. Common values: " +
        "'Stage' (upstream/main gauge) · 'Downstream Stage' (below a weir/sluice) · " +
        "'Groundwater' (borehole) · 'Tidal Level' (tidal influence). " +
        "Use qualifier='Groundwater' with parameter='level' for groundwater boreholes.",
      stationReference:
        "EA internal station reference code, e.g. '1491TH'. Filters to one station.",
      station:
        "Full URI of the station. Alternative to stationReference.",

      // View/sort modifiers
      _view:
        "Set to 'full' to embed inline measure metadata (label, unit, parameterName) in each reading.",
      _sorted:
        "Flag param (empty string value). Sorts readings by dateTime descending. " +
        "Use with _limit to fetch the most recent N readings.",
      _limit:
        "Integer. Max readings to return. Default 500, hard max 10000. " +
        "Omit when using 'latest' or 'today' as they self-limit.",
    },
  },

  stations: {
    description:
      "Environment Agency monitoring stations — river gauges, rainfall gauges, boreholes, " +
      "coastal and meteorological stations. Each station provides one or more measure types.",
    endpoint: "/id/stations",
    params: {
      // Measurement type filters
      parameter:
        "Short measurement code: 'level' · 'flow' · 'rainfall' · 'groundwater' · 'wind' · 'temperature'.",
      parameterName:
        "Full name: 'Water Level' · 'Flow' · 'Rainfall' · 'Groundwater' · 'Wind' · 'Temperature'.",
      qualifier:
        "'Stage' · 'Downstream Stage' · 'Groundwater' · 'Tidal Level'.",

      // Location filters
      town:
        "Nearest town name, e.g. 'York', 'Oxford'. Not all stations have a town.",
      catchmentName:
        "River catchment name, exact match, e.g. 'Cotswolds', 'Upper Thames'.",
      riverName:
        "River name, exact match, e.g. 'Thames', 'Severn', 'Cherwell'.",
      search:
        "Free-text substring search on the station label (name). Partial match works, " +
        "e.g. 'Wey' matches 'River Wey at Tilford'.",
      RLOIid:
        "River Levels on the Internet ID. Returns a single specific station.",
      stationReference:
        "EA internal station reference code. Returns a single station.",
      lat: "Latitude WGS84. Must pair with long and dist.",
      long: "Longitude WGS84. Must pair with lat and dist.",
      dist: "Radius in km from lat/long.",

      // Type and status filters
      type:
        "Station type. Valid values (case-sensitive): " +
        "'SingleLevel' · 'MultiTraceLevel' · 'Coastal' · 'Groundwater' · 'Meteorological'.",
      status:
        "Operational status. Valid values: 'Active' · 'Closed' · 'Suspended'.",
      label:
        "Exact label match for the station name.",
      _view:
        "Set to 'full' to include stageScale and downstageScale (typical range, min/max on record).",
    },
  },
};

// ---------------------------------------------------------------------------
// Few-shot examples — retrieved by keyword overlap at query time
// Flag params (latest, today, _sorted) use empty string as their value
// ---------------------------------------------------------------------------

const EXAMPLES: SearchExample[] = [
  // Flood warnings
  { query: "all active flood alerts and warnings", resource: "flood-warnings", params: { "min-severity": "3" }, summary: "All active flood alerts and warnings (severity 3 and above)." },
  { query: "flood warnings", resource: "flood-warnings", params: { "min-severity": "2" }, summary: "All active flood warnings (severity 2 and above)." },
  { query: "severe flood warnings danger to life", resource: "flood-warnings", params: { "min-severity": "1" }, summary: "Severe flood warnings — danger to life (severity 1)." },
  { query: "severe flood warnings in Yorkshire", resource: "flood-warnings", params: { "min-severity": "1", eaAreaName: "Yorkshire" }, summary: "Severe flood warnings in Yorkshire." },
  { query: "flood alerts in Kent", resource: "flood-warnings", params: { "min-severity": "3", county: "Kent" }, summary: "All flood alerts in Kent." },
  { query: "flood warnings in Somerset or Devon", resource: "flood-warnings", params: { "min-severity": "2", county: "Somerset,Devon" }, summary: "Flood warnings in Somerset and Devon." },
  { query: "critical warnings Somerset", resource: "flood-warnings", params: { "min-severity": "1", county: "Somerset" }, summary: "Severe flood warnings in Somerset." },
  { query: "warnings in East Anglia", resource: "flood-warnings", params: { "min-severity": "2", eaAreaName: "East Anglia" }, summary: "Flood warnings in East Anglia." },

  // Readings — latest
  { query: "latest water level readings", resource: "readings", params: { latest: "", parameter: "level" }, summary: "Latest water level readings from all stations." },
  { query: "current river levels", resource: "readings", params: { latest: "", parameter: "level" }, summary: "Latest river level readings." },
  { query: "all latest readings", resource: "readings", params: { latest: "" }, summary: "Most recent reading for every measure across all stations." },
  { query: "live river flow data", resource: "readings", params: { latest: "", parameter: "flow" }, summary: "Latest river flow readings." },
  { query: "current groundwater levels", resource: "readings", params: { latest: "", parameter: "level", qualifier: "Groundwater" }, summary: "Latest groundwater level readings (borehole)." },
  { query: "tidal level readings now", resource: "readings", params: { latest: "", parameter: "level", qualifier: "Tidal Level" }, summary: "Latest tidal level readings." },
  { query: "downstream stage readings", resource: "readings", params: { latest: "", qualifier: "Downstream Stage" }, summary: "Latest downstream stage readings (below weirs and sluices)." },
  { query: "wind speed readings", resource: "readings", params: { latest: "", parameter: "wind" }, summary: "Latest wind readings." },
  { query: "air temperature readings", resource: "readings", params: { latest: "", parameter: "temperature" }, summary: "Latest air temperature readings." },

  // Readings — today
  { query: "rainfall today", resource: "readings", params: { today: "", parameter: "rainfall" }, summary: "All rainfall readings since midnight today." },
  { query: "water levels today", resource: "readings", params: { today: "", parameter: "level" }, summary: "Water level readings for today." },

  // Readings — date range
  { query: "water levels on 15 January 2025", resource: "readings", params: { date: "2025-01-15", parameter: "level" }, summary: "Water level readings for 15 January 2025." },
  { query: "readings from 1 to 7 February 2025", resource: "readings", params: { startdate: "2025-02-01", enddate: "2025-02-07", parameter: "level" }, summary: "Water level readings 1–7 February 2025." },

  // Readings — by station
  { query: "readings for station 1491TH", resource: "readings", params: { latest: "", stationReference: "1491TH" }, summary: "Latest readings from station 1491TH." },
  { query: "most recent readings sorted", resource: "readings", params: { _sorted: "", _limit: "100" }, summary: "100 most recent readings sorted by datetime descending." },

  // Stations
  { query: "monitoring stations on the Thames", resource: "stations", params: { riverName: "Thames", status: "Active" }, summary: "Active monitoring stations on the River Thames." },
  { query: "stations near York", resource: "stations", params: { town: "York" }, summary: "Monitoring stations near York." },
  { query: "level stations in the Cotswolds catchment", resource: "stations", params: { catchmentName: "Cotswolds", parameter: "level" }, summary: "Water level stations in the Cotswolds catchment." },
  { query: "rainfall stations in Cornwall", resource: "stations", params: { parameter: "rainfall", search: "Cornwall" }, summary: "Rainfall monitoring stations in Cornwall." },
  { query: "active flow stations on the Severn", resource: "stations", params: { parameter: "flow", riverName: "Severn", status: "Active" }, summary: "Active river flow stations on the River Severn." },
  { query: "groundwater borehole stations", resource: "stations", params: { type: "Groundwater", status: "Active" }, summary: "Active groundwater borehole monitoring stations." },
  { query: "coastal tide gauge stations", resource: "stations", params: { type: "Coastal", status: "Active" }, summary: "Active coastal tide gauge stations." },
  { query: "find station River Wey", resource: "stations", params: { search: "River Wey" }, summary: "Stations whose label includes 'River Wey'." },
  { query: "meteorological weather stations", resource: "stations", params: { type: "Meteorological", status: "Active" }, summary: "Active meteorological monitoring stations." },
  { query: "suspended or closed stations", resource: "stations", params: { status: "Closed" }, summary: "Closed monitoring stations." },
  { query: "multi stage level stations", resource: "stations", params: { type: "MultiTraceLevel", parameter: "level" }, summary: "Multi-trace level stations (upstream and downstream)." },
];

/** Retrieve the top-K examples most relevant to the input via keyword overlap. */
function retrieveExamples(input: string, topK = 4): SearchExample[] {
  const words = new Set(input.toLowerCase().split(/\W+/).filter(Boolean));

  return EXAMPLES.map((example) => {
    const exWords = example.query.toLowerCase().split(/\W+/);
    const overlap = exWords.filter((w) => words.has(w)).length;
    return { example, overlap };
  })
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, topK)
    .map(({ example }) => example);
}

/** Build the RAG context block injected into the model prompt. */
export function buildSearchContext(input: string): string {
  const resourceDocs = Object.entries(RESOURCES)
    .map(([name, def]) => {
      const params = Object.entries(def.params)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n");
      return `[${name}]  endpoint: ${def.endpoint}\n${def.description}\nParams:\n${params}`;
    })
    .join("\n\n");

  const examples = retrieveExamples(input)
    .map(
      (ex) =>
        `  Query: "${ex.query}"\n  → resource: ${ex.resource}, params: ${JSON.stringify(ex.params)}, summary: "${ex.summary}"`
    )
    .join("\n");

  return (
    `=== Environment Agency Real Time Flood-Monitoring API Reference ===\n\n${resourceDocs}\n\n` +
    `=== Retrieved Examples (most relevant to current query) ===\n${examples}`
  );
}
