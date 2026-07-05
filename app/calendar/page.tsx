import { ModulePlaceholder } from "@/components/module-placeholder";

export default function CalendarPage() {
  return (
    <ModulePlaceholder
      label="07 // CALENDAR"
      title="The schedule."
      description="Week and day view, events captured via Telegram, colored by category. Tasks with deadlines appear on their day."
      phase={2}
    />
  );
}
