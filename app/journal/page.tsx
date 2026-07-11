"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/ui";
import {
  Field,
  GhostButton,
  ModuleGate,
  ModuleHeader,
  PrimaryButton,
  TextAreaField,
} from "@/components/module-page";
import { useRows } from "@/lib/use-rows";
import { localDate } from "@/lib/use-query";
import type { JournalRow } from "@/lib/types";

function entryDayLabel(date: string): string {
  if (date === localDate()) return "TODAY";
  if (date === localDate(-1)) return "YESTERDAY";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Journal() {
  const { rows, insert, remove } = useRows<JournalRow>("journal_entries", {
    order: [
      { column: "entry_date", ascending: false },
      { column: "created_at", ascending: false },
    ],
    limit: 60,
  });
  const [content, setContent] = useState("");
  const [date, setDate] = useState(localDate());

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const ok = await insert({
      entry_date: date,
      content: content.trim(),
    } as Partial<JournalRow>);
    if (ok) setContent("");
  };

  return (
    <>
      <Card label="NEW ENTRY">
        <form onSubmit={add} className="space-y-3">
          <TextAreaField
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened today? Three honest lines beat a perfect page."
            rows={3}
            className="w-full"
            required
          />
          <div className="flex gap-3">
            <Field
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
            <PrimaryButton>LOG IT</PrimaryButton>
          </div>
        </form>
      </Card>

      <Card label="THE LOG">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : rows.length === 0 ? (
          <EmptyState note="No entries yet — the quiet record starts above." />
        ) : (
          <ul className="space-y-4">
            {rows.map((entry) => (
              <li key={entry.id}>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                    {entryDayLabel(entry.entry_date)}
                  </p>
                  <span className="flex-1" />
                  <GhostButton danger onClick={() => remove(entry.id)}>
                    ✕
                  </GhostButton>
                </div>
                <p className="whitespace-pre-wrap text-[15px] text-foreground">
                  {entry.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The log."
        subtitle="A daily entry — the quiet record behind the numbers."
      />
      <ModuleGate label="09 // JOURNAL">
        <Journal />
      </ModuleGate>
    </div>
  );
}
