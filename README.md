# Election Game (Node.js + Next.js)

A turn-based election simulation web app inspired by **The Political Machine** and **270-style electoral strategy**.

## Gameplay highlights
- 10-week campaign with high-stakes weekly decisions.
- 50-option contextual strategy pools (3–5 shown each week).
- Electoral map projection with regional EV control and momentum-adjusted support.
- Demographic sentiment and loyalty tracking.
- Opponent momentum pressure, scandals, legal heat, alliances, and delayed consequence chains.
- Endgame result based on EV projection + campaign fundamentals.

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`

## Production build
```bash
npm run build
npm run start
```

## Deploy to Vercel
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repository in Vercel.
3. Framework preset: **Next.js** (auto-detected).
4. Deploy.

Vercel settings are included via `vercel.json`.
