# Election Command (Next.js)

Election Command is a mobile-friendly political strategy game with a war-room interface, animated game panels, operation cards, and country-aware election simulation.

## What’s new
- Full UI/UX rework into a game-style command console (not webpage-like).
- Modular frontend architecture with reusable components (`src/components/*`).
- Country selector with **USA default** and **global country roster**.
- Detailed election setup for **United States** and **Philippines**, with generic simulation templates for all other countries.
- Icons, animated transitions, risk-tagged operation cards, and mobile-first responsive layout.
- **Multi-page flow**:
  - `/` HQ dashboard
  - `/planning` weekly action planner
  - `/briefing` opposition and event briefing
  - `/tutorial` full walkthrough and scoring explanation
- **Multi-action weekly planning**: pick several campaign actions each week, then click **Proceed Week**.
- **Opposition AI actions + random weekly events** that impact score and region control.
- **Country + political party setup** (parties loaded from internet via Wikidata, with fallback lists).
- **Weekly media Q&A system**: random press questions, answer/ignore choice, AI-style scoring against opposition response, then impact applied in weekly results.
- **Floating campaign analyst** that reads current + previous week selections and can sometimes be wrong (can be hidden/shown).

## Game loop
1. Pick a country and party (USA default country).
2. Go to **Weekly Planning** and select up to 3 campaign actions.
3. Click **Proceed Week** to execute your plan and simulate opposition/event impacts.
4. Review opposition actions and weekly drift in **Briefing**.
5. Manage systems: momentum, trust, field power, narrative, scandal, energy.
6. Capture enough regional points by endgame to win.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```
