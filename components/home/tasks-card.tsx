"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import { demoTasks } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

const VENTURE_TAGS: Record<string, string> = {
  cafe: "CAFÉ",
  hotel: "HOTEL",
  personal: "PERSONAL",
};

export function TasksCard() {
  const { demo } = useDemoMode();
  const [tasks, setTasks] = useState(demoTasks);

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const open = tasks.filter((t) => !t.done).length;

  return (
    <Card label="03 // TODAY" className="md:col-span-2 lg:col-span-2 lg:row-span-2">
      {!demo ? (
        <EmptyState note="Tasks arrive with the database in Phase 2." />
      ) : (
        <>
          <p className="mb-3 font-mono text-xs tracking-wider text-muted">
            {open} OPEN · {tasks.length - open} DONE
          </p>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className="flex w-full items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5 text-left transition-colors hover:border-border-strong"
                >
                  <span
                    aria-hidden
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[10px] ${
                      task.done
                        ? "border-accent bg-accent-dim text-accent-strong"
                        : "border-border-strong text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      task.done ? "text-faint line-through" : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.venture && <Tag>{VENTURE_TAGS[task.venture]}</Tag>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
