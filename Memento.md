# Memento — Product Specification (v1)

> A WhatsApp-first lead and order management system for tailoring shops in Qatar/GCC.
> v1 scope: capture leads, store searchable customer profiles, track order stages.
> Language: English only.
> First customer: a single tailoring shop in Doha.

---

## 1. One-Line Summary

Memento captures inbound WhatsApp leads from Meta ads, stores every customer as a searchable profile keyed by phone number, and tracks each order through fixed stages — automatically updating the customer at the meaningful stages.

## 2. Users

| Role | Description | Interaction Surface |
| --- | --- | --- |
| Owner | Shop owner. Single login. Sees everything, controls everything. | Web dashboard (mobile-first) + WhatsApp summaries to personal number |
| Customer | Person buying a garment. Never logs in. | WhatsApp only |
| Bot | LLM-driven WhatsApp responder. Greets, qualifies, notifies. | Inbound and outbound WhatsApp |

There is no "staff" role in v1. There is no admin panel for multiple shops in v1. Single-tenant.

## 3. Scope

### In Scope (v1)

1. **Inbound lead capture from Meta click-to-WhatsApp ads** with AI-driven qualification (4 questions).
2. **Customer profile** searchable by phone number, with measurements, fabric preferences, full message history, and order history.
3. **Order pipeline** with 6 stages and automatic customer notifications at 3 of them.
4. **Owner dashboard** (mobile-first web app, single login, magic-link auth).
5. **Owner WhatsApp summary** — when a new lead is qualified, the owner gets a clean summary message on his personal WhatsApp.
6. **Bot kill switch** — a toggle in the dashboard to instantly stop bot responses and route all inbound to the owner.
7. **Automated cold-lead follow-up sequences** — 2 hours, 24 hours, and 72 hours after qualification, if the lead has not been converted or marked lost. See section 7.5.

### Explicitly Out of Scope (v1)

- Arabic language. English only.
- Supplier credit / payable tracking.
- Invoice / receipt extraction.
- Google Sheets sync.
- Multi-shop / multi-tenant administration.
- Multiple staff users / role permissions.
- Customer-facing self-service portal.
- Payment processing.
- Analytics, charts, "insights."
- POS integration.
- E-commerce / website.
- Delivery tracking.

If a feature is not in section 3.1, it does not get built. Add to a `PHASE_2.md` file instead.

## 4. Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | Next.js 14 App Router + Tailwind + shadcn/ui | Mobile-first. Hosted on Vercel. |
| Backend | Next.js API routes | Same project. No separate service. |
| Database | Supabase (Postgres) | Free tier. Includes auth + realtime. |
| Auth | Supabase Auth, magic link | One user (the owner). |
| WhatsApp | Twilio (sandbox in dev, production number after Meta verification) | Migrate to 360Dialog later only if cost forces it. |
| LLM | OpenRouter (model selected at build time, configured via `LLM_MODEL` env var) | Single OpenAI-compatible endpoint. Model can be swapped without code changes. |
| Hosting | Vercel + Supabase | ~$0/mo until free tier exceeded. |
| Cron | Vercel Cron | Not needed in v1, available if needed. |

**Hard rules:**
- No n8n / Zapier / Make. Write code.
- No LangChain / LangGraph. Plain TypeScript + a small OpenRouter fetch wrapper.
- No vector DB. Postgres is enough.
- No tests beyond one smoke test for `webhook → DB` flow.
- No multi-tenancy logic. `shop_id` column on every table for forward compatibility, nothing more.

## 5. Data Model

Seven tables. Do not add an eighth in v1.

