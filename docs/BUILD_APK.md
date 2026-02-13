# Export APK

Use this project script to build and export the APK:

```bash
scripts/export_apk.sh
```

Expected output file:

- `dist/election-game-debug.apk`

## Requirements

- JDK 17+ (JDK 21 recommended)
- Android SDK installed and configured for Gradle/AGP
- Network access to resolve Gradle and Android dependencies on first build

If your environment blocks Maven/Google repositories, run the script in Android Studio or in a network-enabled CI runner.
