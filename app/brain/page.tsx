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
  TextAreaField,
  VENTURE_OPTIONS,
  VENTURE_TAGS,
} from "@/components/module-page";
import { useRows } from "@/lib/use-rows";
import type { CaptureRow, IdeaRow } from "@/lib/types";

const STATUS_ORDER: IdeaRow["status"][] = ["inbox", "active", "archived"];

function UnsortedInbox() {
  const { rows, update, remove } = useRows<CaptureRow>("captures", {
    order: [{ column: "created_at", ascending: false }],
  });
  const ideas = useRows<IdeaRow>("ideas", { limit: 1 }); // for insert only

  const unsorted = (rows ?? []).filter((c) => c.status === "unsorted");
  if (unsorted.length === 0) return null;

  const toIdea = async (capture: CaptureRow) => {
    const ok = await ideas.insert({
      title: capture.raw_text.slice(0, 120),
      details: capture.raw_text.length > 120 ? capture.raw_text : null,
      status: "inbox",
      source: "capture",
    } as Partial<IdeaRow>);
    if (ok) await update(capture.id, { status: "filed" } as Partial<CaptureRow>);
  };

  return (
    <Card label="UNSORTED // NEEDS A DECISION">
      <ul className="space-y-2">
        {unsorted.map((capture) => (
          <li
            key={capture.id}
            className="flex items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5"
          >
            <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
              {capture.raw_text}
            </span>
            <GhostButton onClick={() => toIdea(capture)}>TO IDEA</GhostButton>
            <GhostButton danger onClick={() => remove(capture.id)}>
              DELETE
            </GhostButton>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Ideas() {
  const { rows, insert, update, remove } = useRows<IdeaRow>("ideas", {
    order: [{ column: "created_at", ascending: false }],
  });
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [venture, setVenture] = useState("");
  const [tags, setTags] = useState("");

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await insert({
      title: title.trim(),
      details: details.trim() || null,
      venture: venture || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    } as Partial<IdeaRow>);
    if (ok) {
      setTitle("");
      setDetails("");
      setVenture("");
      setTags("");
    }
  };

  const cycleStatus = (idea: IdeaRow) => {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(idea.status) + 1) % STATUS_ORDER.length];
    update(idea.id, { status: next } as Partial<IdeaRow>);
  };

  const visible = (rows ?? []).filter((i) => i.status !== "archived");
  const archived = (rows ?? []).filter((i) => i.status === "archived");

  return (
    <>
      <Card label="NEW IDEA">
        <form onSubmit={add} className="space-y-3">
          <Field
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Idea title"
            className="w-full"
            required
          />
          <TextAreaField
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className="w-full"
          />
          <div className="flex flex-wrap gap-3">
            <SelectField value={venture} onChange={(e) => setVenture(e.target.value)}>
              {VENTURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
            <Field
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags, comma-separated"
              className="min-w-0 flex-1"
            />
            <PrimaryButton>ADD IDEA</PrimaryButton>
          </div>
        </form>
      </Card>

      <Card label="IDEAS">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : visible.length === 0 ? (
          <EmptyState note="No ideas yet — capture one or add it above." />
        ) : (
          <ul className="space-y-2">
            {visible.map((idea) => (
              <li
                key={idea.id}
                className="rounded border border-border bg-surface-raised px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                    {idea.title}
                  </span>
                  {idea.venture && <Tag>{VENTURE_TAGS[idea.venture]}</Tag>}
                  {idea.tags.map((t) => (
                    <Tag key={t}>{t.toUpperCase()}</Tag>
                  ))}
                  <GhostButton onClick={() => cycleStatus(idea)}>
                    {idea.status.toUpperCase()}
                  </GhostButton>
                  <GhostButton danger onClick={() => remove(idea.id)}>
                    DELETE
                  </GhostButton>
                </div>
                {idea.details && (
                  <p className="mt-1 text-sm text-muted">{idea.details}</p>
                )}
              </li>
            ))}
          </ul>
        )}
        {archived.length > 0 && (
          <p className="mt-3 font-mono text-[11px] tracking-wider text-faint">
            {archived.length} ARCHIVED — CYCLE STATUS TO BRING BACK
          </p>
        )}
      </Card>
    </>
  );
}

export default function BrainPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The idea inbox."
        subtitle="Every captured idea lands here — tagged, filterable, never lost."
      />
      <ModuleGate label="03 // BRAIN">
        <UnsortedInbox />
        <Ideas />
      </ModuleGate>
    </div>
  );
}
