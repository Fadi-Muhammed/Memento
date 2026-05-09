-- Memento v1 — Dev seed data
-- Run AFTER schema.sql.
-- Fixed UUIDs so rows cross-reference cleanly without CTEs.
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING on unique columns.

-- ─────────────────────────────────────────────
-- IDs (hardcoded for readability in dev)
-- ─────────────────────────────────────────────
-- shop      : aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- customer1 : bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01
-- customer2 : bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02
-- lead1     : cccccccc-cccc-cccc-cccc-cccccccccc01  (qualified)
-- lead2     : cccccccc-cccc-cccc-cccc-cccccccccc02  (converted)
-- order1    : dddddddd-dddd-dddd-dddd-dddddddddd01  (stitched)

-- ─────────────────────────────────────────────
-- SHOP
-- ─────────────────────────────────────────────

INSERT INTO shops (id, name, owner_phone, whatsapp_business_number, bot_enabled)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Al Nasser Tailoring',
  '+97455100001',
  '+97455100002',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────

INSERT INTO customers (id, shop_id, phone, name, email, measurements, fabric_preferences, notes)
VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '+97450100001',
  'Ahmed Al Mansoori',
  'ahmed.almansoori@email.com',
  '{"chest": 42, "waist": 36, "sleeve": 26, "shoulder": 18, "length": 54}',
  'Summer wool, prefers white or cream thobes',
  'Returning customer since 2023. Pays promptly.'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '+97450100002',
  'Mohammed Al Kuwari',
  null,
  '{"chest": 40, "waist": 34, "sleeve": 25, "shoulder": 17, "length": 52}',
  'Cotton or linen, navy and charcoal suits',
  'First order. Came via Meta ad.'
)
ON CONFLICT (shop_id, phone) DO NOTHING;

-- ─────────────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────────────

-- Lead 1: qualified (active, waiting for owner to convert)
INSERT INTO leads (
  id, shop_id, customer_id, source,
  garment_type, fabric_pref, deadline, is_returning,
  status, raw_qualification,
  created_at, qualified_at,
  followup_stage, last_followup_sent_at, followup_paused
)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'meta_ad',
  'thobe',
  'summer wool, cream',
  'before Eid',
  true,
  'qualified',
  '{"garment_type": "thobe", "fabric_pref": "summer wool, cream", "deadline": "before Eid", "is_returning": "yes"}',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours 55 minutes',
  'sent_2h',
  NOW() - INTERVAL '55 minutes',
  false
);

-- Lead 2: converted (already became an order)
INSERT INTO leads (
  id, shop_id, customer_id, source,
  garment_type, fabric_pref, deadline, is_returning,
  status, raw_qualification,
  created_at, qualified_at,
  followup_stage, followup_paused
)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'meta_ad',
  'suit',
  'navy cotton',
  'next Thursday',
  false,
  'converted',
  '{"garment_type": "suit", "fabric_pref": "navy cotton", "deadline": "next Thursday", "is_returning": "no"}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  'done',
  false
);

-- ─────────────────────────────────────────────
-- FOLLOWUP EVENT (for lead 1's 2h followup)
-- ─────────────────────────────────────────────

INSERT INTO followup_events (id, lead_id, stage, channel, sent_at, status)
VALUES (
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  '2h',
  'freeform',
  NOW() - INTERVAL '55 minutes',
  'sent'
);

-- ─────────────────────────────────────────────
-- ORDER (from lead 2, currently at stitched stage)
-- ─────────────────────────────────────────────

INSERT INTO orders (
  id, shop_id, customer_id, lead_id,
  garment_type, fabric_details, agreed_price, deposit_paid,
  stage, promised_date, notes,
  created_at
)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'cccccccc-cccc-cccc-cccc-cccccccccc02',
  'suit',
  'Navy cotton, single-breasted, 2 buttons, slim fit',
  850,
  200,
  'stitched',
  CURRENT_DATE + INTERVAL '4 days',
  'Trouser break: slight. Customer prefers no cuff.',
  NOW() - INTERVAL '2 days'
);

-- ─────────────────────────────────────────────
-- STAGE EVENTS (history for the order above)
-- ─────────────────────────────────────────────

INSERT INTO stage_events (id, order_id, from_stage, to_stage, customer_notified, changed_at)
VALUES
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  null,
  'confirmed',
  true,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'confirmed',
  'cut',
  false,
  NOW() - INTERVAL '1 day 12 hours'
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddd01',
  'cut',
  'stitched',
  false,
  NOW() - INTERVAL '6 hours'
);

-- ─────────────────────────────────────────────
-- MESSAGES (mix of inbound/outbound for both customers)
-- ─────────────────────────────────────────────

INSERT INTO messages (id, shop_id, customer_id, direction, body, sender, whatsapp_message_id, created_at)
VALUES

-- Ahmed's conversation (lead 1)
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'in', 'Hi, I saw your ad and wanted to ask about a thobe',
  'customer', 'SM_seed_001',
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Hi! Thanks for reaching out to Al Nasser Tailoring. I''ll grab a few quick details so we can help you fast. What kind of garment are you looking for? (thobe, suit, uniform, alteration, or other)',
  'bot', 'SM_seed_002',
  NOW() - INTERVAL '2 hours 59 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'in', 'Thobe please',
  'customer', 'SM_seed_003',
  NOW() - INTERVAL '2 hours 58 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Got it — thobe. Any fabric preference, or should we suggest options? (e.g. cotton, wool, linen, or ''not sure'')',
  'bot', 'SM_seed_004',
  NOW() - INTERVAL '2 hours 57 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'in', 'Summer wool, cream colour',
  'customer', 'SM_seed_005',
  NOW() - INTERVAL '2 hours 56 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Noted. When do you need it by?',
  'bot', 'SM_seed_006',
  NOW() - INTERVAL '2 hours 55 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'in', 'Before Eid',
  'customer', 'SM_seed_007',
  NOW() - INTERVAL '2 hours 54 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Last one — have you ordered with us before? (yes / no)',
  'bot', 'SM_seed_008',
  NOW() - INTERVAL '2 hours 53 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'in', 'Yes, I have ordered before',
  'customer', 'SM_seed_009',
  NOW() - INTERVAL '2 hours 52 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Thanks! The owner will get back to you shortly with pricing and next steps.',
  'bot', 'SM_seed_010',
  NOW() - INTERVAL '2 hours 51 minutes'
),
-- 2h followup to Ahmed
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'out', 'Hi Ahmed! Just checking in — would you like to come by for measurements, or should we send pricing for the thobe?',
  'bot', 'SM_seed_011',
  NOW() - INTERVAL '55 minutes'
),

-- Mohammed's conversation (lead 2, now converted)
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'in', 'Hello I want to make a suit',
  'customer', 'SM_seed_012',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'out', 'Hi! Thanks for reaching out to Al Nasser Tailoring. I''ll grab a few quick details so we can help you fast. What kind of garment are you looking for? (thobe, suit, uniform, alteration, or other)',
  'bot', 'SM_seed_013',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'in', 'Suit',
  'customer', 'SM_seed_014',
  NOW() - INTERVAL '1 day 23 hours'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'out', 'Your order is confirmed. We''ll keep you updated as it progresses.',
  'bot', 'SM_seed_015',
  NOW() - INTERVAL '1 day 22 hours'
);
