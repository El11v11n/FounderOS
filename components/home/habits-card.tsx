"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/ui";
import { demoHabits } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

export function HabitsCard() {
  const { demo } = useDemoMode();
  const [habits, setHabits] = useState(demoHabits);

  const toggle = (id: string) =>
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );

  const score = habits.filter((h) => h.done).length;

  return (
    <Card label="04 // HABITS">
      {!demo ? (
        <EmptyState note="Habit tracking goes live in Phase 2." />
      ) : (
        <>
          <p className="mb-3 font-mono text-xs tracking-wider text-muted">
            TODAY&nbsp;
            <span className="text-accent-strong">
              {score}/{habits.length}
            </span>
          </p>
          <ul className="space-y-2">
            {habits.map((habit) => (
              <li key={habit.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(habit.id)}
                  aria-pressed={habit.done}
                  className={`flex-1 rounded border px-3 py-1.5 text-left text-[15px] transition-colors ${
                    habit.done
                      ? "border-accent/40 bg-accent-dim text-accent-strong"
                      : "border-border text-muted hover:border-border-strong"
                  }`}
                >
                  {habit.done ? "✓ " : ""}
                  {habit.label}
                </button>
                {/* Last 7 days, oldest first */}
                <span className="flex shrink-0 gap-1" aria-hidden>
                  {habit.week.map((did, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        did ? "bg-accent" : "bg-border-strong"
                      }`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
