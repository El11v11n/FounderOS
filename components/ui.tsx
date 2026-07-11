import type { ReactNode } from "react";

/**
 * Signed percentage delta with direction arrow. Arrow + sign carry the
 * direction so color is never the only channel.
 */
export function Delta({
  value,
  goodWhenUp = true,
}: {
  value: number; // e.g. 0.12 for +12 %
  goodWhenUp?: boolean;
}) {
  const up = value >= 0;
  const good = up === goodWhenUp;
  return (
    <span
      className={`font-mono text-xs tracking-wider ${
        good ? "text-accent-strong" : "text-negative-strong"
      }`}
    >
      {up ? "▲" : "▼"} {up ? "+" : "−"}
      {Math.round(Math.abs(value) * 100)}%
    </span>
  );
}

/** Thin progress meter: accent fill on a dim track of the same hue. */
export function Meter({ progress }: { progress: number }) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-accent-dim"
    >
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Small mono tag, e.g. venture or category markers. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-faint">
      {children}
    </span>
  );
}

/** Shown in real mode while a module has no data source yet (Phase 2). */
export function EmptyState({ note }: { note: string }) {
  return (
    <div className="flex min-h-20 flex-col items-start justify-center gap-1">
      <p className="font-mono text-xs tracking-wider text-faint">NO DATA YET</p>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}
