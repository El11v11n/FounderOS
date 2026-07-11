"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase";
import { useAuth } from "./auth";
import { useDemoMode } from "./demo-mode";

/**
 * Read-only companion to useRows for cards that need a bespoke query
 * (date ranges, joins across tables). Runs only in real mode with a
 * session; returns null while loading or inactive.
 */
export function useQuery<T>(loader: (supabase: SupabaseClient) => Promise<T>) {
  const { demo } = useDemoMode();
  const { session } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Callers pass inline loaders; keep the latest one without re-triggering.
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const active = !demo && Boolean(session);

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    try {
      setData(await loaderRef.current(supabase));
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("[query] failed:", message);
    }
  }, []);

  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  return { data, error, reload: load, active };
}

/** YYYY-MM-DD in the user's local timezone. */
export function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA");
}