```sql
-- shops: single row in v1, schema-ready for many.
shops (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,            -- E.164, e.g. +97455555555
  whatsapp_business_number TEXT NOT NULL, -- the shop's WA Business number
  bot_enabled BOOLEAN DEFAULT TRUE,     -- the kill switch
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- customers: keyed by phone within a shop.
customers (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  phone TEXT NOT NULL,                   -- E.164
  name TEXT,
  email TEXT,
  measurements JSONB DEFAULT '{}',       -- free-form: { chest, waist, sleeve, ... }
  fabric_preferences TEXT,
  notes TEXT,
  first_contact_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ DEFAULT NOW(),
  lifetime_value NUMERIC DEFAULT 0,
  UNIQUE(shop_id, phone)
)

-- leads: one row per qualification attempt.
leads (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  customer_id UUID REFERENCES customers(id),
  source TEXT DEFAULT 'meta_ad',         -- meta_ad / walkin / referral / other
  garment_type TEXT,                     -- thobe / abaya / suit / uniform / alteration / other
  fabric_pref TEXT,
  deadline TEXT,                         -- free text: 'next thursday', '2 weeks', etc.
  is_returning BOOLEAN,
  status TEXT DEFAULT 'new',             -- new / qualifying / qualified / converted / lost
  raw_qualification JSONB DEFAULT '{}',  -- full bot Q&A capture
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,

  -- Follow-up tracking (see section 7.5)
  followup_stage TEXT DEFAULT 'none',    -- none / sent_2h / sent_24h / sent_72h / done
  last_followup_sent_at TIMESTAMPTZ,
  followup_paused BOOLEAN DEFAULT FALSE  -- owner manually paused, or customer replied
)

-- followup_events: audit log for every follow-up attempt.
followup_events (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  stage TEXT NOT NULL,                   -- 2h / 24h / 72h
  channel TEXT NOT NULL,                 -- freeform / template
  template_name TEXT,                    -- WhatsApp template name if used
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,                  -- sent / skipped_window_closed / skipped_paused / failed
  error TEXT
)

-- orders: created from a qualified lead, tracked through stages.
orders (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  customer_id UUID REFERENCES customers(id),
  lead_id UUID REFERENCES leads(id),
  garment_type TEXT NOT NULL,
  fabric_details TEXT,
  agreed_price NUMERIC,
  deposit_paid NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'confirmed',        -- see Stage Machine below
  promised_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
)

-- messages: every WhatsApp message in or out, for audit and UI.
messages (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  customer_id UUID REFERENCES customers(id),
  direction TEXT NOT NULL,               -- in / out
  body TEXT NOT NULL,
  sender TEXT NOT NULL,                  -- customer / bot / owner
  whatsapp_message_id TEXT UNIQUE,       -- Twilio MessageSid; deduplication
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- stage_events: audit log for order stage changes.
stage_events (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  customer_notified BOOLEAN DEFAULT FALSE,
  changed_at TIMESTAMPTZ DEFAULT NOW()
)
```

Indexes: `customers(shop_id, phone)`, `messages(customer_id, created_at DESC)`, `orders(shop_id, stage)`, `leads(shop_id, status)`, `leads(followup_stage, qualified_at)` (for the cron job to find due follow-ups efficiently).

## 6. The Stage Machine

Six stages. Forward-only by default. Owner can move backward via dashboard with a confirmation.

```
confirmed → cut → stitched → fitting → ready → picked_up
```

**Customer is auto-notified via WhatsApp** on transition into:
- `confirmed` — "Your order is confirmed. We'll keep you updated."
- `fitting` — "Your garment is ready for fitting. When can you come in?"
- `ready` — "Your order is ready for pickup."

No customer notification on `cut`, `stitched`, `picked_up`.

Each stage transition writes a row to `stage_events`. If the customer is notified, set `customer_notified = true`.

## 7. The Lead Bot — Conversation Spec

The bot is a **scripted state machine** with LLM assistance for understanding and replying. It is NOT a free-form agent.

### State machine

```
GREETING → ASK_GARMENT → ASK_FABRIC → ASK_DEADLINE → ASK_RETURNING → DONE
                                                                    ↓
                                                          notify owner, mark qualified
```

### Script (English, neutral tone)

