import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import {
  anthropicApiKey,
  anthropicKeyInfo,
  isSupabaseConfigured,
} from "@/lib/env";

export const runtime = "nodejs";
/**
 * Runtime truth for the SYS // STATUS footer.
 *
 * Why this route exists: every page in this app is statically prerendered.
 * When the footer read `process.env.ANTHROPIC_API_KEY` directly, that read
 * happened at *build* time and the answer was baked into the CDN HTML — so
 * the footer kept saying "AI OFF" after the key was added in Vercel (and
 * stayed OFF forever if the var is marked "Sensitive", since sensitive vars
 * are not exposed to the build at all). force-dynamic makes every request
 * re-read the real environment of the running function.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_VERSION = "0.3";
const APP_PHASE = 2;

type ProbeResult = {
  ok: boolean;
  message: string;
};

/** Cheapest possible live call — proves the key actually works. */
async function probeAnthropic(): Promise<ProbeResult> {
  try {
    await new Anthropic({ apiKey: anthropicApiKey() }).messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true, message: "Key accepted by the Anthropic API." };
  } catch (err) {
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status?: number }).status
        : undefined;
    const detail = err instanceof Error ? err.message : "Unknown error";
    if (status === 401) {
      return { ok: false, message: "401 — key rejected. Wrong or revoked key." };
    }
    if (status === 403) {
      return { ok: false, message: "403 — key has no access to this model." };
    }
    if (status === 429) {
      return { ok: false, message: "429 — rate limited, but the key is valid." };
    }
    console.error("[status] Anthropic probe failed:", detail);
    return {
      ok: false,
      message: status ? `${status} — ${detail}` : detail,
    };
  }
}

/** The probe costs API calls, so only a signed-in user may trigger it. */
async function isSignedIn(req: NextRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // no auth to check against yet
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return false;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data, error } = await supabase.auth.getUser();
  return !error && Boolean(data.user);
}

export async function GET(req: NextRequest) {
  const key = anthropicKeyInfo();

  // Explain *why* AI is off, so the footer never just says "OFF" again.
  let hint: string | null = null;
  if (!key.present) {
    hint =
      "ANTHROPIC_API_KEY is not set in this deployment. Add it in Vercel → " +
      "Settings → Environment Variables (Production + Preview), then redeploy.";
  } else if (key.hadWhitespace) {
    hint =
      "ANTHROPIC_API_KEY has leading/trailing whitespace — re-paste it without " +
      "the line break.";
  } else if (!key.prefixOk) {
    hint = 'ANTHROPIC_API_KEY does not start with "sk-ant-" — wrong value?';
  }

  let probe: ProbeResult | null = null;
  if (req.nextUrl.searchParams.get("probe") === "1" && key.present) {
    probe = (await isSignedIn(req))
      ? await probeAnthropic()
      : { ok: false, message: "Sign in to run the live key check." };
  }

  return NextResponse.json(
    {
      app: { version: APP_VERSION, phase: APP_PHASE },
      env: process.env.VERCEL_ENV ?? "local",
      db: { configured: isSupabaseConfigured() },
      ai: {
        configured: key.present,
        prefixOk: key.prefixOk,
        hadWhitespace: key.hadWhitespace,
        hint,
        probe,
      },
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
