"use client";

import { Card } from "@/components/card";
import { demoOperator } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

export function OperatorCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="01 // OPERATOR">
      <p className="text-lg font-medium">Laurenz</p>
      <p className="mt-1 font-serif text-xl italic text-muted">
        Building the foundation.
      </p>
      <div className="mt-4 flex items-center gap-2 font-mono text-xs tracking-wider">
        {demo ? (
          <span className="whitespace-nowrap rounded bg-accent-dim px-2 py-1 text-accent-strong">
            STREAK {String(demoOperator.streakDays).padStart(2, "0")}D
          </span>
        ) : (
          <span className="rounded border border-border px-2 py-1 text-faint">
            STREAK —
          </span>
        )}
        <span className="text-faint">DAILY CHECK-IN · PHASE 2</span>
      </div>
    </Card>
  );
}
