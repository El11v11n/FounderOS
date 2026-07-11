"use client";

import { Card } from "@/components/card";
import { Sparkline } from "@/components/sparkline";
import { Delta, EmptyState } from "@/components/ui";
import { demoFinance, demoFinanceTrend } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";
import { useQuery } from "@/lib/use-query";
import { isSupabaseConfigured } from "@/lib/env";
import type { TransactionRow } from "@/lib/types";

const eur = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 0 });

function PulseView({
  income,
  expenses,
  delta,
  trend,
}: {
  income: number;
  expenses: number;
  delta: number | null;
  trend: { week: string; net: number }[];
}) {
  const net = income - expenses;
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-3xl text-foreground">
          {net >= 0 ? "+" : "−"}€{eur(Math.abs(net))}
        </p>
        {delta !== null && <Delta value={delta} />}
      </div>
      <p className="mt-1 font-mono text-[11px] tracking-wider text-faint">
        NET THIS MONTH · VS LAST MONTH
      </p>
      <div className="mt-3">
        <Sparkline data={trend} />
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs tracking-wider">
        <span className="text-muted">
          IN&nbsp;<span className="text-accent-strong">€{eur(income)}</span>
        </span>
        <span className="text-muted">
          OUT&nbsp;<span className="text-negative-strong">€{eur(expenses)}</span>
        </span>
      </div>
    </>
  );
}

/** ISO week number, for sparkline labels like "W27". */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function RealFinance() {
  const { data } = useQuery(async (supabase) => {
    const since = new Date();
    since.setDate(since.getDate() - 7 * 12);
    since.setDate(1); // include full last month even if >12 weeks back
    const { data: rows, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("booked_at", since.toLocaleDateString("en-CA"))
      .order("booked_at");
    if (error) throw error;
    return rows as TransactionRow[];
  });

  if (!data) {
    return <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>;
  }
  if (data.length === 0) {
    return <EmptyState note="No transactions yet — capture an expense or add one on FINANCE." />;
  }

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  let income = 0;
  let expenses = 0;
  let netLast = 0;
  for (const t of data) {
    const month = t.booked_at.slice(0, 7);
    if (month === thisMonth) {
      if (t.amount >= 0) income += Number(t.amount);
      else expenses += Math.abs(Number(t.amount));
    } else if (month === lastMonth) {
      netLast += Number(t.amount);
    }
  }
  const netThis = income - expenses;
  const delta = netLast !== 0 ? (netThis - netLast) / Math.abs(netLast) : null;

  // Weekly net, last 12 weeks (oldest first)
  const trend: { week: string; net: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1 - i * 7); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const startKey = start.toLocaleDateString("en-CA");
    const endKey = end.toLocaleDateString("en-CA");
    const net = data
      .filter((t) => t.booked_at >= startKey && t.booked_at < endKey)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    trend.push({ week: `W${isoWeek(start)}`, net: Math.round(net) });
  }

  return <PulseView income={income} expenses={expenses} delta={delta} trend={trend} />;
}

export function FinanceCard() {
  const { demo } = useDemoMode();

  return (
    <Card label="05 // FINANCE PULSE">
      {demo ? (
        <PulseView
          income={demoFinance.monthIncome}
          expenses={demoFinance.monthExpenses}
          delta={demoFinance.deltaVsLastMonth}
          trend={demoFinanceTrend}
        />
      ) : isSupabaseConfigured() ? (
        <RealFinance />
      ) : (
        <EmptyState note="Connect Supabase to see the real pulse." />
      )}
    </Card>
  );
}