| State | Bot message |
| --- | --- |
| `GREETING` | "Hi! Thanks for reaching out to [SHOP NAME]. I'll grab a few quick details so we can help you fast. What kind of garment are you looking for? (thobe, suit, uniform, alteration, or other)" |
| `ASK_FABRIC` | "Got it — [GARMENT]. Any fabric preference, or should we suggest options? (e.g. cotton, wool, linen, or 'not sure')" |
| `ASK_DEADLINE` | "Noted. When do you need it by?" |
| `ASK_RETURNING` | "Last one — have you ordered with us before? (yes / no)" |
| `DONE` | "Thanks! [SHOP_OWNER_NAME] will get back to you shortly with pricing and next steps." |

### LLM responsibilities

For each inbound customer message during qualification:
1. **Understand** the customer's free-text reply, even if it's not a clean answer.
2. **Extract** structured data — e.g. "tomorrow" → deadline = "tomorrow"; "I want a thobe please" → garment_type = "thobe".
3. **Generate** the next bot message based on current state.
4. **Return JSON** with: `{ extracted: {...}, reply: "...", confidence: 0-1, escalate: bool }`.

If `confidence < 0.6` or `escalate = true`, the bot replies "Let me get [SHOP_OWNER_NAME] to handle this directly — one moment." and pings the owner. Do not loop the bot trying to re-ask the same question.

### Hard rules

- Bot never quotes prices.
- Bot never confirms an order.
- Bot never says it is an AI.
- Bot ends after `DONE` state and does not respond to further messages until the owner takes over (or until a new inbound message starts a new lead conversation more than 24 hours later — in which case it greets again).
- If bot is disabled at the shop level (`shops.bot_enabled = false`), all inbound messages are logged and the owner is pinged, but no auto-reply is sent.

## 7.5 Cold-Lead Follow-up Sequences

After a lead reaches `qualified` status, Memento automatically re-engages the customer at three intervals if the lead has not converted to an order or been marked lost.

### Schedule

| Stage | Trigger | Window status | Channel |
| --- | --- | --- | --- |
| `2h` | 2 hours after `qualified_at` | Inside 24h window | Free-form WhatsApp message |
| `24h` | 24 hours after `qualified_at` | At edge of window — assume closed | WhatsApp template (`memento_followup_24h`) |
| `72h` | 72 hours after `qualified_at` | Outside window | WhatsApp template (`memento_followup_72h`) |

### Trigger conditions (all must be true)

A follow-up at stage `X` is sent only if:
1. `leads.status = 'qualified'` (not converted, not lost).
2. `leads.followup_stage` is the immediately preceding stage (e.g. `none` → can send `2h`; `sent_2h` → can send `24h`).
3. `leads.followup_paused = false`.
4. Time elapsed since `qualified_at` is ≥ the stage threshold.
5. The customer has not sent any new inbound message since `qualified_at` (any inbound message **pauses** the sequence — see below).
6. The owner has not manually replied to the customer since `qualified_at` (treat any outbound `sender = 'owner'` message in `messages` as a pause trigger).

### Pause / resume rules

- Any inbound customer message after `qualified_at` sets `followup_paused = true`. The sequence stops permanently for that lead.
- Any owner-side outbound message to that customer also sets `followup_paused = true`.
- The owner can manually re-pause / resume from the lead detail page. Resuming is allowed only if the lead is still `qualified`.
- Marking a lead `converted` or `lost` immediately terminates the sequence (set `followup_stage = 'done'`).

### Cron job

Implement at `/api/cron/followups` running every 15 minutes via Vercel Cron. The job:
1. Selects leads where `status = 'qualified'`, `followup_paused = false`, and `followup_stage` indicates a next stage is due based on elapsed time.
2. For each due lead, attempts to send the appropriate follow-up.
3. Inserts a `followup_events` row recording the outcome.
4. Updates `leads.followup_stage` and `leads.last_followup_sent_at` on success.

Run idempotently — if the job runs twice in a window, it must not double-send. Use `SELECT ... FOR UPDATE SKIP LOCKED` or check `last_followup_sent_at` strictly before sending.

### Message content

