"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { useDemoMode } from "@/lib/demo-mode";

/**
 * The Capture field feeds the same pipeline as the Telegram bot
 * (classify → file into the right module). Phase 1 ships the UI;
 * the pipeline goes live in Phase 2.
 */
export function CaptureCard() {
  const { demo } = useDemoMode();
  const [text, setText] = useState("");
  const [captured, setCaptured] = useState<string[]>([]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setCaptured((prev) => [trimmed, ...prev].slice(0, 3));
    setText("");
  };

  return (
    <Card label="02 // CAPTURE" className="md:col-span-2 lg:col-span-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={
            demo
              ? "Idea, task, expense, note … (demo — nothing is saved)"
              : "Capture pipeline goes live in Phase 2"
          }
          disabled={!demo}
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!demo}
          className="shrink-0 rounded bg-accent-dim px-4 py-2 font-mono text-xs tracking-wider text-accent-strong transition-colors hover:bg-accent/25 disabled:opacity-40"
        >
          CAPTURE
        </button>
      </div>
      {demo && captured.length > 0 && (
        <ul className="mt-3 space-y-1">
          {captured.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <span className="font-mono text-[10px] tracking-wider text-accent">
                → BRAIN
              </span>
              <span className="truncate">{item}</span>
              <span className="ml-auto shrink-0 font-mono text-[10px] tracking-wider text-faint">
                DEMO
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-mono text-[10px] tracking-wider text-faint">
        SAME PIPELINE AS TELEGRAM · AI CLASSIFICATION IN PHASE 2
      </p>
    </Card>
  );
}
