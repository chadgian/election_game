# Election Game (React Native)

A turn-based election simulation rebuilt in React Native for Android deployment.

## What changed
- Migrated from Jetpack Compose to a React Native application.
- Ported the campaign simulation engine (10-week loop, demographics, ethics/scandal systems, delayed consequences) to JavaScript.
- Kept Android packaging flow so you can export an installable debug APK.

## Run locally
1. Install Node.js 18+, JDK 17+, Android SDK, and Gradle (or generate Gradle wrapper).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Metro:
   ```bash
   npm run start
   ```
4. In another terminal, run on Android:
   ```bash
   npm run android
   ```

## APK export
```bash
scripts/export_apk.sh
```

Expected output:
- `dist/election-game-debug.apk`