**Stage `2h` (free-form):**
> Hi [name]! Just checking in — would you like to come by for measurements, or should we send pricing for the [garment_type]?

**Stage `24h` template (`memento_followup_24h`, category UTILITY):**
> Hi {{1}}, following up on your [SHOP_NAME] enquiry about a {{2}}. Reply YES if you'd like to continue, or let us know if you've changed your mind.
>
> Variables: `{{1}}` = customer name or "there", `{{2}}` = garment_type.

**Stage `72h` template (`memento_followup_72h`, category MARKETING):**
> Hi {{1}}, last note from [SHOP_NAME] — we still have your enquiry about a {{2}} on file. If you'd like to proceed, just reply and we'll pick up where we left off.
>
> Variables: `{{1}}` = customer name or "there", `{{2}}` = garment_type.

### Template approval

Both templates must be submitted to Meta via the WhatsApp Business Platform before going live. Approval can take 1-3 days. Submit them in **week 1** of the build, not later. If a template is rejected, iterate copy and resubmit; do not skip to going live without approved templates — sending freeform outside the 24h window will fail and may flag the number.

### If a template is unavailable at send time

If a template send fails because no template is approved, the cron job:
- Skips the send.
- Inserts a `followup_events` row with `status = 'failed'` and `error` set.
- Does NOT advance `followup_stage` (so the cron will retry on the next tick).
- After 3 consecutive failures for the same lead/stage, marks the lead's `followup_paused = true` and surfaces the issue on the dashboard.

### Owner notification format

When a lead is qualified, send to `shops.owner_phone`:

```
🆕 New lead — [CUSTOMER_NAME or phone]
Garment: [garment_type]
Fabric: [fabric_pref]
Deadline: [deadline]
Returning: [yes/no]
View: https://memento.app/leads/[lead_id]
```

## 8. Owner Dashboard — Pages

Five pages. Mobile-first. Ugly is fine. Fast is mandatory.

### `/login`
Magic-link login via Supabase Auth. Email input → email → click link → in.

### `/` (Today)
Top of the funnel view:
- Count of new leads (last 24h).
- Count of orders due this week.
- Count of orders ready for pickup.
- Quick links to Leads, Orders, Customers.
- "Bot is ON / OFF" toggle.

### `/leads`
- List, sorted by `created_at DESC`, filterable by status (new / qualified / converted / lost).
- Each row: customer name (or phone), garment type, deadline, status, time ago.
- Tap a lead → lead detail page with full Q&A capture, customer info, "Convert to Order" button, "Mark Lost" button.

### `/customers`
- **Single search box at the top** — type a phone number (or part of one) → instant filter.
- List of all customers, sorted by `last_contact_at DESC`.
- Each row: phone, name, last contact, lifetime value.
- Tap a customer → customer profile.

### `/customers/[id]` — the searchable profile
The most important page. Three sections:

1. **Header**: name, phone, email (editable inline).
2. **Measurements + preferences**: editable JSON form (chest, waist, sleeve, shoulder, length, fabric_preferences, notes). Save button writes to `customers.measurements` and `customers.fabric_preferences`.
3. **Past orders**: list, each linking to order detail.
4. **Full message history**: chronological, in/out, with timestamps. Read-only.

### `/orders`
- Pipeline view. Either a Kanban-style 6-column board OR a filterable list — pick whichever is easier on mobile.
- Each card: customer name, garment type, agreed price, promised date, current stage.
- Tap a card → order detail.

### `/orders/[id]`
- Order info (editable: agreed price, fabric details, promised date, notes).
- **Big stage-advance button** — single tap moves to next stage.
- **Backward button** (with confirmation) — reverts a stage if needed.
- Stage history (from `stage_events`).
- Link to customer profile.

## 9. API Endpoints

