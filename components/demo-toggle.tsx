"use client";

import { useDemoMode } from "@/lib/demo-mode";

export function DemoToggle() {
  const { demo, setDemo } = useDemoMode();

  return (
    <button
      type="button"
      onClick={() => setDemo(!demo)}
      aria-pressed={demo}
      title="Demo mode shows sample data; real mode shows only your data"
      className={`shrink-0 rounded border px-2.5 py-1 font-mono text-[11px] tracking-wider transition-colors ${
        demo
          ? "border-accent/40 bg-accent-dim text-accent-strong"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      DEMO {demo ? "ON" : "OFF"}
    </button>
  );
}
