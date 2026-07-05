import { Card } from "@/components/card";

/**
 * Placeholder screen for modules that go live in later phases.
 */
export function ModulePlaceholder({
  label,
  title,
  description,
  phase,
}: {
  label: string;
  title: string;
  description: string;
  phase: number;
}) {
  return (
    <Card label={label} className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl italic">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <p className="mt-6 font-mono text-xs tracking-wider text-faint">
        ○ COMING IN PHASE {phase}
      </p>
    </Card>
  );
}
