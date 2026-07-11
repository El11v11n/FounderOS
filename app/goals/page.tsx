"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/card";
import { EmptyState, Meter, Tag } from "@/components/ui";
import {
  Field,
  GhostButton,
  ModuleGate,
  ModuleHeader,
  PrimaryButton,
  SelectField,
} from "@/components/module-page";
import { useRows } from "@/lib/use-rows";
import type { GoalRow } from "@/lib/types";

const SCOPES: GoalRow["scope"][] = ["WEEK", "MONTH", "QUARTER"];

function Goals() {
  const { rows, insert, update, remove } = useRows<GoalRow>("goals", {
    order: [
      { column: "done", ascending: true },
      { column: "created_at", ascending: false },
    ],
  });
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<GoalRow["scope"]>("WEEK");

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await insert({ title: title.trim(), scope } as Partial<GoalRow>);
    if (ok) setTitle("");
  };

  const bump = (goal: GoalRow, direction: 1 | -1) => {
    const next = Math.min(1, Math.max(0, Number(goal.progress) + direction * 0.1));
    update(goal.id, {
      progress: Math.round(next * 10) / 10,
      done: next >= 1,
    } as Partial<GoalRow>);
  };

  return (
    <>
      <Card label="NEW GOAL">
        <form onSubmit={add} className="flex flex-wrap gap-3">
          <Field
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
            required
            className="min-w-0 flex-1"
          />
          <SelectField
            value={scope}
            onChange={(e) => setScope(e.target.value as GoalRow["scope"])}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
          <PrimaryButton>ADD GOAL</PrimaryButton>
        </form>
      </Card>

      <Card label="GOALS">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : rows.length === 0 ? (
          <EmptyState note="No goals yet — set the direction above." />
        ) : (
          <ul className="space-y-4">
            {rows.map((goal) => (
              <li key={goal.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`min-w-0 flex-1 truncate text-[15px] ${
                      goal.done ? "text-faint line-through" : "text-foreground"
                    }`}
                  >
                    {goal.title}
                  </span>
                  <Tag>{goal.scope}</Tag>
                  <span className="shrink-0 font-mono text-xs text-muted">
                    {Math.round(Number(goal.progress) * 100)}%
                  </span>
                  <GhostButton onClick={() => bump(goal, -1)}>−10</GhostButton>
                  <GhostButton onClick={() => bump(goal, 1)}>+10</GhostButton>
                  <GhostButton danger onClick={() => remove(goal.id)}>
                    DELETE
                  </GhostButton>
                </div>
                <Meter progress={Number(goal.progress)} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The direction."
        subtitle="Weekly, monthly and quarterly goals with visible progress."
      />
      <ModuleGate label="08 // GOALS">
        <Goals />
      </ModuleGate>
    </div>
  );
}
