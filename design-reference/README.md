# Memento — UI Design Reference

This folder is the visual reference for the Memento v1 build. Use it as the source of truth for layout, hierarchy, density, color, type, and component composition. The spec is in `SPEC.md`.

## How to use

**Quick look (no build):** open `memento-ui-standalone.html` in any browser. Single self-contained file — works offline, no install.

**Editable source:** open `Memento UI.html`. Loads the JSX files from this folder via `<script type="text/babel">` (no bundler, no node_modules). React 18 + Babel from CDN.

Either way you'll land on a design canvas with **14 artboards** in 5 sections (Auth, Today, Leads, Customers, Orders), each at both mobile (390×780) and desktop (1280×800) widths. Drag artboards to reorder, click an arrow to focus fullscreen, ←/→ to step through, Esc to exit.

The **Tweaks panel** (top-right) toggles dark mode, density (compact / regular), and the desktop orders layout (Kanban / list).

## What's in here

| File | Purpose |
| --- | --- |
| `memento-ui-standalone.html` | One-file offline preview. Drop on any machine. |
| `Memento UI.html`            | Entry point. Wires the canvas, Tweaks panel, and all screens. |
| `tokens.css`                 | Design tokens. Single source of truth — light + dark themes, density. **Translate this to Tailwind config first.** |
| `atoms.jsx`                  | Shared atoms — `Sidebar`, `Topbar`, `BotNav`, `Avatar`, `Pill`, `StageChip`, `StageTracker`, sample data, icons. |
| `screens-mobile.jsx`         | All 8 mobile screens (390×780). |
| `screens-desktop.jsx`        | All 8 desktop screens (1280×800). |
| `design-canvas.jsx`          | Pan/zoom canvas — presentation only, not part of the app. |
| `tweaks-panel.jsx`           | Tweaks UI primitives — presentation only. |
| `HANDOFF.md`                 | Maps each screen to the spec route + behavior; checklist for Claude Code. |
| `SPEC.md`                    | Full v1 product spec. |

> The canvas + tweaks panel are **presentation chrome** for reviewing the design. They do not ship to the app. The actual UI is everything inside the artboards.

## Design system at a glance

**Aesthetic:** utilitarian, function-first (Linear / Superhuman territory). Dense, fast, no decoration. Owner-facing copy is direct; customer-facing WhatsApp copy is friendly and brief.

**Type:** system stack — `-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif`. Numerals + IDs use a mono stack (`ui-monospace, "JetBrains Mono", Menlo`). One italic serif accent on the wordmark only (`Georgia, serif italic`).

**Color:** warm off-white background (`#f0eee9`), near-black text (`#1a1a1a`), single accent `#0a7c5a` (deep green). Status colors: green = success, amber = warning / fitting, blue = bot. All defined as CSS custom properties in `tokens.css`. Dark mode is a class swap on `.mm`.

**Density:** controlled by `.mm.compact` — tightens row paddings and font sizes. Comfortable is the default.

**Stages:** `confirmed → cut → stitched → fitting → ready → picked_up`. Auto-notify on `confirmed`, `fitting`, `ready` only — visualized with a bell icon in trackers and on cards.

**Sample data:** Al-Khayyat Tailoring, Doha. Thobes, abayas, kanduras, agals, sherwanis. QAR pricing. GCC names (Ahmed Al-Mansoori, Khalid bin Hamad, Fatima Al-Thani, etc).

## When building the real app

The spec calls for **Next.js 14 App Router + Tailwind + shadcn/ui**. Recommended path:

1. Read `tokens.css` and translate to `tailwind.config.ts` — colors, radii, spacing scale, the two density variants. The values here are deliberate; don't substitute Tailwind defaults.
2. Treat the atoms in `atoms.jsx` as components to build, not to import. Names + props line up with what each screen consumes.
3. Use `screens-mobile.jsx` and `screens-desktop.jsx` as the layout reference for each route. The route map is in `HANDOFF.md`.
4. The follow-up sequence state (2h sent / 24h pending / 72h queued / paused) is visualized in the lead detail right rail — match it.
5. The 24h WhatsApp window countdown shows up on lead detail and order detail headers — that's a real piece of state from the spec, not decoration.

## What to ignore

- The pan/zoom canvas chrome.
- The Tweaks panel chrome.
- Inline `<svg>` icons in `atoms.jsx` — replace with `lucide-react` (search/plus/filter/bell/etc all map directly).
- Any sample data — the schema in `SPEC.md` § 5 is canonical.
