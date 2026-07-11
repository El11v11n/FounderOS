import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { isAnthropicConfigured, isSupabaseConfigured } from "@/lib/env";
import type { Classification } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Capture pipeline (same one Telegram will use in Phase 3):
 * text → classify (small model, strict JSON) → file into the right table.
 * confidence < 0.6 → stays in captures as "unsorted" instead of guessing.
 * Every capture is recorded in `captures` for audit + undo.
 */

const CONFIDENCE_THRESHOLD = 0.6;

const CLASSIFICATION_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["task", "idea", "event", "expense", "contact", "journal", "note"],
      description: "What kind of item this capture is",
    },
    title: { type: "string", description: "Short title, imperative for tasks" },
    details: { type: ["string", "null"], description: "Extra detail beyond the title" },
    date: { type: ["string", "null"], description: "YYYY-MM-DD if a date is mentioned" },
    time: { type: ["string", "null"], description: "HH:MM (24h) if a time is mentioned" },
    amount: { type: ["number", "null"], description: "Money amount for expenses, positive number" },
    currency: { type: ["string", "null"], description: "ISO currency code, e.g. EUR" },
    contact_name: { type: ["string", "null"], description: "Person's name if the capture is about a contact" },
    venture: {
      type: ["string", "null"],
      enum: ["cafe", "hotel", "holding", "personal", null],
      description: "cafe = Café München, hotel = Hotel Österreich (father's hotel)",
    },
    tags: { type: "array", items: { type: "string" } },
    confidence: { type: "number", description: "0..1 — how sure the classification is overall" },
  },
  required: [
    "type", "title", "details", "date", "time", "amount",
    "currency", "contact_name", "venture", "tags", "confidence",
  ],
  additionalProperties: false,
} as const;

function supabaseForToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

async function classify(text: string): Promise<Classification | null> {
  const anthropic = new Anthropic();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Berlin",
  }); // YYYY-MM-DD
  const weekday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Europe/Berlin",
  });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system:
        `You classify quick captures for a founder's personal operating system. ` +
        `Today is ${weekday}, ${today} (Europe/Berlin). Resolve relative dates ` +
        `("tomorrow", "Friday") to absolute YYYY-MM-DD. The user runs a café in ` +
        `Munich (venture "cafe") and helps with his father's hotel in Austria ` +
        `(venture "hotel"). Captures may be German or English; keep the title in ` +
        `the capture's language. Expenses: amount is the positive number spent. ` +
        `Use type "note" when nothing else fits. Set confidence below 0.6 when ` +
        `you are unsure how to classify.`,
      messages: [{ role: "user", content: text }],
      output_config: {
        format: {
          type: "json_schema",
          schema: CLASSIFICATION_SCHEMA,
        },
      },
    });

    if (response.stop_reason === "refusal") return null;
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return null;
    return JSON.parse(block.text) as Classification;
  } catch (err) {
    console.error("[capture] classification failed:", err);
    return null;
  }
}

type Filed = { table: string; id: string } | null;

async function fileItem(
  supabase: ReturnType<typeof supabaseForToken>,
  c: Classification
): Promise<Filed> {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });

  const insert = async (table: string, values: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from(table)
      .insert(values)
      .select("id")
      .single();
    if (error) {
      console.error(`[capture] insert into ${table} failed:`, error.message);
      return null;
    }
    return { table, id: data.id as string };
  };

  switch (c.type) {
    case "task":
      return insert("tasks", {
        title: c.title,
        details: c.details,
        venture: c.venture,
        due_date: c.date,
        source: "capture",
      });
    case "idea":
    case "note":
      return insert("ideas", {
        title: c.title,
        details: c.details,
        tags: c.tags,
        venture: c.venture,
        status: "inbox",
        source: "capture",
      });
    case "event":
      return insert("events", {
        title: c.title,
        details: c.details,
        event_date: c.date ?? today,
        event_time: c.time,
        category:
          c.venture === "cafe" ? "CAFÉ"
          : c.venture === "hotel" ? "HOTEL"
          : c.venture === "personal" ? "PRIVATE"
          : "BUSINESS",
        source: "capture",
      });
    case "expense":
      return insert("transactions", {
        booked_at: c.date ?? today,
        amount: -Math.abs(c.amount ?? 0),
        currency: c.currency ?? "EUR",
        description: c.title,
        venture: c.venture,
        category: c.tags[0] ?? null,
        source: "capture",
      });
    case "contact":
      return insert("contacts", {
        name: c.contact_name ?? c.title,
        notes: c.details,
        tags: c.tags,
        venture: c.venture,
      });
    case "journal":
      return insert("journal_entries", {
        entry_date: c.date ?? today,
        content: [c.title, c.details].filter(Boolean).join("\n\n"),
        source: "capture",
      });
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const supabase = supabaseForToken(token);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Empty capture" }, { status: 400 });
  }

  const classification = isAnthropicConfigured() ? await classify(text) : null;

  let filed: Filed = null;
  let status: "filed" | "unsorted" = "unsorted";
  if (classification && classification.confidence >= CONFIDENCE_THRESHOLD) {
    filed = await fileItem(supabase, classification);
    if (filed) status = "filed";
  }

  const { data: capture, error: captureError } = await supabase
    .from("captures")
    .insert({
      raw_text: text,
      source: "app",
      classified: classification,
      confidence: classification?.confidence ?? null,
      status,
      target_table: filed?.table ?? null,
      target_id: filed?.id ?? null,
    })
    .select("id")
    .single();
  if (captureError) {
    console.error("[capture] saving capture failed:", captureError.message);
    return NextResponse.json({ error: captureError.message }, { status: 500 });
  }

  return NextResponse.json({
    captureId: capture.id,
    status,
    type: classification?.type ?? null,
    title: classification?.title ?? text,
    confidence: classification?.confidence ?? null,
    aiAvailable: isAnthropicConfigured(),
  });
}

/** Undo: DELETE /api/capture?id=<captureId> removes the filed item again. */
export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = supabaseForToken(token);
  const { data: capture, error } = await supabase
    .from("captures")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !capture) {
    return NextResponse.json({ error: "Capture not found" }, { status: 404 });
  }

  if (capture.status === "filed" && capture.target_table && capture.target_id) {
    const { error: delError } = await supabase
      .from(capture.target_table)
      .delete()
      .eq("id", capture.target_id);
    if (delError) {
      console.error("[capture] undo delete failed:", delError.message);
      return NextResponse.json({ error: delError.message }, { status: 500 });
    }
  }

  const { error: updError } = await supabase
    .from("captures")
    .update({ status: "undone", target_table: null, target_id: null })
    .eq("id", id);
  if (updError) {
    return NextResponse.json({ error: updError.message }, { status: 500 });
  }

  return NextResponse.json({ undone: true });
}
