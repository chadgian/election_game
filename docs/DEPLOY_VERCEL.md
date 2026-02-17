# Deploy Election Game to Vercel

## Prerequisites
- Node.js 18+
- Vercel account

## Steps
1. Install dependencies and verify build locally:
   ```bash
   npm install
   npm run build
   ```
2. Commit and push to your git remote.
3. In Vercel, click **Add New Project** and import the repo.
4. Keep default build settings for Next.js:
   - Build Command: `next build`
   - Output Directory: `.next`
5. Deploy.

## Optional CLI deploy
```bash
npm i -g vercel
vercel
```
