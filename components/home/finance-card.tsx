"use client";

import { Card } from "@/components/card";
import { Sparkline } from "@/components/sparkline";
import { Delta, EmptyState } from "@/components/ui";
import { demoFinance, demoFinanceTrend } from "@/lib/demo-data";
import { useDemoMode } from "@/lib/demo-mode";

const eur = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 0 });

export function FinanceCard() {
  const { demo } = useDemoMode();
  const net = demoFinance.monthIncome - demoFinance.monthExpenses;

  return (
    <Card label="05 // FINANCE PULSE">
      {!demo ? (
        <EmptyState note="Transactions arrive in Phase 4 (Telegram capture + CSV import)." />
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-3xl text-foreground">
              {net >= 0 ? "+" : "−"}€{eur(Math.abs(net))}
            </p>
            <Delta value={demoFinance.deltaVsLastMonth} />
          </div>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-faint">
            NET THIS MONTH · VS LAST MONTH
          </p>
          <div className="mt-2">
            <Sparkline data={demoFinanceTrend} />
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs tracking-wider">
            <span className="text-muted">
              IN&nbsp;<span className="text-accent-strong">€{eur(demoFinance.monthIncome)}</span>
            </span>
            <span className="text-muted">
              OUT&nbsp;<span className="text-negative-strong">€{eur(demoFinance.monthExpenses)}</span>
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
