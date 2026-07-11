"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Card } from "@/components/card";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) setError(err.message);
    setBusy(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card label="00 // ACCESS" className="w-full max-w-sm">
        <h1 className="font-serif text-2xl italic">Welcome back, Boss.</h1>
        <p className="mt-1 text-sm text-muted">
          Single-operator system. Sign in to continue.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded border border-border bg-background px-3 py-2 text-[15px] text-foreground placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded border border-border bg-background px-3 py-2 text-[15px] text-foreground placeholder:text-faint focus:border-accent focus:outline-none"
          />
          {error && (
            <p className="font-mono text-xs tracking-wider text-negative-strong">
              ✕ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-accent-dim px-4 py-2 font-mono text-xs tracking-wider text-accent-strong transition-colors hover:bg-accent/25 disabled:opacity-50"
          >
            {busy ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
      </Card>
    </div>
  );
}

/**
 * Blocks the app behind login once Supabase is configured.
 * Without Supabase (local dev, fresh deploy) the app stays open —
 * demo mode still works and real mode shows empty states.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth();

  if (!isSupabaseConfigured()) return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-mono text-xs tracking-widest text-faint">
          CHECKING SESSION…
        </p>
      </div>
    );
  }
  if (!session) return <LoginScreen />;
  return <>{children}</>;
}
