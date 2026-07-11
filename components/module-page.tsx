"use client";

import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useDemoMode } from "@/lib/demo-mode";
import { isSupabaseConfigured } from "@/lib/env";
import { Card } from "@/components/card";

/** Page heading shared by all module pages. */
export function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-serif text-3xl italic text-foreground">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

const FIELD_CLASSES =
  "rounded border border-border bg-background px-3 py-2 text-[15px] text-foreground " +
  "placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-50";

export function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${FIELD_CLASSES} ${props.className ?? ""}`} />;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="rounded bg-accent-dim px-4 py-2 font-mono text-xs tracking-wider text-accent-strong transition-colors hover:bg-accent/25 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-faint transition-colors ${
        danger ? "hover:text-negative-strong" : "hover:text-accent-strong"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Wraps a module page: demo mode and "no Supabase" get a consistent
 * notice instead of the real CRUD interface — demo data and real data
 * are never mixed.
 */
export function ModuleGate({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { demo } = useDemoMode();

  if (demo) {
    return (
      <Card label={label} className="mx-auto max-w-2xl">
        <p className="font-mono text-xs tracking-wider text-faint">DEMO ON</p>
        <p className="mt-2 text-sm text-muted">
          Demo mode shows sample data on HOME. Switch DEMO off in the top bar
          to manage your real data here.
        </p>
      </Card>
    );
  }
  if (!isSupabaseConfigured()) {
    return (
      <Card label={label} className="mx-auto max-w-2xl">
        <p className="font-mono text-xs tracking-wider text-faint">DB NOT CONFIGURED</p>
        <p className="mt-2 text-sm text-muted">
          Connect Supabase (env vars in Vercel) to manage real data.
        </p>
      </Card>
    );
  }
  return <>{children}</>;
}

export const VENTURE_OPTIONS = [
  { value: "", label: "No venture" },
  { value: "cafe", label: "Café München" },
  { value: "hotel", label: "Hotel Österreich" },
  { value: "holding", label: "Holding" },
  { value: "personal", label: "Personal" },
];

export const VENTURE_TAGS: Record<string, string> = {
  cafe: "CAFÉ",
  hotel: "HOTEL",
  holding: "HOLDING",
  personal: "PERSONAL",
};
