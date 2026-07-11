"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/card";
import { EmptyState, Tag } from "@/components/ui";
import {
  Field,
  GhostButton,
  ModuleGate,
  ModuleHeader,
  PrimaryButton,
  SelectField,
  VENTURE_OPTIONS,
  VENTURE_TAGS,
} from "@/components/module-page";
import { useRows } from "@/lib/use-rows";
import { localDate } from "@/lib/use-query";
import type { TransactionRow } from "@/lib/types";

const eur = (n: number) =>
  Math.abs(n).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Transactions() {
  const { rows, insert, remove } = useRows<TransactionRow>("transactions", {
    order: [
      { column: "booked_at", ascending: false },
      { column: "created_at", ascending: false },
    ],
    limit: 50,
  });
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(localDate());
  const [venture, setVenture] = useState("");

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!value || Number.isNaN(value)) return;
    const ok = await insert({
      booked_at: date,
      amount: kind === "expense" ? -Math.abs(value) : Math.abs(value),
      description: description.trim() || null,
      venture: venture || null,
      source: "manual",
    } as Partial<TransactionRow>);
    if (ok) {
      setAmount("");
      setDescription("");
    }
  };

  const thisMonth = localDate().slice(0, 7);
  const monthRows = (rows ?? []).filter((t) => t.booked_at.startsWith(thisMonth));
  const income = monthRows
    .filter((t) => t.amount >= 0)
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = monthRows
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <>
      <Card label="THIS MONTH">
        <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono">
          <div>
            <p className="text-[11px] tracking-wider text-faint">IN</p>
            <p className="text-2xl text-accent-strong">€{eur(income)}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-faint">OUT</p>
            <p className="text-2xl text-negative-strong">€{eur(expenses)}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wider text-faint">NET</p>
            <p className="text-2xl text-foreground">
              {income - expenses >= 0 ? "+" : "−"}€{eur(income - expenses)}
            </p>
          </div>
        </div>
      </Card>

      <Card label="NEW TRANSACTION">
        <form onSubmit={add} className="flex flex-wrap gap-3">
          <SelectField
            value={kind}
            onChange={(e) => setKind(e.target.value as "expense" | "income")}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </SelectField>
          <Field
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount €"
            inputMode="decimal"
            required
            className="w-28"
          />
          <Field
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="min-w-0 flex-1"
          />
          <Field
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40"
          />
          <SelectField value={venture} onChange={(e) => setVenture(e.target.value)}>
            {VENTURE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
          <PrimaryButton>ADD</PrimaryButton>
        </form>
        <p className="mt-3 font-mono text-[10px] tracking-wider text-faint">
          REVOLUT CSV IMPORT · COMING IN PHASE 4
        </p>
      </Card>

      <Card label="TRANSACTIONS">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : rows.length === 0 ? (
          <EmptyState note="No transactions yet — add one above or capture an expense." />
        ) : (
          <ul className="space-y-2">
            {rows.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5"
              >
                <span className="shrink-0 font-mono text-[13px] text-faint">
                  {t.booked_at}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                  {t.description ?? t.counterparty ?? "—"}
                </span>
                {t.venture && <Tag>{VENTURE_TAGS[t.venture]}</Tag>}
                <span
                  className={`shrink-0 font-mono text-[15px] ${
                    t.amount >= 0 ? "text-accent-strong" : "text-negative-strong"
                  }`}
                >
                  {t.amount >= 0 ? "+" : "−"}€{eur(Number(t.amount))}
                </span>
                <GhostButton danger onClick={() => remove(t.id)}>
                  DELETE
                </GhostButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The numbers."
        subtitle="Manual transactions now — Revolut CSV import and charts arrive in Phase 4."
      />
      <ModuleGate label="06 // FINANCE">
        <Transactions />
      </ModuleGate>
    </div>
  );
}
