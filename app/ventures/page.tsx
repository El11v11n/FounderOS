"use client";

import { Card } from "@/components/card";
import { Tag } from "@/components/ui";
import { ModuleGate, ModuleHeader } from "@/components/module-page";
import { useQuery } from "@/lib/use-query";
import type { IdeaRow, TaskRow } from "@/lib/types";

const CAFE_OPENING = "2026-09-01";

function daysUntil(dateString: string): number {
  const target = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function VentureCard({
  label,
  name,
  note,
  openTasks,
  ideas,
  extra,
}: {
  label: string;
  name: string;
  note: string;
  openTasks: number;
  ideas: number;
  extra?: React.ReactNode;
}) {
  return (
    <Card label={label}>
      <p className="text-xl font-medium">{name}</p>
      <p className="mt-1 text-sm text-muted">{note}</p>
      {extra}
      <div className="mt-4 flex gap-2 font-mono text-xs tracking-wider">
        <span className="rounded border border-border px-2 py-1 text-muted">
          {openTasks} OPEN TASKS
        </span>
        <span className="rounded border border-border px-2 py-1 text-muted">
          {ideas} IDEAS
        </span>
      </div>
    </Card>
  );
}

function Ventures() {
  const { data } = useQuery(async (supabase) => {
    const [tasksRes, ideasRes] = await Promise.all([
      supabase.from("tasks").select("id, venture, done").eq("done", false),
      supabase.from("ideas").select("id, venture, status").neq("status", "archived"),
    ]);
    if (tasksRes.error) throw tasksRes.error;
    if (ideasRes.error) throw ideasRes.error;
    return {
      tasks: tasksRes.data as Pick<TaskRow, "id" | "venture" | "done">[],
      ideas: ideasRes.data as Pick<IdeaRow, "id" | "venture" | "status">[],
    };
  });

  const openTasks = (venture: string) =>
    (data?.tasks ?? []).filter((t) => t.venture === venture).length;
  const ideaCount = (venture: string) =>
    (data?.ideas ?? []).filter((i) => i.venture === venture).length;

  const countdown = daysUntil(CAFE_OPENING);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <VentureCard
        label="VENTURE 01 // CAFÉ MÜNCHEN"
        name="Café München"
        note="Opening September 2026 — venture #1."
        openTasks={openTasks("cafe")}
        ideas={ideaCount("cafe")}
        extra={
          <p className="mt-3 font-mono text-3xl text-accent-strong">
            {countdown > 0 ? `T−${countdown}` : "OPEN"}
            {countdown > 0 && (
              <span className="ml-2 text-xs tracking-wider text-faint">
                DAYS TO OPENING
              </span>
            )}
          </p>
        }
      />
      <VentureCard
        label="VENTURE 02 // HOTEL ÖSTERREICH"
        name="Hotel Österreich"
        note="Dad's 14-room hotel — the testbed. KPIs (occupancy, ADR) come in a later phase."
        openTasks={openTasks("hotel")}
        ideas={ideaCount("hotel")}
      />
      <Card label="VENTURE 03 // HOLDING">
        <p className="text-xl font-medium">Holding</p>
        <p className="mt-1 text-sm text-muted">
          Activates once revenue exists. Milestone tracker planned.
        </p>
        <div className="mt-4">
          <Tag>DORMANT</Tag>
        </div>
      </Card>
    </div>
  );
}

export default function VenturesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <ModuleHeader
        title="The portfolio."
        subtitle="One card per venture — tag tasks and ideas with a venture and they roll up here."
      />
      <ModuleGate label="05 // VENTURES">
        <Ventures />
      </ModuleGate>
    </div>
  );
}
