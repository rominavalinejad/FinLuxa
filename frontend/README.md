# FinLuxa Frontend (skeleton)

React + TypeScript + Vite + Tailwind v4 + Recharts. Scope of this phase: Sidebar, Header and the Home page (structure only).

    cd frontend
    npm install
    npm run dev        # http://localhost:5173
    cp .env.example .env   # VITE_USE_MOCK=true uses built-in mock data

## Structure
- `src/layout/` – AppShell, Sidebar, Header, nav items
- `src/pages/Home/` – HomePage + one component per card (`cards/`)
- `src/api/` – API client, `home.ts` (single data entry point), `mock/`
- `src/context/PeriodContext.tsx` – month/year from the Header date selector
- `src/types/home.ts` – data contract for Home (to be mirrored by FastAPI later)
- `src/lib/` – date and number helpers

## Not done yet (by design)
- Visual styling / tokens / icons / charts (to come from Figma `get_design_context`)
- Saving Goal card (logic under review) – empty slot only
- Category colors & icons (to be decided)
- Date picker, Profile and Notification popups (Figma design not available yet)

## Pending confirmation
- Starting Balance definition (no balance data exists in the DB today)
- Budget Overview ordering (spending vs. % used) – currently % used
- Greeting rule (morning before 12:00 else evening, browser time) and username source
