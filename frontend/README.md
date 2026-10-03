# FinLuxa Frontend (skeleton)

React + TypeScript + Vite + Tailwind v4 + Recharts. Scope of this phase: Sidebar, Header and the Home page (structure only).

    cd frontend
    npm install
    cp .env.example .env   # VITE_USE_MOCK=true uses built-in mock data
    FIGMA_TOKEN=<token> npm run assets:figma   # one-time: exports logo/icons from Figma into src/assets (commit them)
    npm run dev        # http://localhost:5173

`assets:figma` is read-only on Figma. Create the token in Figma: Settings > Security > Personal access tokens
(File content: read). PowerShell: `$env:FIGMA_TOKEN="<token>"; npm run assets:figma`.

## Structure
- `src/layout/` – AppShell, Sidebar, Header, nav items
- `src/pages/Home/` – HomePage + one component per card (`cards/`)
- `src/api/` – API client, `home.ts` (single data entry point), `mock/`
- `src/context/PeriodContext.tsx` – month/year from the Header date selector
- `src/types/home.ts` – data contract for Home (to be mirrored by FastAPI later)
- `src/lib/` – date and number helpers
- `src/assets/` – logo/icons exported from Figma (`npm run assets:figma`)
- `src/components/` – shared UI pieces (e.g. `MaskIcon`)
- `scripts/fetch-figma-assets.mjs` – Figma asset export

## Not done yet (by design)
- Styled so far: Sidebar, Header, page background (tokens in `src/index.css`). Cards, charts: next
- Saving Goal card (logic under review) – empty slot only
- Category colors & icons (to be decided)
- Date picker, Profile and Notification popups (Figma design not available yet)

## Pending confirmation
- Starting Balance definition (no balance data exists in the DB today)
- Budget Overview ordering (spending vs. % used) – currently % used
- Greeting rule (morning before 12:00 else evening, browser time) and username source
- Figma Home frame is now 1620 x 1080 in real pixels: component sizes are Figma values as-is
- Active state for nav items other than Home is not in Figma; icons are tinted via `MaskIcon` (assumes single-colour SVGs)
