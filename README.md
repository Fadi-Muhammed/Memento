# Memento

WhatsApp-first order management for tailoring shops. Customers message on WhatsApp; the bot qualifies leads and the owner manages orders from a mobile web dashboard.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Postgres, Auth, SSR)
- **Twilio** WhatsApp Business API
- **OpenRouter** LLM gateway (bot state machine)
- **Vercel** (hosting + cron)

## Setup

```bash
cp .env.example .env.local   # fill in all vars
npm install
npm run dev
```

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SHOP_ID`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `OPENROUTER_API_KEY`, `CRON_SECRET`.

## Database

```bash
psql $DATABASE_URL < db/schema.sql
```

## Tests

```bash
npm test
```
