# Build and Export APK (React Native)

Use the provided script:

```bash
scripts/export_apk.sh
```

The script will:
1. Detect a local JDK (prefers 21, then 17).
2. Ensure Node/npm are available.
3. Install JS dependencies if `node_modules` is missing.
4. Build Android debug APK using Gradle.
5. Copy output to `dist/election-game-debug.apk`.

## Requirements
- Node.js 18+
- npm
- JDK 17+
- Android SDK/Build Tools
- Network access for first dependency resolution

If the build fails in restricted environments, run the script on your local machine or CI with full internet and Android SDK configured.
