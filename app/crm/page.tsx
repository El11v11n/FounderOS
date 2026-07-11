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
import type { ContactRow } from "@/lib/types";

/** Follow-up due when last contact + cadence lies in the past (or never contacted). */
function followUpDue(contact: ContactRow): boolean {
  if (!contact.follow_up_days) return false;
  if (!contact.last_contacted_at) return true;
  const due = new Date(contact.last_contacted_at);
  due.setDate(due.getDate() + contact.follow_up_days);
  return due.toLocaleDateString("en-CA") <= localDate();
}

function Contacts() {
  const { rows, insert, update, remove } = useRows<ContactRow>("contacts", {
    order: [{ column: "name", ascending: true }],
  });
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [venture, setVenture] = useState("");
  const [cadence, setCadence] = useState("");

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await insert({
      name: name.trim(),
      company: company.trim() || null,
      role: role.trim() || null,
      venture: venture || null,
      follow_up_days: cadence ? Number(cadence) : null,
    } as Partial<ContactRow>);
    if (ok) {
      setName("");
      setCompany("");
      setRole("");
      setVenture("");
      setCadence("");
    }
  };

  const touch = (contact: ContactRow) =>
    update(contact.id, { last_contacted_at: localDate() } as Partial<ContactRow>);

  const due = (rows ?? []).filter(followUpDue);

  return (
    <>
      <Card label="NEW CONTACT">
        <form onSubmit={add} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Field
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="min-w-0 flex-1"
            />
            <Field
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="min-w-0 flex-1"
            />
            <Field
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className="min-w-0 flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <SelectField value={venture} onChange={(e) => setVenture(e.target.value)}>
              {VENTURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
            <SelectField value={cadence} onChange={(e) => setCadence(e.target.value)}>
              <option value="">No follow-up cadence</option>
              <option value="7">Follow up weekly</option>
              <option value="14">Every 2 weeks</option>
              <option value="30">Monthly</option>
              <option value="90">Quarterly</option>
            </SelectField>
            <PrimaryButton>ADD CONTACT</PrimaryButton>
          </div>
        </form>
      </Card>

      {due.length > 0 && (
        <Card label="FOLLOW-UP DUE">
          <ul className="space-y-2">
            {due.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">
                  {contact.name}
                </span>
                <span className="font-mono text-[11px] tracking-wider text-negative-strong">
                  {contact.last_contacted_at
                    ? `LAST ${contact.last_contacted_at}`
                    : "NEVER CONTACTED"}
                </span>
                <GhostButton onClick={() => touch(contact)}>TOUCHED TODAY</GhostButton>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card label="CONTACTS">
        {rows === null ? (
          <p className="font-mono text-xs tracking-wider text-faint">LOADING…</p>
        ) : rows.length === 0 ? (
          <EmptyState note="No contacts yet — your network goes here." />
        ) : (
          <ul className="space-y-2">
            {rows.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center gap-3 rounded border border-border bg-surface-raised px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-foreground">{contact.name}</p>
                  <p className="truncate text-sm text-muted">
                    {[contact.role, contact.company].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                {contact.venture && <Tag>{VENTURE_TAGS[contact.venture]}</Tag>}
                <span className="hidden font-mono text-[11px] tracking-wider text-faint sm:inline">
                  {contact.last_contacted_at
                    ? `LAST ${contact.last_contacted_at}`
                    : "NEW"}
                </span>
                <GhostButton onClick={() => touch(contact)}>TOUCH</GhostButton>
                <GhostButton danger onClick={() => remove(contact.id)}>
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

export default function CrmPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <ModuleHeader
        title="The network."
        subtitle="Contacts with a follow-up cadence — relationships are a first-class asset."
      />
      <ModuleGate label="04 // CRM">
        <Contacts />
      </ModuleGate>
    </div>
  );
}
