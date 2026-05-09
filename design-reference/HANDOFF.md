# Handoff — Design → Code

Each screen in the design canvas maps to a route from `SPEC.md` § 8 and § 9. Build in this order; it matches the spec's week-by-week build plan.

## Route map

| Spec route | Mobile artboard | Desktop artboard | Source |
| --- | --- | --- | --- |
| `/login`              | Mobile · Login     | Desktop · Login     | `screens-*.jsx` → `MobileLogin` / `DesktopLogin` |
| `/` (Today)           | Mobile · Today     | Desktop · Today     | `MobileToday` / `DesktopToday` |
| `/leads`              | Mobile · List      | Desktop · List      | `MobileLeads` / `DesktopLeads` |
| `/leads/[id]`         | Mobile · Detail    | Desktop · Detail    | `MobileLeadDetail` / `DesktopLeadDetail` |
| `/customers`          | Mobile · List      | Desktop · List      | `MobileCustomers` / `DesktopCustomers` |
| `/customers/[id]`     | Mobile · Profile   | Desktop · Profile   | `MobileCustomerProfile` / `DesktopCustomerProfile` |
| `/orders`             | Mobile · Pipeline  | Desktop · Pipeline  | `MobileOrders` / `DesktopOrders` (Kanban) + `DesktopOrdersList` |
| `/orders/[id]`        | Mobile · Detail    | Desktop · Detail    | `MobileOrderDetail` / `DesktopOrderDetail` |

## Components to build (in this order)

1. **Tokens** — port `tokens.css` to `tailwind.config.ts` and a `globals.css`. Verify dark mode + compact density both work via class on `<html>` or `<body>`.
2. **Layout primitives** — `<Sidebar>`, `<Topbar>`, `<BotNav>` (mobile), responsive `<Shell>`.
3. **Display primitives** — `<Avatar>`, `<Pill>`, `<StageChip>`, `<StageTracker>`, `<KV>` row, `<Activity>` item.
4. **Screens** — one route at a time, mobile first, then desktop. Each artboard is an exact spec.

## Spec details that the design encodes

These are **load-bearing** — match them, don't re-interpret:

- **Stage tracker** shows all 6 stages with the 3 auto-notify stages (`confirmed`, `fitting`, `ready`) marked by a bell. Current stage is filled; past stages are dim; future stages are outlined.
- **Lead detail right rail** shows the follow-up sequence visually:
  - `2h` — green check if sent, with timestamp
  - `24h` — current state (pending / sent / template-pending-approval)
  - `72h` — queued time
  - Pause/resume button visible when in `qualified` state
- **Lead detail center** is the WhatsApp transcript with the bot Q&A turns labeled (`bot` / `customer` / `owner`). The `extracted` JSON from each bot turn is shown collapsed by default — it's debug-grade info but the owner asks for it once a week.
- **24h window meter** appears in the header of any screen that involves an outbound message (lead detail, order detail). Shows time remaining, dims when expired.
- **Bot kill switch** lives on the Today screen as a card-level toggle, not buried in settings. Color flips to red when off.
- **Owner WhatsApp summary** is not a UI surface; it's a Twilio outbound. The format is in `SPEC.md` § 7.5 → "Owner notification format".

## What's intentionally not in the design

- **Settings page** — there's no `/settings` route in v1. Bot toggle is on Today. Shop name/owner phone come from env.
- **Multi-tenant switcher** — single shop in v1.
- **Customer self-service** — customers never log in. Their only surface is WhatsApp.
- **Charts / analytics / "insights"** — out of scope per `SPEC.md` § 3.2.
- **Arabic** — out of scope. English only.

## Real-time

- `messages` table updates on the customer profile and lead detail use Supabase Realtime. The transcript should append without a refresh when a new message lands.
- Stage advance on `/orders/[id]` should optimistically update the tracker, then reconcile with the server.

## Tech stack reminder (from `SPEC.md` § 4)

- Next.js 14 App Router · Tailwind · shadcn/ui
- Supabase (Postgres + Auth + Realtime)
- Twilio for WhatsApp (sandbox → production)
- OpenRouter for the LLM (`LLM_MODEL` env var, swappable)
- Vercel hosting + Vercel Cron for the follow-up job

No state-machine library, no LangChain, no vector DB, no Zapier. Plain TypeScript.

## Acceptance

Build is "done" when the checklist in `SPEC.md` § 14 passes. Don't add anything not on it.
