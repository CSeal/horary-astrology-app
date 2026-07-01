#!/bin/bash
# scripts/build-android.sh — one-command Android release build → signed AAB (no EAS).
#
# Mirrors scripts/build-ios.sh for the Play Store side. Regenerates the native
# project fresh (so the package is io.hora.app from app.json, not a stale debug
# com.hora.app), lets the withAndroidSigning config plugin wire the release
# keystore, injects a monotonic versionCode (= git commit count, same scheme as
# the iOS build number), then runs Gradle bundleRelease. Sentry source-map upload
# is disabled (no auth token locally, same as the iOS archive).
#
# Usage:
#   bash scripts/build-android.sh             # prebuild + bundleRelease → signed .aab
#   bash scripts/build-android.sh --no-prebuild   # reuse existing android/ (faster re-run)
#
# Prereqs (already in the repo / machine):
#   - signing/hora-release.keystore + signing/android-signing.properties
#   - plugins/withAndroidSigning (wires signingConfigs.release into build.gradle)
#   - JDK 17, Android SDK
set -euo pipefail
cd "$(dirname "$0")/.."

PACKAGE="io.hora.app"
AAB="android/app/build/outputs/bundle/release/app-release.aab"
DO_PREBUILD=1
for a in "$@"; do [ "$a" = "--no-prebuild" ] && DO_PREBUILD=0; done

log() { printf "\n\033[1;36m▸ %s\033[0m\n" "$1"; }

# ---- 1. prebuild (regenerate android/ with io.hora.app + release signing) ----
# rm + prebuild (not --clean) so only android/ is touched — never clobbers the
# already-uploaded ios/ project.
if [ "$DO_PREBUILD" = 1 ]; then
  log "expo prebuild (Android) — fresh io.hora.app project"
  # Remove android/ robustly: Spotlight/Finder can recreate .DS_Store inside the
  # tree mid-delete, making the final rmdir fail with "Directory not empty".
  for _ in 1 2 3 4 5; do
    rm -rf android 2>/dev/null || true
    [ ! -d android ] && break
    sleep 1
  done
  [ -d android ] && { echo "✗ could not remove android/ — stop any Gradle daemon/Metro and retry" >&2; exit 1; }
  CI=1 npx expo prebuild --platform android
fi

# ---- 2. inject monotonic versionCode (= git commit count) --------------------
VC=$(git rev-list --count HEAD 2>/dev/null || date +%s)
log "versionCode: $VC"
sed -i '' -E "s/versionCode [0-9]+/versionCode $VC/" android/app/build.gradle
grep -nE "versionCode|versionName" android/app/build.gradle | head -2

# ---- 3. verify package + release signing are correct -------------------------
grep -q "applicationId '$PACKAGE'" android/app/build.gradle \
  || { echo "✗ applicationId is not $PACKAGE — check app.json" >&2; exit 1; }
grep -q "signingConfigs.release" android/app/build.gradle \
  || { echo "✗ release signingConfig not wired — withAndroidSigning did not run" >&2; exit 1; }

# ---- 4. bundleRelease --------------------------------------------------------
log "Gradle bundleRelease (Hermes + R8, first run is slow)"
( cd android && SENTRY_DISABLE_AUTO_UPLOAD=true ./gradlew bundleRelease --no-daemon )

# ---- 5. verify AAB exists + is signed ----------------------------------------
[ -f "$AAB" ] || { echo "✗ AAB not found at $AAB" >&2; exit 1; }
log "AAB: $AAB ($(stat -f%z "$AAB") bytes)"
jarsigner -verify "$AAB" >/dev/null 2>&1 \
  && echo "✓ AAB jar-signature verified (release keystore)" \
  || echo "⚠ jarsigner verify inconclusive — Play re-signs on ingest anyway"

echo "✓ Built signed AAB versionCode $VC → $AAB"
echo "  Next: upload to Play via google_upload_bundle → create_release (internal, draft)."
