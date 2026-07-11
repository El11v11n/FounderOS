/**
 * Sample data for demo mode. Realistic, built around the user's actual
 * ventures — but entirely fictional numbers. Never shown in real mode.
 */

export type DemoTask = {
  id: string;
  title: string;
  venture: "cafe" | "hotel" | "personal" | null;
  done: boolean;
};

export const demoTasks: DemoTask[] = [
  { id: "t1", title: "Review café lease draft with lawyer", venture: "cafe", done: false },
  { id: "t2", title: "Call coffee roaster — tasting appointment", venture: "cafe", done: false },
  { id: "t3", title: "Send hotel dynamic-pricing memo to Dad", venture: "hotel", done: true },
  { id: "t4", title: "Follow up: Markus (real estate) re: Schwabing", venture: null, done: false },
  { id: "t5", title: "Draft Q3 goals before Sunday review", venture: "personal", done: false },
];

export type DemoHabit = {
  id: string;
  label: string;
  done: boolean;
  /** Last 7 days, oldest first. */
  week: boolean[];
};

export const demoHabits: DemoHabit[] = [
  { id: "h1", label: "Gym", done: true, week: [true, false, true, true, false, true, true] },
  { id: "h2", label: "Deep Work", done: true, week: [true, true, true, false, true, true, true] },
  { id: "h3", label: "Reading", done: false, week: [true, true, false, true, true, false, false] },
  { id: "h4", label: "Sales Practice", done: false, week: [false, true, true, false, true, true, false] },
];

/** Weekly net cash flow, EUR, last 12 weeks (oldest first). */
export const demoFinanceTrend = [
  { week: "W16", net: 310 },
  { week: "W17", net: 240 },
  { week: "W18", net: -80 },
  { week: "W19", net: 420 },
  { week: "W20", net: 180 },
  { week: "W21", net: 260 },
  { week: "W22", net: -40 },
  { week: "W23", net: 390 },
  { week: "W24", net: 210 },
  { week: "W25", net: 480 },
  { week: "W26", net: 350 },
  { week: "W27", net: 520 },
];

export const demoFinance = {
  monthIncome: 2400,
  monthExpenses: 1850,
  deltaVsLastMonth: 0.12, // net, +12 %
};

export type DemoEvent = {
  id: string;
  day: "today" | "tomorrow";
  time: string;
  title: string;
  category: "BUSINESS" | "CAFÉ" | "HOTEL" | "PRIVATE";
};

export const demoEvents: DemoEvent[] = [
  { id: "e1", day: "today", time: "14:00", title: "Tax advisor — GmbH setup questions", category: "BUSINESS" },
  { id: "e2", day: "today", time: "18:30", title: "Gym — push day", category: "PRIVATE" },
  { id: "e3", day: "tomorrow", time: "10:00", title: "Café: supplier tasting (roastery)", category: "CAFÉ" },
  { id: "e4", day: "tomorrow", time: "16:00", title: "Call Dad — hotel occupancy review", category: "HOTEL" },
];

export type DemoGoal = {
  id: string;
  title: string;
  scope: "WEEK" | "MONTH" | "QUARTER";
  progress: number; // 0..1
};

export const demoGoals: DemoGoal[] = [
  { id: "g1", title: "Sign café agreement", scope: "QUARTER", progress: 0.7 },
  { id: "g2", title: "10 CRM follow-ups", scope: "WEEK", progress: 0.4 },
  { id: "g3", title: "Hotel: test dynamic pricing", scope: "MONTH", progress: 0.25 },
];

export const demoOperator = {
  name: "Laurenz",
  focus: "Building the foundation.",
  streakDays: 6,
};
