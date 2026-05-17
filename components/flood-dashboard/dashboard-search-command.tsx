import { Button } from "@/components/ui/button";
import {
  mapEndpointParamsToDashboardParams,
  sanitizeDashboardSearchParams,
} from "@/services/flood-monitoring/flood-monitoring.helpers";
import type { DashboardSearchParams } from "@/services/flood-monitoring/flood-monitoring.types";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Panel, StatusBadge } from "./dashboard-states";

type SearchResponse = {
  input?: string;
  params?: Record<string, string>;
  resource?: string;
  source?: "ai" | "local";
  summary?: string;
};

function mapSearchResponseToDashboardParams(
  resource: string | undefined,
  params: Record<string, string> | undefined
): DashboardSearchParams {
  return mapEndpointParamsToDashboardParams(resource, params ?? {});
}

export function DashboardSearchCommand({
  onApply,
}: {
  onApply: (params: DashboardSearchParams) => void;
}) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "fallback">(
    "idle"
  );

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const command = text.trim();
    if (!command) {
      onApply({});
      setSummary(null);
      return;
    }

    setStatus("loading");
    setSummary(null);

    try {
      const url = new URL("/api/search-intent", window.location.origin);
      url.searchParams.set("q", command);
      const response = await fetch(url.toString());
      const payload = (await response.json()) as SearchResponse;

      onApply(mapSearchResponseToDashboardParams(payload.resource, payload.params));
      setSummary(payload.summary ?? null);
      setStatus(payload.source === "local" ? "fallback" : "idle");
    } catch {
      onApply(sanitizeDashboardSearchParams({ q: command }));
      setSummary(null);
      setStatus("fallback");
    }
  }

  return (
    <Panel className="flex flex-col gap-2 p-3">
      <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <label className="relative flex min-h-11 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <span className="sr-only">Search or ask AI</span>
          <input
            value={text}
            onChange={(event) => {
              const value = event.target.value;
              setText(value);
              if (!value) {
                onApply({});
                setSummary(null);
                setStatus("idle");
              }
            }}
            className="h-11 w-full rounded-md border border-input bg-input pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder='Search or ask AI, e.g. "Show severe alerts in Yorkshire"'
          />
        </label>
        <div className="flex items-center gap-2">
          {status === "fallback" ? (
            <StatusBadge tone="amber">fallback parser</StatusBadge>
          ) : null}
          <Button type="submit" disabled={status === "loading"}>
            <Sparkles className="size-4" />
            {status === "loading" ? "Parsing" : "Apply"}
          </Button>
        </div>
      </form>
      {summary ? (
        <p className="px-1 font-mono text-[11px] text-muted-foreground">
          {summary}
        </p>
      ) : null}
    </Panel>
  );
}
