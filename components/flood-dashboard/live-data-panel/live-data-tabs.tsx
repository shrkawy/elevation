import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type * as React from "react";

export function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={cn("h-6 rounded px-2", active && "bg-primary text-primary-foreground")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
