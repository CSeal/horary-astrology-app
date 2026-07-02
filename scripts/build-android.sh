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

# ---- 0. hide .env.local for the duration of the release build ---------------
# .env.local is for LOCAL DEV ONLY (personal astrology-api.io test key, debug
# PIN, etc.) and must NEVER leak into a release bundle. EXPO_PUBLIC_* vars are
# inlined as literal strings into the JS bundle at build time — Expo's env
# loader reads .env.local straight off disk regardless of the calling shell's
# own env, so `unset` alone would NOT be enough. Stash it out of the way for
# the whole build, always restored on exit (even on failure) via trap.
# History: v110 shipped with EXPO_PUBLIC_ASTROLOGY_API_KEY baked into both
# store binaries — every install silently shared the developer's personal key
# and its quota. See KEY_CHECK below for the regression guard.
ENV_LOCAL=".env.local"
ENV_LOCAL_STASH=".env.local.release-stash"
restore_env_local() { [ -f "$ENV_LOCAL_STASH" ] && mv -f "$ENV_LOCAL_STASH" "$ENV_LOCAL"; }
trap restore_env_local EXIT
LEAKED_KEY=""
if [ -f "$ENV_LOCAL" ]; then
  LEAKED_KEY=$(grep '^EXPO_PUBLIC_ASTROLOGY_API_KEY=' "$ENV_LOCAL" | cut -d= -f2- || true)
  mv "$ENV_LOCAL" "$ENV_LOCAL_STASH"
fi

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

# ---- 6. regression guard: confirm no dev API key leaked into the bundle -----
log "Verifying no personal API key is embedded in the AAB"
if [ -n "$LEAKED_KEY" ]; then
  TMP_UNZIP=$(mktemp -d)
  unzip -qo "$AAB" -d "$TMP_UNZIP"
  if grep -arq -- "$LEAKED_KEY" "$TMP_UNZIP"; then
    rm -rf "$TMP_UNZIP"
    echo "✗ EXPO_PUBLIC_ASTROLOGY_API_KEY is embedded in the built AAB — release blocked." >&2
    exit 1
  fi
  rm -rf "$TMP_UNZIP"
  echo "✓ Confirmed clean — dev key from .env.local is NOT present in the AAB"
else
  echo "✓ No dev API key was set in .env.local — nothing to check"
fi

echo "✓ Built signed AAB versionCode $VC → $AAB"
echo "  Next: upload to Play via google_upload_bundle → create_release (internal, draft)."
