import { Suspense } from "react";
import { FloodDashboardClient } from "./flood-dashboard-client";
import { SkeletonBlock } from "./dashboard-states";

export function FloodDashboard() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <FloodDashboardClient />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <main className="min-h-screen space-y-4 bg-background p-6 text-foreground">
      <SkeletonBlock className="h-20 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32" />
        ))}
      </div>
      <SkeletonBlock className="h-12 w-full" />
      <div className="grid gap-4 xl:grid-cols-2">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
    </main>
  );
}
