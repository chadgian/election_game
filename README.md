# Election Command (Next.js)

Election Command is a mobile-friendly political strategy game with a war-room interface, animated game panels, operation cards, and country-aware election simulation.

## What’s new
- Full UI/UX rework into a game-style command console (not webpage-like).
- Modular frontend architecture with reusable components (`src/components/*`).
- Country selector with **USA default** and **global country roster**.
- Detailed election setup for **United States** and **Philippines**, with generic simulation templates for all other countries.
- Icons, animated transitions, risk-tagged operation cards, and mobile-first responsive layout.

## Game loop
1. Pick a country (USA default).
2. Each week choose one operation card.
3. Manage systems: momentum, trust, field power, narrative, scandal, energy.
4. Capture enough regional points by endgame to win.

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
