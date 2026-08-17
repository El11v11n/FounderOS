"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

type Probe = { ok: boolean; message: string };

type Status = {
  app: { version: string; phase: number };
  env: string;
  db: { configured: boolean };
  ai: {
    configured: boolean;
    prefixOk: boolean;
    hadWhitespace: boolean;
    hint: string | null;
    probe: Probe | null;
  };
};

/** `null` = still unknown; never show a red dot for "not checked yet". */
function StatusDot({ ok }: { ok: boolean | null }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        ok === null ? "bg-faint" : ok ? "bg-accent" : "bg-negative"
      }`}
    />
  );
}

/**
 * Footer status bar. Anything that can break silently (DB connection,
 * webhook, cron) gets surfaced here so problems are visible at a glance.
 *
 * The values come from `/api/status` at runtime, not from `process.env` in
 * this component: every page here is statically prerendered, so a direct
 * env read would be frozen into the CDN HTML at build time — that is what
 * made the footer show a stale "AI OFF" after the key was added in Vercel.
 */
export function SystemStatus() {
  const { session } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [unreachable, setUnreachable] = useState(false);
  const [probing, setProbing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const load = useCallback(async (probe: boolean, token?: string) => {
    const res = await fetch(`/api/status${probe ? "?probe=1" : ""}`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return (await res.json()) as Status;
  }, []);

  useEffect(() => {
    let active = true;
    load(false)
      .then((data) => active && setStatus(data))
      .catch(() => active && setUnreachable(true));
    return () => {
      active = false;
    };
  }, [load]);

  /** Live check: does the key actually work, or is it just present? */
  const runProbe = async () => {
    if (probing) return;
    setShowDetail(true);
    if (!status?.ai.configured) return; // hint already explains it
    setProbing(true);
    try {
      setStatus(await load(true, session?.access_token));
    } catch {
      setUnreachable(true);
    } finally {
      setProbing(false);
    }
  };

  const dbOk = status ? status.db.configured : null;
  const probe = status?.ai.probe ?? null;
  const aiOk = status ? (probe ? probe.ok : status.ai.configured) : null;
  const version = status?.app.version ?? "0.3";
  const phase = status?.app.phase ?? 2;
  const env = status?.env ?? "…";

  const aiLabel = probing
    ? "CHECKING…"
    : !status
      ? unreachable
        ? "UNKNOWN"
        : "…"
      : probe
        ? probe.ok
          ? "LIVE"
          : "ERROR"
        : status.ai.configured
          ? "READY"
          : "OFF";

  const detail = probe?.message ?? status?.ai.hint ?? null;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 font-mono text-[11px] tracking-wider text-faint sm:px-6 lg:px-8">
        <span className="text-muted">SYS // STATUS</span>
        <span className="flex items-center gap-1.5">
          <StatusDot ok={unreachable ? false : true} />
          APP&nbsp;v{version}&nbsp;·&nbsp;PHASE&nbsp;{phase}
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot ok={dbOk} />
          DB&nbsp;
          {dbOk === null ? "…" : dbOk ? "CONFIGURED" : "NOT CONFIGURED"}
        </span>
        <button
          type="button"
          onClick={runProbe}
          title="Check the Anthropic key live"
          className="flex items-center gap-1.5 rounded transition-colors hover:text-muted"
        >
          <StatusDot ok={aiOk} />
          AI&nbsp;{aiLabel}
        </button>
        <span className="flex items-center gap-1.5">
          <StatusDot ok={unreachable ? false : status ? true : null} />
          ENV&nbsp;{env.toUpperCase()}
        </span>
      </div>
      {showDetail && detail && (
        <div className="mx-auto max-w-7xl px-4 pb-2.5 sm:px-6 lg:px-8">
          <p
            className={`font-mono text-[11px] leading-relaxed tracking-wider ${
              probe?.ok ? "text-accent" : "text-negative-strong"
            }`}
          >
            {probe?.ok ? "✓" : "!"} {detail}
          </p>
        </div>
      )}
    </footer>
  );
}
