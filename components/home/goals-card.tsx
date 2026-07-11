"use client";

import { Card } from "@/components/card";
import { EmptyState, Meter, Tag } from "@/components/ui";
import { demoGoals } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useRows } from "@/lib/use-rows";
import { isSupabaseConfigured } from "@/lib/env";
import type { GoalRow } from "@/lib/types";

function GoalLine({
  title,
  scope,
  progress,
}: {
  title: string;
  scope: string;
  progress: number;
}) {
  return (
    <li>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
          {title}
        </span>
        <Tag>{scope}</Tag>
        <span className="shrink-0 font-mono text-xs text-muted">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <Meter progress={progress} />
    </li>
  );
}

function RealGoals() {
  const { rows } = useRows<GoalRow>("goals", {
    order: [
      { column: "done", ascending: true },
      { column: "created_at", ascending: false },
    ],
    limit: 6,
  });

  if (rows === null) {
    return <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>;
  }
  if (rows.length === 0) {
    return <EmptyState note="No goals yet — set them on the GOALS page." />;
  }
  return (
    <ul className="space-y-3.5">
      {rows.map((goal) => (
        <GoalLine
          key={goal.id}
          title={goal.title}
          scope={goal.scope}
          progress={goal.progress}
        />
      ))}
    </ul>
  );
}

export function GoalsCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="07 // GOALS" className="md:col-span-2 lg:col-span-2">
      {demo ? (
        <ul className="space-y-3.5">
          {demoGoals.map((goal) => (
            <GoalLine
              key={goal.id}
              title={goal.title}
              scope={goal.scope}
              progress={goal.progress}
            />
          ))}
        </ul>
      ) : isSupabaseConfigured() ? (
        <RealGoals />
      ) : (
        <EmptyState note="Connect Supabase to track real goals." />
      )}
    </Card>
  );
}
