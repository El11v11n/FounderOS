"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./supabase";
import { useAuth } from "./auth";
import { useDemoMode } from "./demo-mode";

type Order = { column: string; ascending?: boolean };

/**
 * Small CRUD hook every module shares. Loads rows once (and after each
 * mutation) — boring and reliable beats clever caching at this scale.
 * Only active in real mode with a signed-in session.
 */
export function useRows<T extends { id: string }>(
  table: string,
  options: { order?: Order[]; limit?: number } = {}
) {
  const { demo } = useDemoMode();
  const { session } = useAuth();
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = !demo && Boolean(session);
  // Stable dependency for the load effect; options are static per call site.
  const orderKey = JSON.stringify(options.order ?? []);

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let query = supabase.from(table).select("*");
    for (const o of options.order ?? []) {
      query = query.order(o.column, { ascending: o.ascending ?? true });
    }
    if (options.limit) query = query.limit(options.limit);
    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      console.error(`[${table}] load failed:`, err.message);
    } else {
      setRows(data as T[]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderKey, options.limit]);

  useEffect(() => {
    // Data fetching: state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) void load();
  }, [active, load]);

  const insert = async (values: Partial<T>) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    // Untyped client (no generated DB types yet) — cast keeps call sites typed.
    const { error: err } = await supabase.from(table).insert(values as never);
    if (err) {
      setError(err.message);
      console.error(`[${table}] insert failed:`, err.message);
      return false;
    }
    await load();
    return true;
  };

  const update = async (id: string, values: Partial<T>) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error: err } = await supabase
      .from(table)
      .update(values as never)
      .eq("id", id);
    if (err) {
      setError(err.message);
      console.error(`[${table}] update failed:`, err.message);
      return false;
    }
    await load();
    return true;
  };

  const remove = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (err) {
      setError(err.message);
      console.error(`[${table}] delete failed:`, err.message);
      return false;
    }
    await load();
    return true;
  };

  return { rows, error, loading: active && rows === null, insert, update, remove, reload: load };
}
