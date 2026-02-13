# Election Game (Node.js + Next.js)

A turn-based election simulation web app, migrated to Node.js/Next.js for Vercel deployment.

## Stack
- Next.js 14
- React 18
- JavaScript simulation engine in `src/game/gameEngine.js`

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
