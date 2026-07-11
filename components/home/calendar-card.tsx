"use client";

import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import { demoEvents } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

function DayList({ day }: { day: "today" | "tomorrow" }) {
  const events = demoEvents.filter((e) => e.day === day);
  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
        {day}
      </p>
      <ul className="space-y-1.5">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-2.5 text-[15px]">
            <span className="shrink-0 font-mono text-[13px] text-accent-strong">
              {event.time}
            </span>
            <span className="min-w-0 flex-1 truncate text-foreground">
              {event.title}
            </span>
            <Tag>{event.category}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CalendarCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="06 // CALENDAR">
      {!demo ? (
        <EmptyState note="Events arrive with the database in Phase 2." />
      ) : (
        <div className="space-y-4">
          <DayList day="today" />
          <DayList day="tomorrow" />
        </div>
      )}
    </Card>
  );
}
