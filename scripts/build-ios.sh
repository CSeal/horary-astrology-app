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
