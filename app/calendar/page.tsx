"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import {
  Field,
  GhostButton,
  ModuleGate,
  ModuleHeader,
  PrimaryButton,
  SelectField,
} from "@/components/module-page";
import { useRows } from "@/lib/use-rows";
import { localDate } from "@/lib/use-query";
import type { EventRow } from "@/lib/types";

const CATEGORIES = ["BUSINESS", "CAFÉ", "HOTEL", "PRIVATE"];

function dayLabel(date: string): string {
  if (date === localDate()) return "TODAY";
  if (date === localDate(1)) return "TOMORROW";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function Events() {
  const { rows, insert, remove } = useRows<EventRow>("events", {
    order: [
      { column: "event_date", ascending: true },
      { column: "event_time", ascending: true },
    ],
  });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate());
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("BUSINESS");

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await insert({
      title: title.trim(),
      event_date: date,
      event_time: time || null,
      category,
    } as Partial<EventRow>);
    if (ok) {
      setTitle("");
      setTime("");
    }
  };

  const upcoming = (rows ?? []).filter((e) => e.event_date >= localDate());
  const past = (rows ?? []).filter((e) => e.event_date < localDate());
  const byDay = new Map<string, EventRow[]>();
  for (const event of upcoming) {
    byDay.set(event.event_date, [...(byDay.get(event.event_date) ?? []), event]);
  }

  return (
    <>
      <Card label="NEW EVENT">
        <form onSubmit={add} className="flex flex-wrap gap-3">
          <Field
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            required
            className="min-w-0 flex-1"
          />
          <Field
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <Field
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-28"
          />
          <SelectField value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <PrimaryButton>ADD EVENT</PrimaryButton>
        </form>
      </Card>

      <Card label="UPCOMING">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : upcoming.length === 0 ? (
          <EmptyState note="Nothing scheduled — add an event above or capture one." />
        ) : (
          <div className="space-y-4">
            {[...byDay.entries()].map(([day, events]) => (
              <div key={day}>
                <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                  {dayLabel(day)}
                </p>
                <ul className="space-y-1.5">
                  {events.map((event) => (
                    <li key={event.id} className="flex items-center gap-2.5 text-[15px]">
                      <span className="shrink-0 font-mono text-[13px] text-accent-strong">
                        {event.event_time?.slice(0, 5) ?? "—"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {event.title}
                      </span>
                      <Tag>{event.category}</Tag>
                      <GhostButton danger onClick={() => remove(event.id)}>
                        ✕
                      </GhostButton>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {past.length > 0 && (
          <p className="mt-4 font-mono text-[11px] tracking-wider text-faint">
            {past.length} PAST EVENTS KEPT IN THE LOG
          </p>
        )}
      </Card>
    </>
  );
}

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The schedule."
        subtitle="Events by day, colored by category — Telegram capture lands here too."
      />
      <ModuleGate label="07 // CALENDAR">
        <Events />
      </ModuleGate>
    </div>
  );
}
