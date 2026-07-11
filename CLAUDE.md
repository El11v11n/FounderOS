# Founder OS

Private life-and-business operating system for a single user (Laurenz).
PWA on iPad Pro, cloud data in Supabase, Telegram bot as universal inbox.

## Working agreement

- Explanations, questions and messages to the user: **German**.
- Code, comments, variable names, UI labels: **English** (user chose all-English UI).
- Ask open questions (max 8, German) before coding; build in phases; after every
  phase: commit → push → deploy → live URL + 3-line German summary for iPad testing.
- Boring, reliable solutions. Small dependency footprint. Never put secrets in code.
- Anything that can fail silently (webhook, cron) must log and surface in the
  "SYS // STATUS" footer (`components/system-status.tsx`).

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4 (tokens via `@theme` in `app/globals.css`)
- Supabase: Postgres + Auth (single user, email + password) + RLS ON
- Vercel hosting, auto-deploy from GitHub (`el11v11n/founderos`)
- PWA: `app/manifest.ts` + `public/sw.js` (no caching by design) + `public/apple-touch-icon.png`
- Anthropic API (small model) for capture classification (Phase 2+)
- Telegram Bot API via webhook → Vercel serverless route (Phase 3)
- Charts: Recharts (installed; see `components/sparkline.tsx` for the house style:
  2px accent line, faint gradient fill, zero baseline, hover tooltip, no axes on sparklines)

## Architecture

- `app/` — App Router pages. Modules: `/` (HOME), `/brain`, `/crm`, `/ventures`,
  `/finance`, `/calendar`, `/goals`, `/journal`.
- `components/` — shared UI (`card.tsx` = base card with "01 // LABEL" header,
  `top-nav.tsx`, `system-status.tsx`, `greeting.tsx`, `ui.tsx` = Delta/Meter/Tag/EmptyState,
  `sparkline.tsx`, `demo-toggle.tsx`).
- `components/home/` — one file per HOME card (operator, capture, tasks, habits,
  finance, calendar, goals). Grid breakpoints: `md` = 2 cols, `lg` = 4 cols
  (iPad landscape is 1194px — never use `xl` for iPad layouts!).
- `lib/env.ts` — feature/config detection (app must build & run without any env vars).
- `lib/supabase.ts` — browser client factory, returns `null` when unconfigured.
- `lib/demo-mode.tsx` — DemoModeProvider + useDemoMode (localStorage-backed).
- `lib/demo-data.ts` — all demo-mode sample data, only rendered when demo is ON.
- `scripts/generate-icons.mjs` — regenerates all PWA icons from inline SVG (`node scripts/generate-icons.mjs`).

## Design tokens (see `app/globals.css`)

- Background `#0a0b0c`, surface `#121416`, border `#1f2427`, text `#e8eae6`,
  muted `#8a9490`, faint `#5c6663`.
- Single accent: sage `#6ea482` (strong `#8fc4a3`, dim bg `--accent-dim`),
  negative `#c4756b` (text variant `--negative-strong` `#d9958c`).
- All status colors pass WCAG 4.5:1 on surface/background; deltas always ship
  arrow + sign so color is never the only channel.
- Fonts (next/font): Inter (sans/body), JetBrains Mono (numbers, module labels,
  console text), Instrument Serif italic (personal touches, greetings).
- Module labels: small mono caps, numbered — `01 // OPERATOR`, `02 // SESSION`, …
- DEMO ON/OFF toggle (in top nav since Phase 1): demo shows sample data, real mode
  shows user data or per-card empty states — never mixed.

## Env vars (names only — values live in Vercel / .env.local)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, Phase 3 webhook)
- `ANTHROPIC_API_KEY` (Phase 2+)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ALLOWED_CHAT_ID` (Phase 3)

## Database schema

None yet — Phase 2 introduces the full schema + migrations
(tasks, ideas, events, contacts, habits, goals, journal, transactions, captures).
Transactions must be provider-agnostic (Revolut CSV v1, GoCardless bank API v2,
no schema change between them).

## Telegram pipeline (Phase 3, the heart)

1. Webhook verifies `TELEGRAM_WEBHOOK_SECRET` + sender chat ID == `TELEGRAM_ALLOWED_CHAT_ID`; others ignored silently.
2. Voice → transcribe (Phase 4) → text; text → Anthropic classification → strict JSON
   `{type, title, details, date, time, amount, currency, contact_name, venture, tags, confidence}`.
3. `confidence < 0.6` → BRAIN inbox as "unsortiert" instead of guessing.
4. German confirmation reply + "undo" for the last capture.
5. Phase 5: daily 07:30 morning briefing via Vercel Cron.

## Phase roadmap

- **Phase 0 — Setup** ✅ scaffold, dark shell, nav, PWA installable, Supabase client stub, deployed.
- **Phase 1 — Core dashboard** ✅ HOME with all 7 cards (capture, operator, finance
  pulse + sparkline, today, habits, calendar, goals), demo-mode toggle, iPad responsive.
- **Phase 2 — Real data**: schema + migrations, auth (single user), CRUD for all modules, in-app Capture → classification pipeline.
- **Phase 3 — Telegram**: webhook 24/7, text capture classified + filed + confirmed + undo.
- **Phase 4 — Voice + Finance**: transcription (key TBD), expense capture, Revolut CSV import (mapping + dedupe), finance charts.
- **Phase 5 — Intelligence**: CRM follow-up flags, weekly review, morning briefing cron, polish (empty/loading/error states).

## User context (build around this)

- Café München (from Sept 2026, venture #1): countdown, milestones, later daily KPIs
  (revenue, guests, avg ticket, Wareneinsatz %, Personalkosten %).
- Hotel Österreich (father's 14-room hotel, testbed): occupancy %, ADR, ideas pipeline (BRAIN tag "Hotel").
- Holding (future): milestone tracker, activates when revenue exists.
- Valuable personal network → CRM follow-up cadence is a first-class feature.
- User keys available: Anthropic ✅, Telegram bot ✅. Voice/transcription key: none yet (text-only first).
