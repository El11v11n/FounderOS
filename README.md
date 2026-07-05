# Founder OS

Private life-and-business operating system. Single user. PWA on iPad Pro,
data in Supabase, Telegram bot as universal inbox.

See [CLAUDE.md](./CLAUDE.md) for architecture, design tokens, env vars and the
phase roadmap.

## Development

```bash
npm install
cp .env.example .env.local   # fill in values (never commit them)
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `node scripts/generate-icons.mjs` — regenerate PWA icons
