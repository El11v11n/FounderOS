import { Card } from "@/components/card";
import { Greeting } from "@/components/greeting";

const PHASES = [
  { id: 0, name: "SETUP", detail: "Scaffold · PWA · Supabase", status: "live" },
  { id: 1, name: "DASHBOARD", detail: "Design system · HOME cards", status: "next" },
  { id: 2, name: "REAL DATA", detail: "Schema · Auth · CRUD · Capture", status: "planned" },
  { id: 3, name: "TELEGRAM", detail: "Webhook · Classify · Undo", status: "planned" },
  { id: 4, name: "VOICE + FINANCE", detail: "Transcription · CSV import", status: "planned" },
  { id: 5, name: "INTELLIGENCE", detail: "Follow-ups · Review · Briefing", status: "planned" },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <Greeting />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card label="01 // OPERATOR">
          <p className="text-lg font-medium">Laurenz</p>
          <p className="mt-1 font-serif text-xl italic text-muted">
            Building the foundation.
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs tracking-wider">
            <span className="rounded bg-accent-dim px-2 py-1 text-accent-strong">
              PHASE 0 — DEPLOYED
            </span>
          </div>
        </Card>

        <Card label="02 // SYSTEM ROADMAP" className="md:col-span-1 xl:col-span-2">
          <ul className="space-y-2">
            {PHASES.map((phase) => (
              <li
                key={phase.id}
                className="flex items-center gap-3 font-mono text-xs tracking-wider"
              >
                <span
                  className={`shrink-0 whitespace-nowrap ${
                    phase.status === "live"
                      ? "text-accent"
                      : phase.status === "next"
                        ? "text-foreground"
                        : "text-faint"
                  }`}
                >
                  {phase.status === "live" ? "●" : "○"} P{phase.id}
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap ${
                    phase.status === "planned" ? "text-faint" : "text-foreground"
                  }`}
                >
                  {phase.name}
                </span>
                <span className="hidden min-w-0 truncate text-faint sm:inline">
                  {phase.detail}
                </span>
                {phase.status === "live" && (
                  <span className="ml-auto shrink-0 text-accent">LIVE</span>
                )}
                {phase.status === "next" && (
                  <span className="ml-auto shrink-0 whitespace-nowrap text-muted">
                    UP NEXT
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="pt-2 text-center font-mono text-[11px] tracking-wider text-faint">
        MODULES — BRAIN · CRM · VENTURES · FINANCE · CALENDAR · GOALS · JOURNAL
        — GO LIVE IN PHASE 1–2
      </p>
    </div>
  );
}
