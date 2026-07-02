#!/bin/bash
# scripts/build-ios.sh — one-command iOS release build → App Store Connect (no EAS).
#
# Encodes the full manual pipeline: set up signing from signing/ios/, strip the
# unused push entitlement, bump the build number, archive, export an IPA, then
# validate and upload to App Store Connect.
#
# Usage:
#   bash scripts/build-ios.sh              # full build + validate + upload
#   bash scripts/build-ios.sh --no-upload  # build + validate only (no upload)
#   bash scripts/build-ios.sh --prebuild   # regenerate ios/ first (expo prebuild)
#
# Prereqs (already in the repo / machine):
#   - signing/ios/{distribution.pem,distribution.key,hora_app_store.mobileprovision}
#   - ASC API key at ~/.expo/AuthKey_8NQS9JA767.p8
#   - Xcode + CocoaPods installed
set -euo pipefail
cd "$(dirname "$0")/.."

# ---- config -----------------------------------------------------------------
WORKSPACE="ios/Hora.xcworkspace"
SCHEME="Hora"
BUNDLE_ID="io.hora.app"
TEAM_ID="T29RJZB64F"
PROFILE_NAME="Hora App Store"
CERT_IDENTITY="iPhone Distribution: Mykosa OU (T29RJZB64F)"
ASC_KEY_ID="8NQS9JA767"
ASC_ISSUER="5726f3a0-ca34-4403-a767-3dae735b72bc"
ARCHIVE="/tmp/Hora.xcarchive"
EXPORT_DIR="/tmp/Hora-export"
KEYCHAIN="$HOME/Library/Keychains/hora-build.keychain-db"
KC_PASS="buildpass"
P12_PASS="horabuild"

DO_UPLOAD=1; DO_PREBUILD=0
for a in "$@"; do
  [ "$a" = "--no-upload" ] && DO_UPLOAD=0
  [ "$a" = "--prebuild" ] && DO_PREBUILD=1
done

log() { printf "\n\033[1;36m▸ %s\033[0m\n" "$1"; }

# ---- 0. hide .env.local for the duration of the release build ---------------
# .env.local is for LOCAL DEV ONLY (personal astrology-api.io test key, debug
# PIN, etc.) and must NEVER leak into a release bundle. EXPO_PUBLIC_* vars are
# inlined as literal strings into the JS bundle at build time — Expo's env
# loader reads .env.local straight off disk regardless of the calling shell's
# own env, so `unset` alone would NOT be enough. Stash it out of the way for
# the whole build, always restored on exit (even on failure) via trap.
# History: build 110 shipped with EXPO_PUBLIC_ASTROLOGY_API_KEY baked into
# both store binaries — every install silently shared the developer's
# personal key and its quota. See KEY_CHECK below for the regression guard.
ENV_LOCAL=".env.local"
ENV_LOCAL_STASH=".env.local.release-stash"
restore_env_local() { [ -f "$ENV_LOCAL_STASH" ] && mv -f "$ENV_LOCAL_STASH" "$ENV_LOCAL"; }
trap restore_env_local EXIT
LEAKED_KEY=""
if [ -f "$ENV_LOCAL" ]; then
  LEAKED_KEY=$(grep '^EXPO_PUBLIC_ASTROLOGY_API_KEY=' "$ENV_LOCAL" | cut -d= -f2- || true)
  mv "$ENV_LOCAL" "$ENV_LOCAL_STASH"
fi

# ---- 1. prebuild (optional) -------------------------------------------------
if [ "$DO_PREBUILD" = 1 ] || [ ! -d ios ]; then
  log "expo prebuild (iOS)"
  rm -rf ios
  npx expo prebuild --platform ios
fi

# ---- 2. signing: cert+key -> p12 -> temp keychain; install profile ----------
log "Signing setup (temp keychain + profile)"
openssl pkcs12 -export -legacy -inkey signing/ios/distribution.key -in signing/ios/distribution.pem \
  -out /tmp/hora-dist.p12 -passout "pass:$P12_PASS" -name "$CERT_IDENTITY" >/dev/null 2>&1
security delete-keychain "$KEYCHAIN" 2>/dev/null || true
security create-keychain -p "$KC_PASS" "$KEYCHAIN"
security set-keychain-settings -lut 7200 "$KEYCHAIN"
security unlock-keychain -p "$KC_PASS" "$KEYCHAIN"
security import /tmp/hora-dist.p12 -k "$KEYCHAIN" -P "$P12_PASS" -T /usr/bin/codesign -T /usr/bin/xcodebuild >/dev/null 2>&1
security list-keychains -d user -s "$KEYCHAIN" $(security list-keychains -d user | sed 's/"//g' | xargs)
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KC_PASS" "$KEYCHAIN" >/dev/null 2>&1
PROFILE_UUID=$(security cms -D -i signing/ios/hora_app_store.mobileprovision 2>/dev/null | plutil -extract UUID raw - 2>/dev/null)
mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles"
cp signing/ios/hora_app_store.mobileprovision "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"

