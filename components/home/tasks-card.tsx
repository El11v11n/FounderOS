"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import { demoTasks } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useRows } from "@/lib/use-rows";
import { isSupabaseConfigured } from "@/lib/env";
import type { TaskRow } from "@/lib/types";

const VENTURE_TAGS: Record<string, string> = {
  cafe: "CAFÉ",
  hotel: "HOTEL",
  holding: "HOLDING",
  personal: "PERSONAL",
};

function TaskButton({
  title,
  done,
  ventureTag,
  onToggle,
}: {
  title: string;
  done: boolean;
  ventureTag: string | null;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5 text-left transition-colors hover:border-border-strong"
    >
      <span
        aria-hidden
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[10px] ${
          done
            ? "border-accent bg-accent-dim text-accent-strong"
            : "border-border-strong text-transparent"
        }`}
      >
        ✓
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[15px] ${
          done ? "text-faint line-through" : "text-foreground"
        }`}
      >
        {title}
      </span>
      {ventureTag && <Tag>{ventureTag}</Tag>}
    </button>
  );
}

function DemoTasks() {
  const [tasks, setTasks] = useState(demoTasks);
  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const open = tasks.filter((t) => !t.done).length;

  return (
    <>
      <p className="mb-3 font-mono text-xs tracking-wider text-muted">
        {open} OPEN · {tasks.length - open} DONE
      </p>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskButton
              title={task.title}
              done={task.done}
              ventureTag={task.venture ? VENTURE_TAGS[task.venture] : null}
              onToggle={() => toggle(task.id)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function RealTasks() {
  const { rows, insert, update } = useRows<TaskRow>("tasks", {
    order: [
      { column: "done", ascending: true },
      { column: "due_date", ascending: true },
      { column: "created_at", ascending: false },
    ],
    limit: 12,
  });
  const [title, setTitle] = useState("");

  const add = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTitle("");
    await insert({ title: trimmed } as Partial<TaskRow>);
  };

  const toggle = (task: TaskRow) =>
    update(task.id, {
      done: !task.done,
      done_at: task.done ? null : new Date().toISOString(),
    } as Partial<TaskRow>);

  if (rows === null) {
    return <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>;
  }

  const open = rows.filter((t) => !t.done).length;

  return (
    <>
      <p className="mb-3 font-mono text-xs tracking-wider text-muted">
        {open} OPEN · {rows.length - open} DONE
      </p>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task …"
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-1.5 text-[15px] text-foreground placeholder:text-faint focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded bg-accent-dim px-3 py-1.5 font-mono text-xs tracking-wider text-accent-strong transition-colors hover:bg-accent/25"
        >
          ADD
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState note="No tasks yet — add one above or use Capture." />
      ) : (
        <ul className="space-y-2">
          {rows.map((task) => (
            <li key={task.id}>
              <TaskButton
                title={task.title}
                done={task.done}
                ventureTag={task.venture ? VENTURE_TAGS[task.venture] ?? null : null}
                onToggle={() => toggle(task)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function TasksCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="03 // TODAY" className="md:col-span-2 lg:col-span-2 lg:row-span-2">
      {demo ? (
        <DemoTasks />
      ) : isSupabaseConfigured() ? (
        <RealTasks />
      ) : (
        <EmptyState note="Connect Supabase to manage real tasks." />
      )}
    </Card>
  );
}
