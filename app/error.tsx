"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {error.digest
            ? `Error ID: ${error.digest}`
            : "An unexpected error occurred while loading the dashboard."}
        </p>
      </div>
      <Button onClick={unstable_retry} variant="outline">
        Try again
      </Button>
    </div>
  );
}
