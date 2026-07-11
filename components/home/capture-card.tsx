"use client";

import { useState } from "react";
import { Card } from "@/components/card";
import { useAuth } from "@/lib/auth";
import { useDemoMode } from "@/lib/demo-mode";
import { isSupabaseConfigured } from "@/lib/env";

type CapturedItem = {
  captureId: string | null;
  text: string;
  target: string; // e.g. "TASKS", "BRAIN", "UNSORTED"
  demo: boolean;
  undone?: boolean;
};

const TYPE_TARGET: Record<string, string> = {
  task: "TASKS",
  idea: "BRAIN",
  note: "BRAIN",
  event: "CALENDAR",
  expense: "FINANCE",
  contact: "CRM",
  journal: "JOURNAL",
};

/**
 * The Capture field feeds the same pipeline as the Telegram bot:
 * classify → file into the right module. Low confidence lands in
 * BRAIN as "unsorted" instead of guessing.
 */
export function CaptureCard() {
  const { demo } = useDemoMode();
  const { session } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<CapturedItem[]>([]);

  const realActive = !demo && isSupabaseConfigured() && Boolean(session);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    if (demo) {
      setCaptured((prev) =>
        [{ captureId: null, text: trimmed, target: "BRAIN", demo: true }, ...prev].slice(0, 3)
      );
      setText("");
      return;
    }
    if (!realActive) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Capture failed");
      const target =
        data.status === "filed" ? TYPE_TARGET[data.type] ?? "BRAIN" : "UNSORTED";
      setCaptured((prev) =>
        [{ captureId: data.captureId, text: trimmed, target, demo: false }, ...prev].slice(0, 3)
      );
      setText("");
      // Other cards reload on next visit; keep it simple for now.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setBusy(false);
    }
  };

  const undo = async (item: CapturedItem) => {
    if (!item.captureId || !session) return;
    const res = await fetch(`/api/capture?id=${item.captureId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      setCaptured((prev) =>
        prev.map((c) => (c.captureId === item.captureId ? { ...c, undone: true } : c))
      );
    }
  };

  const disabled = !demo && !realActive;

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
              : realActive
                ? "Idea, task, expense, note … it gets filed automatically"
                : "Connect Supabase to start capturing"
          }
          disabled={disabled || busy}
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-[15px] text-foreground placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || busy}
          className="shrink-0 rounded bg-accent-dim px-4 py-2 font-mono text-xs tracking-wider text-accent-strong transition-colors hover:bg-accent/25 disabled:opacity-40"
        >
          {busy ? "FILING…" : "CAPTURE"}
        </button>
      </div>
      {error && (
        <p className="mt-2 font-mono text-[11px] tracking-wider text-negative-strong">
          ✕ {error}
        </p>
      )}
      {captured.length > 0 && (
        <ul className="mt-3 space-y-1">
          {captured.map((item, i) => (
            <li
              key={`${item.captureId ?? item.text}-${i}`}
              className="flex items-center gap-2 text-[15px] text-muted"
            >
              <span
                className={`font-mono text-[10px] tracking-wider ${
                  item.undone ? "text-faint" : "text-accent"
                }`}
              >
                {item.undone ? "✕ UNDONE" : `→ ${item.target}`}
              </span>
              <span className={`truncate ${item.undone ? "line-through" : ""}`}>
                {item.text}
              </span>
              {item.demo ? (
                <span className="ml-auto shrink-0 font-mono text-[10px] tracking-wider text-faint">
                  DEMO
                </span>
              ) : (
                !item.undone && (
                  <button
                    type="button"
                    onClick={() => undo(item)}
                    className="ml-auto shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-faint transition-colors hover:text-negative-strong"
                  >
                    UNDO
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 font-mono text-[10px] tracking-wider text-faint">
        SAME PIPELINE AS TELEGRAM · LOW CONFIDENCE → BRAIN INBOX
      </p>
    </Card>
  );
}
