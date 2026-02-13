# Election Command (Next.js)

Election Command is a mobile-friendly political strategy game with a war-room interface, animated game panels, operation cards, and country-aware election simulation.

## What’s new
- Full UI/UX rework into a game-style command console (not webpage-like).
- Modular frontend architecture with reusable components (`src/components/*`).
- Country selector with **USA default** and **global country roster**.
- Detailed election setup for **United States** and **Philippines**, with generic simulation templates for all other countries.
- Icons, animated transitions, risk-tagged operation cards, and mobile-first responsive layout.
- **Multi-action weekly planning**: pick several campaign actions each week, then click **Proceed Week**.
- **Floating campaign analyst** that suggests stronger vote-building strategies in real time.

## Game loop
1. Pick a country (USA default).
2. Select up to 3 actions for the week (social media, field outreach, donor and policy strategies, etc.).
3. Click **Proceed Week** to execute your campaign plan.
4. Manage systems: momentum, trust, field power, narrative, scandal, energy.
5. Capture enough regional points by endgame to win.

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
