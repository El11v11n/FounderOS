"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoToggle } from "@/components/demo-toggle";
import { useAuth } from "@/lib/auth";

const MODULES = [
  { href: "/", label: "HOME" },
  { href: "/brain", label: "BRAIN" },
  { href: "/crm", label: "CRM" },
  { href: "/ventures", label: "VENTURES" },
  { href: "/finance", label: "FINANCE" },
  { href: "/calendar", label: "CALENDAR" },
  { href: "/goals", label: "GOALS" },
  { href: "/journal", label: "JOURNAL" },
];

export function TopNav() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 py-3 font-mono text-sm tracking-widest text-foreground"
        >
          FOUNDER<span className="text-accent">_</span>OS
        </Link>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto py-2">
          {MODULES.map((mod) => {
            const active =
              mod.href === "/"
                ? pathname === "/"
                : pathname.startsWith(mod.href);
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`whitespace-nowrap rounded px-3 py-1.5 font-mono text-xs tracking-wider transition-colors ${
                  active
                    ? "bg-accent-dim text-accent-strong"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {mod.label}
              </Link>
            );
          })}
        </nav>
        <DemoToggle />
        {session && (
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded px-2 py-1.5 font-mono text-[10px] tracking-wider text-faint transition-colors hover:text-negative-strong"
            title="Sign out"
          >
            EXIT
          </button>
        )}
      </div>
    </header>
  );
}