Next.js API routes. All under `/api`.

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/twilio/webhook` | POST | Twilio inbound message webhook. Logs message, runs bot if applicable. |
| `/api/leads/[id]/convert` | POST | Convert a qualified lead into an order. Body: `{ garment_type, fabric_details, agreed_price, promised_date }`. |
| `/api/leads/[id]/lost` | POST | Mark a lead as lost. |
| `/api/orders/[id]/advance` | POST | Move order to next stage. Triggers customer notification if applicable. |
| `/api/orders/[id]/revert` | POST | Move order to previous stage. No customer notification. |
| `/api/orders/[id]` | PATCH | Update order fields (price, notes, promised_date, etc.). |
| `/api/customers/[id]` | PATCH | Update customer fields (name, email, measurements, fabric_preferences, notes). |
| `/api/shops/me/bot` | POST | Toggle `bot_enabled`. Body: `{ enabled: bool }`. |
| `/api/cron/followups` | GET (Vercel Cron) | Runs every 15 minutes. Sends due follow-ups. Idempotent. Auth via `CRON_SECRET` header. |
| `/api/leads/[id]/followup/pause` | POST | Owner manually pauses the follow-up sequence for a lead. |
| `/api/leads/[id]/followup/resume` | POST | Owner manually resumes a paused sequence (only if lead still `qualified`). |

All authenticated routes check Supabase session and validate `shop_id` scoping.

## 10. WhatsApp Integration — Twilio Specifics

### Inbound flow

Twilio sends a POST to `/api/twilio/webhook` for every inbound message. Payload includes `From`, `To`, `Body`, `MessageSid`.

1. Validate Twilio signature (use `validateRequest`).
2. Look up customer by `From` (E.164) within the shop. Create if not exists.
3. Insert into `messages` (idempotent on `whatsapp_message_id = MessageSid`).
4. If `shops.bot_enabled = false`, ping owner and stop.
5. If a lead exists for this customer with status in (`new`, `qualifying`), advance the lead bot state machine.
6. If no active lead, create a new `lead` row with status `qualifying`, state `GREETING`.
7. Compose bot reply via Claude Haiku.
8. Send reply via Twilio. Insert outbound row into `messages`.

### Outbound flow

Use Twilio's `messages.create` API. Always log outbound to `messages` table with the returned `MessageSid`.

For customer notifications on stage transitions: send a plain freeform WhatsApp message if the 24-hour window from the customer's last inbound is open. If the window has closed, the notification is skipped in v1 and a flag is set on `stage_events.customer_notified = false`. (v2 may add stage-update templates.)

### The 24-hour window (LOAD-BEARING for follow-ups)

WhatsApp Business API only allows free-form outbound messages within 24 hours of the customer's last inbound message. Outside that window, only **approved template messages (HSMs)** can be sent. This means:

- The `2h` follow-up is free-form (still inside the window).
- The `24h` and `72h` follow-ups require pre-approved templates. See section 7.5 for template content and submission requirements.
- Templates must be submitted to Meta in week 1 of the build because approval takes 1-3 days and is the slow gate, not the code.
- If a customer has been silent for >24h and the relevant template is not yet approved, the follow-up is skipped (logged in `followup_events`), not faked with a free-form message.

## 11. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENROUTER_API_KEY=
LLM_MODEL=                     # e.g. anthropic/claude-haiku-4.5 — set during build, can be swapped freely
LLM_BASE_URL=https://openrouter.ai/api/v1

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=        # e.g. whatsapp:+14155238886 (sandbox) then production

SHOP_ID=                       # the single shop UUID for v1
SHOP_OWNER_PHONE=              # owner's personal WhatsApp, E.164
SHOP_OWNER_NAME=               # used in bot copy
SHOP_NAME=                     # used in bot greeting

CRON_SECRET=                   # shared secret for /api/cron/* auth header
```

## 12. Project Structure

