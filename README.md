# Election Game (Android)

A turn-based Android campaign simulation prototype built with Kotlin + Jetpack Compose.

## Features
- 10-week election loop with weekly events.
- 11 demographic groups with support/loyalty dynamics.
- Candidate attributes and incumbency effects.
- Contextual choice pool engine that generates 50 possible choices per context and presents 3–5 each week.
- Ethical/unethical choices with delayed consequences.
- Alliances, legal pressure, scandal risk, momentum, and campaign resources.
- End-of-campaign summary score with narrative-style outcome.

## Run
1. Open in Android Studio (Giraffe+ recommended).
2. Sync Gradle.
3. Run the `app` module on an emulator/device.

## Notes
- The simulation engine is intentionally data-driven and extensible.
- You can add more parties/candidates and richer AI in `GameEngine.kt`.


## APK Export
Run `scripts/export_apk.sh` to build and copy the debug APK to `dist/election-game-debug.apk`.
