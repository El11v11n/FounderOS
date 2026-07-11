import { Greeting } from "@/components/greeting";
import { CaptureCard } from "@/components/home/capture-card";
import { OperatorCard } from "@/components/home/operator-card";
import { FinanceCard } from "@/components/home/finance-card";
import { TasksCard } from "@/components/home/tasks-card";
import { HabitsCard } from "@/components/home/habits-card";
import { CalendarCard } from "@/components/home/calendar-card";
import { GoalsCard } from "@/components/home/goals-card";

export default function Home() {
  return (
    <div className="space-y-4">
      <Greeting />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CaptureCard />
        <OperatorCard />
        <FinanceCard />
        <TasksCard />
        <HabitsCard />
        <CalendarCard />
        <GoalsCard />
      </div>
    </div>
  );
}