```
/app
  /(auth)
    /login/page.tsx
  /(owner)
    /layout.tsx              # auth guard + nav
    /page.tsx                # Today view
    /leads/page.tsx
    /leads/[id]/page.tsx
    /customers/page.tsx
    /customers/[id]/page.tsx
    /orders/page.tsx
    /orders/[id]/page.tsx
  /api
    /twilio/webhook/route.ts
    /leads/[id]/convert/route.ts
    /leads/[id]/lost/route.ts
    /leads/[id]/followup/pause/route.ts
    /leads/[id]/followup/resume/route.ts
    /orders/[id]/advance/route.ts
    /orders/[id]/revert/route.ts
    /orders/[id]/route.ts    # PATCH
    /customers/[id]/route.ts # PATCH
    /shops/me/bot/route.ts
    /cron/followups/route.ts # Vercel Cron entrypoint
/lib
  /supabase/server.ts
  /supabase/client.ts
  /twilio/client.ts
  /twilio/send.ts            # send freeform + send template
  /bot/state-machine.ts
  /bot/llm.ts                # OpenRouter wrapper (model from env / per-call)
  /bot/prompts.ts
  /followups/scheduler.ts    # cron logic: pick due leads, send, log
  /followups/templates.ts    # template names + variable shapes
  /notify/owner.ts           # owner WhatsApp summary
  /notify/customer.ts        # customer stage notifications
/db
  /schema.sql                # the 6 tables + indexes
  /seed.sql                  # dev seed data
```

## 13. Build Order (6 weeks)

### Week 1 — Plumbing + Template Submission
- Sign deal, deposit received.
- Start Meta Business verification (background).
- **Submit `memento_followup_24h` and `memento_followup_72h` templates to Meta for approval.** This is a slow gate — start it day 1.
- Twilio sandbox account, working webhook → Supabase row.
- Project skeleton, schema applied, magic-link auth working.
- OpenRouter account + `LLM_MODEL` configured.
- **Milestone**: a WhatsApp message you send to the Twilio sandbox appears as a row in `messages`. Templates submitted to Meta.

### Week 2 — Lead Bot
- Bot state machine in `/lib/bot/state-machine.ts`.
- Claude Haiku integration in `/lib/bot/llm.ts`.
- Outbound replies via Twilio.
- Customer auto-creation on first inbound.
- Owner notification on lead qualification.
- **Milestone**: end-to-end qualification flow works in sandbox; owner gets the summary.

### Week 3 — Customer Profile + Leads UI
- `/customers` list + search.
- `/customers/[id]` profile with measurements editor and message history.
- `/leads` list and lead detail page.
- "Convert to Order" flow.
- **Milestone**: from a real qualified lead, the owner can create an order in <30 seconds.

### Week 4 — Order Tracker + Customer Notifications + Follow-up Cron
- `/orders` pipeline view.
- Order detail with stage advance/revert.
- Customer notifications on `confirmed`, `fitting`, `ready`.
- Bot kill switch UI.
- Follow-up cron job at `/api/cron/followups` running every 15 minutes.
- Pause/resume buttons on lead detail page.
- Template send wrapper in `/lib/twilio/send.ts`.
- If templates are not yet approved, cron logs `skipped_template_pending` until they are; do not fake freeform sends.
- **Milestone**: full happy path works end-to-end on real data; 2h follow-up confirmed working in sandbox; 24h/72h gated only on Meta approval.

### Week 5 — Production Switch + Soft Launch
- Migrate from Twilio sandbox to production WhatsApp Business number (assumes Meta verification done).
- Walk owner through dashboard in person.
- 2-3 real customers through the system, supervised.
- Fix the disasters from real usage.

### Week 6 — Stabilize + Hand Off
- Daily monitoring + bug fixing.
- Get testimonial video.
- 1-page WhatsApp message documentation for the owner.
- Collect remaining 50% payment. Start retainer.

## 14. Acceptance Criteria — v1 is "done" when all of these are true

