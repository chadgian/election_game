# Election Command (Node.js + Next.js)

A turn-based political strategy game inspired by the intensity of **The Political Machine**, **270**, and modern campaign war-room sims.

## Core game pillars
- **Doctrine-based runs**: each campaign starts with a strategic archetype that changes your strengths/weaknesses.
- **Operation card gameplay**: every week, pick one operation card from a tactical deck with different risk/cost profiles.
- **Electoral theater map**: regions have EV value, volatility, turnout, heat, and field-office impact.
- **Narrative warfare**: media control, momentum edge, and opponent pressure influence map projections.
- **High-risk politics**: dark operations can spike gains but trigger delayed scandals and backlash.
- **Campaign systems**: funds, field power, fatigue, alliance loyalty, ethics, and legal heat all matter.

## Campaign Rules
1. A full run lasts 10 weeks.
2. You choose one operation card each week.
3. Cards affect demographics, regions, and national systems.
4. Reach **270+ Electoral Votes** by endgame to win.
5. If you rely heavily on risky operations, expect delayed consequences.

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Production build
```bash
npm run build
npm run start
```

## Deploy to Vercel
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import it into Vercel.
3. Vercel auto-detects Next.js.
4. Deploy.

Vercel settings are included via `vercel.json`.
