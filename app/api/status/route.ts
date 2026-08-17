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

/** Env vars this app cares about. Names only — values are never returned. */
const EXPECTED_VARS = [
  "ANTHROPIC_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_ALLOWED_CHAT_ID",
];

const WATCHED_PREFIX = /^(ANTHROPIC|SUPABASE|NEXT_PUBLIC_SUPABASE|TELEGRAM)/i;

/**
 * Which of our env var *names* actually exist in the running function.
 * This is what distinguishes "variable missing in this environment" from
 * "variable name has a typo" — the two look identical from the outside.
 */
function envDiagnostics() {
  const seen = Object.keys(process.env)
    .filter((name) => WATCHED_PREFIX.test(name))
    .sort();
  return {
    /** Names present at runtime, incl. typo'd ones we never read. */
    seen,
    missing: EXPECTED_VARS.filter((name) => !(name in process.env)),
    /** Present under a name we do not read → almost certainly a typo. */
    unexpected: seen.filter((name) => !EXPECTED_VARS.includes(name)),
  };
}

/** Which deployment is actually answering — Production or Preview? */
function deploymentInfo() {
  return {
    target: process.env.VERCEL_ENV ?? "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  };
}

export async function GET(req: NextRequest) {
  const key = anthropicKeyInfo();
  const envVars = envDiagnostics();
  const deployment = deploymentInfo();

  // Explain *why* AI is off, so the footer never just says "OFF" again.
  let hint: string | null = null;
  if (!key.present) {
    // Any unexpected ANTHROPIC_*/CLAUDE_* name is a likely misspelling of the
    // key (ANTHROPIC_KEY, ANTHROPIC_API_KEEY, …). Exclude the handful of names
    // that are legitimately something else, so this never cries wolf.
    const typo = envVars.unexpected.find(
      (n) =>
        /ANTHRO|CLAUDE/i.test(n) &&
        !/_(BASE_URL|MODEL|VERSION|TIMEOUT|LOG|LOG_LEVEL|PROXY|REGION)$/i.test(n)
    );
    if (typo) {
      hint = `Found "${typo}" but not ANTHROPIC_API_KEY — the variable name is misspelled in Vercel.`;
    } else if (deployment.target === "preview") {
      hint =
        `This is a PREVIEW deployment (branch ${deployment.branch ?? "?"}). ` +
        "Vercel only injects variables whose scope includes Preview — tick the " +
        "Preview box for ANTHROPIC_API_KEY, then redeploy this branch.";
    } else {
      hint =
        "ANTHROPIC_API_KEY is not in this deployment's environment. Vercel " +
        "snapshots variables when a deployment is created, so a variable added " +
        "later needs a fresh deploy (Deployments → ⋯ → Redeploy).";
    }
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

  // ?format=text — a page you can just open and read on the iPad, without
  // hunting for anything in the UI or parsing JSON.
  if (req.nextUrl.searchParams.get("format") === "text") {
    const lines = [
      "FOUNDER OS — STATUS",
      "",
      `RUNNING ON   ${deployment.target.toUpperCase()}` +
        (deployment.branch ? `  (branch: ${deployment.branch})` : "") +
        (deployment.commit ? `  (commit: ${deployment.commit})` : ""),
      `DATABASE     ${isSupabaseConfigured() ? "CONFIGURED" : "NOT CONFIGURED"}`,
      `AI KEY       ${key.present ? "FOUND" : "NOT FOUND"}`,
      "",
      "WHAT IS WRONG",
      `  ${hint ?? "Nothing — the Anthropic key is present and looks valid."}`,
      "",
      "ENV VARIABLES THIS DEPLOYMENT CAN SEE",
      ...(envVars.seen.length > 0
        ? envVars.seen.map((n) => `  ${n}`)
        : ["  (none)"]),
      "",
      "ENV VARIABLES THAT ARE MISSING",
      ...(envVars.missing.length > 0
        ? envVars.missing.map((n) => `  ${n}`)
        : ["  (none)"]),
      "",
      "Names only — no values are ever shown here, so this page is safe to share.",
      `Checked at ${new Date().toISOString()}`,
      "",
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    {
      app: { version: APP_VERSION, phase: APP_PHASE },
      env: deployment.target,
      deployment,
      envVars,
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
