"use client";

import { Card } from "@/components/card";
import { demoOperator } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useQuery, localDate } from "@/lib/use-query";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Streak = consecutive days (ending today or yesterday) with at least
 * one habit check. A day without any check breaks it.
 */
function computeStreak(checkDates: string[]): number {
  const days = new Set(checkDates);
  let streak = 0;
  let offset = days.has(localDate()) ? 0 : -1; // today not done yet? count from yesterday
  while (days.has(localDate(offset))) {
    streak += 1;
    offset -= 1;
  }
  return streak;
}

function RealStreak() {
  const { data } = useQuery(async (supabase) => {
    const { data: checks, error } = await supabase
      .from("habit_checks")
      .select("check_date")
      .gte("check_date", localDate(-60));
    if (error) throw error;
    return computeStreak(checks.map((c: { check_date: string }) => c.check_date));
  });

  if (data === null) {
    return (
      <span className="rounded border border-border px-2 py-1 text-faint">STREAK —</span>
    );
  }
  return (
    <span
      className={`whitespace-nowrap rounded px-2 py-1 ${
        data > 0
          ? "bg-accent-dim text-accent-strong"
          : "border border-border text-faint"
      }`}
    >
      STREAK {String(data).padStart(2, "0")}D
    </span>
  );
}

export function OperatorCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="01 // OPERATOR">
      <p className="text-xl font-medium">Laurenz</p>
      <p className="mt-1 font-serif text-2xl italic text-muted">
        Building the foundation.
      </p>
      <div className="mt-4 flex items-center gap-2 font-mono text-xs tracking-wider">
        {demo ? (
          <span className="whitespace-nowrap rounded bg-accent-dim px-2 py-1 text-accent-strong">
            STREAK {String(demoOperator.streakDays).padStart(2, "0")}D
          </span>
        ) : isSupabaseConfigured() ? (
          <RealStreak />
        ) : (
          <span className="rounded border border-border px-2 py-1 text-faint">
            STREAK —
          </span>
        )}
        <span className="text-faint">HABIT STREAK · DAILY</span>
      </div>
    </Card>
  );
}
