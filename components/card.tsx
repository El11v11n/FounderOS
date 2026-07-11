import type { ReactNode } from "react";

/**
 * Base card: subtle border, slight elevation, numbered monospace label
 * like "01 // OPERATOR".
 */
export function Card({
  label,
  children,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-surface p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_24px_-16px_rgba(0,0,0,0.8)] ${className}`}
    >
      {label && (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          {label}
        </p>
      )}
      {children}
    </section>
  );
}
