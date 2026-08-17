/**
 * Central place to check which external services are configured.
 * Env var values never appear in code — only their names.
 *
 * IMPORTANT — why this matters for the status footer:
 * Server-only vars (ANTHROPIC_API_KEY) are read from `process.env` at the
 * moment the code runs. In a statically prerendered page that moment is
 * *build time*, so the result gets frozen into the HTML on the CDN. The
 * footer must therefore never render these flags from a static page — it
 * asks `/api/status` (force-dynamic) at runtime instead.
 */

/**
 * Client-safe: NEXT_PUBLIC_* vars are inlined into the bundle by Next.js,
 * so they must be referenced as literal `process.env.NEXT_PUBLIC_…`.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Server-only: the trimmed Anthropic key, or "" when unset.
 * Trimming matters — a trailing newline from copy/paste makes the SDK send a
 * broken auth header, which fails as a confusing 401 instead of "no key".
 */
export function anthropicApiKey(): string {
  const raw = process.env.ANTHROPIC_API_KEY;
  return typeof raw === "string" ? raw.trim() : "";
}

/** Server-only: capture classification available? (Phase 2+) */
export function isAnthropicConfigured(): boolean {
  return anthropicApiKey().length > 0;
}

export type AnthropicKeyInfo = {
  present: boolean;
  /** Whitespace around the pasted value — the classic silent-401 cause. */
  hadWhitespace: boolean;
  /** Anthropic keys start with "sk-ant-". Never expose more than this. */
  prefixOk: boolean;
  length: number;
};

/**
 * Server-only diagnostics for the SYS // STATUS footer. Returns shape
 * information only — never the key itself, not even partially.
 */
export function anthropicKeyInfo(): AnthropicKeyInfo {
  const raw = process.env.ANTHROPIC_API_KEY;
  const key = anthropicApiKey();
  return {
    present: key.length > 0,
    hadWhitespace: typeof raw === "string" && raw !== key,
    prefixOk: key.startsWith("sk-ant-"),
    length: key.length,
  };
}
