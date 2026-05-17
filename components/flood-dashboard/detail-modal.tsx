import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import type { DetailItem } from "@/services/flood-monitoring/flood-monitoring.types";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { StatusBadge } from "./dashboard-states";

export function DetailModal({
  detail,
  onClose,
}: {
  detail: DetailItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={Boolean(detail)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border p-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                {detail?.kind === "alert" ? detail.item.area : detail?.item.station}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {detail?.kind === "alert"
                  ? "Flood alert detail"
                  : "Station reading detail"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>
          {detail ? (
            <div className="space-y-5 p-4">
              {detail.kind === "alert" ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      tone={detail.item.severity === "severe" ? "rose" : "amber"}
                    >
                      {detail.item.severityLabel}
                    </StatusBadge>
                    <StatusBadge>{detail.item.isTidal ? "tidal" : "river"}</StatusBadge>
                  </div>
                  <DetailGrid
                    rows={[
                      ["Region", detail.item.region],
                      ["County", detail.item.county],
                      ["River or sea", detail.item.riverOrSea],
                      ["Raised", formatDateTime(detail.item.raisedAt)],
                      ["Changed", formatDateTime(detail.item.changedAt)],
                    ]}
                  />
                  <div>
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Message
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {detail.item.message}
                    </p>
                  </div>
                  <SourceLink href={detail.item.sourceUrl} />
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="amber">
                      {detail.item.valueLabel}
                      {detail.item.value === null ? "" : detail.item.unit}
                    </StatusBadge>
                    <StatusBadge>{detail.item.parameter}</StatusBadge>
                  </div>
                  <DetailGrid
                    rows={[
                      ["Station reference", detail.item.stationReference],
                      ["Qualifier", detail.item.qualifier],
                      ["Unit", detail.item.unit],
                      ["Reading time", formatDateTime(detail.item.dateTime)],
                    ]}
                  />
                  <SourceLink href={detail.item.sourceUrl} />
                </>
              )}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-md border border-border bg-card p-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SourceLink({ href }: { href: string }) {
  return (
    <a
      className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      View Environment Agency source
    </a>
  );
}
