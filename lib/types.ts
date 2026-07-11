/**
 * Row types for all Phase 2 tables. Keep in sync with
 * supabase/migrations/001_phase2_schema.sql.
 */

export type Venture = "cafe" | "hotel" | "holding" | "personal";

export type TaskRow = {
  id: string;
  title: string;
  details: string | null;
  venture: string | null;
  due_date: string | null;
  done: boolean;
  done_at: string | null;
  source: string;
  created_at: string;
};

export type IdeaRow = {
  id: string;
  title: string;
  details: string | null;
  tags: string[];
  venture: string | null;
  status: "inbox" | "active" | "archived";
  source: string;
  created_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  details: string | null;
  event_date: string;
  event_time: string | null;
  category: string;
  source: string;
  created_at: string;
};

export type ContactRow = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  venture: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  follow_up_days: number | null;
  created_at: string;
};

export type HabitRow = {
  id: string;
  label: string;
  position: number;
  archived: boolean;
};

export type HabitCheckRow = {
  id: string;
  habit_id: string;
  check_date: string;
};

export type GoalRow = {
  id: string;
  title: string;
  scope: "WEEK" | "MONTH" | "QUARTER";
  progress: number;
  done: boolean;
  target_date: string | null;
  created_at: string;
};

export type JournalRow = {
  id: string;
  entry_date: string;
  content: string;
  source: string;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  booked_at: string;
  amount: number;
  currency: string;
  description: string | null;
  counterparty: string | null;
  category: string | null;
  venture: string | null;
  source: string;
  external_id: string | null;
  created_at: string;
};

export type CaptureRow = {
  id: string;
  raw_text: string;
  source: string;
  classified: Record<string, unknown> | null;
  confidence: number | null;
  status: "unsorted" | "filed" | "undone";
  target_table: string | null;
  target_id: string | null;
  created_at: string;
};

/** Strict shape the classification model must return (see /api/capture). */
export type Classification = {
  type: "task" | "idea" | "event" | "expense" | "contact" | "journal" | "note";
  title: string;
  details: string | null;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:MM
  amount: number | null;
  currency: string | null;
  contact_name: string | null;
  venture: Venture | null;
  tags: string[];
  confidence: number; // 0..1
};
