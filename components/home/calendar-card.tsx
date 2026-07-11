"use client";

import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import { demoEvents } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useQuery, localDate } from "@/lib/use-query";
import { isSupabaseConfigured } from "@/lib/env";
import type { EventRow } from "@/lib/types";

function EventLine({
  time,
  title,
  category,
}: {
  time: string;
  title: string;
  category: string;
}) {
  return (
    <li className="flex items-center gap-2.5 text-[15px]">
      <span className="shrink-0 font-mono text-[13px] text-accent-strong">{time}</span>
      <span className="min-w-0 flex-1 truncate text-foreground">{title}</span>
      <Tag>{category}</Tag>
    </li>
  );
}

function DayHeading({ children }: { children: string }) {
  return (
    <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
      {children}
    </p>
  );
}

function DemoCalendar() {
  return (
    <div className="space-y-4">
      {(["today", "tomorrow"] as const).map((day) => (
        <div key={day}>
          <DayHeading>{day}</DayHeading>
          <ul className="space-y-1.5">
            {demoEvents
              .filter((e) => e.day === day)
              .map((event) => (
                <EventLine
                  key={event.id}
                  time={event.time}
                  title={event.title}
                  category={event.category}
                />
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RealCalendar() {
  const { data: events } = useQuery(async (supabase) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", localDate())
      .lte("event_date", localDate(1))
      .order("event_date")
      .order("event_time");
    if (error) throw error;
    return data as EventRow[];
  });

  if (!events) {
    return <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>;
  }

  const days: { key: string; label: string }[] = [
    { key: localDate(), label: "today" },
    { key: localDate(1), label: "tomorrow" },
  ];

  const hasAny = events.length > 0;
  if (!hasAny) {
    return <EmptyState note="Nothing scheduled for today or tomorrow." />;
  }

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const list = events.filter((e) => e.event_date === day.key);
        return (
          <div key={day.key}>
            <DayHeading>{day.label}</DayHeading>
            {list.length === 0 ? (
              <p className="text-sm text-faint">—</p>
            ) : (
              <ul className="space-y-1.5">
                {list.map((event) => (
                  <EventLine
                    key={event.id}
                    time={event.event_time?.slice(0, 5) ?? "—"}
                    title={event.title}
                    category={event.category}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CalendarCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="06 // CALENDAR">
      {demo ? (
        <DemoCalendar />
      ) : isSupabaseConfigured() ? (
        <RealCalendar />
      ) : (
        <EmptyState note="Connect Supabase to see real events." />
      )}
    </Card>
  );
}
