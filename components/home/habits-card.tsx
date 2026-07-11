"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/ui";
import { demoHabits } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useQuery, localDate } from "@/lib/use-query";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";
import type { HabitRow, HabitCheckRow } from "@/lib/types";

function HabitRowView({
  label,
  done,
  week,
  onToggle,
}: {
  label: string;
  done: boolean;
  week: boolean[];
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className={`flex-1 rounded border px-3 py-1.5 text-left text-[15px] transition-colors ${
          done
            ? "border-accent/40 bg-accent-dim text-accent-strong"
            : "border-border text-muted hover:border-border-strong"
        }`}
      >
        {done ? "✓ " : ""}
        {label}
      </button>
      {/* Last 7 days, oldest first */}
      <span className="flex shrink-0 gap-1" aria-hidden>
        {week.map((did, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              did ? "bg-accent" : "bg-border-strong"
            }`}
          />
        ))}
      </span>
    </li>
  );
}

function DemoHabits() {
  const [habits, setHabits] = useState(demoHabits);
  const toggle = (id: string) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  const score = habits.filter((h) => h.done).length;

  return (
    <>
      <p className="mb-3 font-mono text-xs tracking-wider text-muted">
        TODAY&nbsp;
        <span className="text-accent-strong">
          {score}/{habits.length}
        </span>
      </p>
      <ul className="space-y-2.5">
        {habits.map((habit) => (
          <HabitRowView
            key={habit.id}
            label={habit.label}
            done={habit.done}
            week={habit.week}
            onToggle={() => toggle(habit.id)}
          />
        ))}
      </ul>
    </>
  );
}

function RealHabits() {
  const { data, reload } = useQuery(async (supabase) => {
    const [habitsRes, checksRes] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("archived", false)
        .order("position"),
      supabase
        .from("habit_checks")
        .select("*")
        .gte("check_date", localDate(-6)),
    ]);
    if (habitsRes.error) throw habitsRes.error;
    if (checksRes.error) throw checksRes.error;
    return {
      habits: habitsRes.data as HabitRow[],
      checks: checksRes.data as HabitCheckRow[],
    };
  });

  const toggle = async (habit: HabitRow, doneToday: boolean) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (doneToday) {
      await supabase
        .from("habit_checks")
        .delete()
        .eq("habit_id", habit.id)
        .eq("check_date", localDate());
    } else {
      await supabase
        .from("habit_checks")
        .insert({ habit_id: habit.id, check_date: localDate() });
    }
    reload();
  };

  if (!data) {
    return <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>;
  }
  if (data.habits.length === 0) {
    return <EmptyState note="No habits yet — run the seed script or add them in Supabase." />;
  }

  const days = Array.from({ length: 7 }, (_, i) => localDate(i - 6));
  const today = localDate();
  const doneToday = (h: HabitRow) =>
    data.checks.some((c) => c.habit_id === h.id && c.check_date === today);
  const score = data.habits.filter(doneToday).length;

  return (
    <>
      <p className="mb-3 font-mono text-xs tracking-wider text-muted">
        TODAY&nbsp;
        <span className="text-accent-strong">
          {score}/{data.habits.length}
        </span>
      </p>
      <ul className="space-y-2.5">
        {data.habits.map((habit) => (
          <HabitRowView
            key={habit.id}
            label={habit.label}
            done={doneToday(habit)}
            week={days.map((d) =>
              data.checks.some((c) => c.habit_id === habit.id && c.check_date === d)
            )}
            onToggle={() => toggle(habit, doneToday(habit))}
          />
        ))}
      </ul>
    </>
  );
}

export function HabitsCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="04 // HABITS">
      {demo ? (
        <DemoHabits />
      ) : isSupabaseConfigured() ? (
        <RealHabits />
      ) : (
        <EmptyState note="Connect Supabase to track real habits." />
      )}
    </Card>
  );
}