- [ ] A new customer messages the shop's WhatsApp Business number for the first time and receives a bot greeting within 10 seconds.
- [ ] After 4 qualifying questions, a `lead` row exists with all 4 fields populated and a corresponding `customer` row exists.
- [ ] Within 30 seconds of qualification, the owner receives a clean summary message on his personal WhatsApp.
- [ ] The owner can log into the dashboard via magic link on a phone, find any customer by typing part of a phone number, and see that customer's full profile and message history.
- [ ] The owner can convert a qualified lead into an order with one button + a price field.
- [ ] The owner can advance an order through all 6 stages from a phone, and the customer receives a WhatsApp message at `confirmed`, `fitting`, and `ready`.
- [ ] The owner can toggle the bot off, message the WhatsApp Business number, and the bot does NOT reply (but the message is logged and the owner is pinged).
- [ ] A qualified lead with no further activity receives a 2-hour follow-up message automatically.
- [ ] At 24 hours and 72 hours, the appropriate approved template is sent (or the attempt is logged as `skipped_template_pending` if templates are not yet approved by Meta).
- [ ] If the customer or owner sends any message to the lead after `qualified_at`, no further follow-ups are sent for that lead.
- [ ] If a lead is marked `converted` or `lost`, no further follow-ups are sent.
- [ ] The owner can manually pause and resume the follow-up sequence on a lead.
- [ ] No table beyond the 7 specified in section 5 has been added.
- [ ] No feature in section 3.2 (Out of Scope) has been built.

If any of these is false, v1 is not done. If a stretch feature has been built but an acceptance criterion is failing, the stretch feature was a mistake.

## 15. Failure Modes to Plan For

| Risk | Mitigation |
| --- | --- |
| Meta verification takes longer than 1 week | Buffer timeline; demo in Twilio sandbox to maintain momentum. |
| Bot says something embarrassing in front of customers | Kill switch in dashboard; low-confidence escalation to owner; log every bot reply for review. |
| Webhook duplicates / drops | Dedupe on `messages.whatsapp_message_id` (UNIQUE constraint). |
| 24-hour WhatsApp messaging window expires before stage notification | Skip notification, set `customer_notified = false`, surface in dashboard. v2 adds stage-update templates. |
| Follow-up templates rejected by Meta | Iterate copy, resubmit. Cron job logs `failed`/`skipped_template_pending` rows; nothing breaks. The 2h follow-up still works regardless. |
| Cron double-runs and double-sends a follow-up | Strict check on `last_followup_sent_at` before send; row-level locking via `SELECT ... FOR UPDATE SKIP LOCKED`; idempotency on `whatsapp_message_id`. |
| OpenRouter outage | Cron retries on next 15-minute tick. Bot replies degrade to a static "thanks, we'll be in touch shortly" if LLM call fails after 1 retry. |
| Owner stops checking dashboard | Daily WhatsApp summary brings him back. v2 feature; in v1, just the per-lead notification keeps him engaged. |
| Scope creep from owner | SOW is signed. Anything outside section 3.1 → `PHASE_2.md` → separate price. |

## 16. Things Claude Code Should NOT Do While Building

- Do not add Arabic localization.
- Do not add multi-tenant admin UI.
- Do not write unit tests beyond a single smoke test for the Twilio webhook and one for the follow-up cron's due-lead query.
- Do not introduce a state machine library, a workflow library, or a vector database.
- Do not create new tables beyond the 7 in section 5.
- Do not hardcode a specific LLM model in code — read from `LLM_MODEL` env var.
- Do not bypass the 24h window with freeform sends pretending to be templates. If a template isn't approved, log `skipped_template_pending` and move on.
- Do not add features marked as out of scope.
- Do not generate placeholder marketing copy, README badges, or "future roadmap" sections.
- Do not add comments explaining what well-named code already does.
- Do not write a CHANGELOG.md or CONTRIBUTING.md.
- Do not configure CI/CD pipelines or pre-commit hooks unless explicitly asked.

## 17. Naming and Branding

- Product name: **Memento**.
- Domain (placeholder): `memento.app` — replace with the real domain when registered.
- Tone in customer-facing copy: friendly, brief, professional. Never cute. Never apologetic.
- Tone in owner-facing copy (dashboard, summaries): direct, dense with information, no decoration.

---

*End of v1 specification. Anything not in this document is not in v1.*