# ---- 3. strip unused aps-environment (local notifications only) --------------
# The App Store profile carries no Push capability; expo-notifications injects a
# spurious aps-environment entitlement. Remove it so codesign matches the profile.
log "Strip unused aps-environment entitlement"
ENT="ios/Hora/Hora.entitlements"
/usr/libexec/PlistBuddy -c "Delete :aps-environment" "$ENT" 2>/dev/null || true

# ---- 4. bump build number (unique, monotonic = git commit count) ------------
BUILD_NO=$(git rev-list --count HEAD 2>/dev/null || date +%s)
log "Build number: $BUILD_NO"

# CURRENT_PROJECT_VERSION on the xcodebuild command line (step 5) does NOT
# reach the compiled binary: expo prebuild writes CFBundleVersion into
# Info.plist as a literal string (not a $(CURRENT_PROJECT_VERSION) variable
# reference), since app.json has no expo.ios.buildNumber set. Xcode only
# substitutes actual $(VAR) placeholders, so the literal silently overrides
# the CLI flag. Patch the plist directly — same pattern as the
# aps-environment strip above. (Discovered when build 112's IPA still
# reported CFBundleVersion=1, blocking the v1.0.1 hotfix submission.)
INFO_PLIST="ios/Hora/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NO" "$INFO_PLIST"
log "Info.plist CFBundleVersion patched to $BUILD_NO"

# ---- 5. archive -------------------------------------------------------------
log "xcodebuild archive (Release)"
security unlock-keychain -p "$KC_PASS" "$KEYCHAIN"
rm -rf "$ARCHIVE"
SENTRY_DISABLE_AUTO_UPLOAD=true xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" \
  -configuration Release -destination "generic/platform=iOS" -archivePath "$ARCHIVE" archive \
  DEVELOPMENT_TEAM="$TEAM_ID" CODE_SIGN_STYLE=Manual \
  PROVISIONING_PROFILE_SPECIFIER="$PROFILE_NAME" CODE_SIGN_IDENTITY="$CERT_IDENTITY" \
  CURRENT_PROJECT_VERSION="$BUILD_NO" \
  OTHER_CODE_SIGN_FLAGS="--keychain $KEYCHAIN"

# ---- 6. export IPA ----------------------------------------------------------
log "Export IPA"
cat > /tmp/hora-export-opts.plist <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>manual</string>
  <key>provisioningProfiles</key><dict><key>$BUNDLE_ID</key><string>$PROFILE_NAME</string></dict>
  <key>signingCertificate</key><string>$CERT_IDENTITY</string>
  <key>uploadSymbols</key><true/><key>stripSwiftSymbols</key><true/>
</dict></plist>
PLIST
security unlock-keychain -p "$KC_PASS" "$KEYCHAIN"
rm -rf "$EXPORT_DIR"
xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist /tmp/hora-export-opts.plist
IPA="$EXPORT_DIR/$SCHEME.ipa"
log "IPA: $IPA ($(stat -f%z "$IPA") bytes)"

# ---- 6b. regression guard: confirm no dev API key leaked into the bundle ----
log "Verifying no personal API key is embedded in the IPA"
if [ -n "$LEAKED_KEY" ]; then
  TMP_UNZIP=$(mktemp -d)
  unzip -qo "$IPA" -d "$TMP_UNZIP"
  if grep -arq -- "$LEAKED_KEY" "$TMP_UNZIP"; then
    rm -rf "$TMP_UNZIP"
    echo "✗ EXPO_PUBLIC_ASTROLOGY_API_KEY is embedded in the built IPA — release blocked." >&2
    exit 1
  fi
  rm -rf "$TMP_UNZIP"
  echo "✓ Confirmed clean — dev key from .env.local is NOT present in the IPA"
else
  echo "✓ No dev API key was set in .env.local — nothing to check"
fi

# ---- 7. validate + upload ---------------------------------------------------
mkdir -p ~/.appstoreconnect/private_keys
cp ~/.expo/AuthKey_$ASC_KEY_ID.p8 ~/.appstoreconnect/private_keys/ 2>/dev/null || true
log "Validate against App Store Connect"
xcrun altool --validate-app -f "$IPA" -t ios --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER"
if [ "$DO_UPLOAD" = 1 ]; then
  log "Upload to App Store Connect"
  xcrun altool --upload-app -f "$IPA" -t ios --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER"
  echo "✓ Uploaded build $BUILD_NO — appears in ASC (PROCESSING → VALID) within ~5-20 min."
else
  echo "✓ Built + validated (upload skipped). IPA: $IPA"
fi

# ---- 8. cleanup -------------------------------------------------------------
security delete-keychain "$KEYCHAIN" 2>/dev/null || true
