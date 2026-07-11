import { isSupabaseConfigured } from "@/lib/env";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        ok ? "bg-accent" : "bg-negative"
      }`}
    />
  );
}

/**
 * Footer status bar. Anything that can break silently (DB connection,
 * webhook, cron) gets surfaced here so problems are visible at a glance.
 */
export function SystemStatus() {
  const dbConfigured = isSupabaseConfigured();
  const env = process.env.VERCEL_ENV ?? "local";

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 font-mono text-[11px] tracking-wider text-faint sm:px-6 lg:px-8">
        <span className="text-muted">SYS // STATUS</span>
        <span className="flex items-center gap-1.5">
          <StatusDot ok />
          APP&nbsp;v0.2&nbsp;·&nbsp;PHASE&nbsp;1
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot ok={dbConfigured} />
          DB&nbsp;{dbConfigured ? "CONFIGURED" : "NOT CONFIGURED"}
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot ok />
          ENV&nbsp;{env.toUpperCase()}
        </span>
      </div>
    </footer>
  );
}
