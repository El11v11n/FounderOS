"use client";

import { Card } from "@/components/card";
import { EmptyState, Meter, Tag } from "@/components/ui";
import { demoGoals } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

export function GoalsCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="07 // GOALS" className="md:col-span-2 lg:col-span-2">
      {!demo ? (
        <EmptyState note="Goals go live in Phase 2." />
      ) : (
        <ul className="space-y-3.5">
          {demoGoals.map((goal) => (
            <li key={goal.id}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                  {goal.title}
                </span>
                <Tag>{goal.scope}</Tag>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {Math.round(goal.progress * 100)}%
                </span>
              </div>
              <Meter progress={goal.progress} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
