#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for v in 21.0.2 21 17.0.2 17; do
    if [[ -d "$HOME/.local/share/mise/installs/java/$v" ]]; then
      export JAVA_HOME="$HOME/.local/share/mise/installs/java/$v"
      break
    fi
  done

if [[ -z "${JAVA_HOME:-}" || ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "ERROR: JAVA_HOME is not set to a valid JDK."
  exit 1
fi
export PATH="$JAVA_HOME/bin:$PATH"

if ! command -v gradle >/dev/null 2>&1 && [[ ! -x ./gradlew ]]; then
  echo "ERROR: Gradle executable not found (install gradle or add gradle wrapper)."
  exit 1
fi

BUILD_CMD=(gradle assembleDebug)
if [[ -x ./gradlew ]]; then
  BUILD_CMD=(./gradlew assembleDebug)
fi

echo "Using JAVA_HOME=$JAVA_HOME"
echo "Running: ${BUILD_CMD[*]}"
"${BUILD_CMD[@]}"

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "$APK_PATH" ]]; then
  echo "ERROR: APK not found at $APK_PATH"
  exit 1
fi

mkdir -p dist
cp "$APK_PATH" "dist/election-game-debug.apk"
echo "APK exported: $ROOT_DIR/dist/election-game-debug.apk"
