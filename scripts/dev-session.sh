#!/bin/bash
# scripts/dev-session.sh
# Dev session manager for Horary Astrology app.
# Manages Metro + native log capture for Android (WiFi / USB / emulator) and
# iOS (simulator / physical). Designed to be called non-interactively by
# Claude via the Bash tool — all decisions passed as flags.
#
# Usage:
#   dev-session.sh status
#   dev-session.sh start --platform android --device wifi --port PORT
#   dev-session.sh start --platform android --device emulator [--avd NAME]
#   dev-session.sh start --platform android --device usb
#   dev-session.sh start --platform ios    --device simulator [--sim NAME]
#   dev-session.sh start --platform ios    --device physical
#   dev-session.sh logs  [metro|native|all] [--lines N]
#   dev-session.sh stop
#   dev-session.sh avds          # list available Android emulators
#   dev-session.sh simulators    # list available iOS simulators

set -euo pipefail

SESSION_FILE="/tmp/hora-session.json"
METRO_LOG="/tmp/hora-metro.log"
NATIVE_LOG="/tmp/hora-native.log"
ANDROID_IP="192.168.1.87"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── Helpers ──────────────────────────────────────────────────────────────────

metro_pid() {
  lsof -ti :8081 2>/dev/null | head -1 || true
}

is_metro_running() {
  [ -n "$(metro_pid)" ]
}

write_session() {
  local platform="$1" device="$2" metro_pid="${3:-null}" native_pid="${4:-null}"
  cat > "$SESSION_FILE" <<EOF
{
  "platform": "${platform}",
  "device": "${device}",
  "metro_pid": ${metro_pid},
  "native_pid": ${native_pid},
  "metro_log": "${METRO_LOG}",
  "native_log": "${NATIVE_LOG}",
  "project": "${PROJECT_DIR}",
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Keep screen on while plugged in (USB or WiFi) during dev sessions.
# Value 3 = USB + AC; restores to 0 (system default) on session stop.
adb_stay_awake() {
  adb shell settings put global stay_on_while_plugged_in 3 2>/dev/null \
    && echo "✓ Screen stay-awake: ON (while charging/connected)" \
    || echo "⚠ Could not set stay-awake (device may not be fully connected)"
}

adb_restore_sleep() {
  adb shell settings put global stay_on_while_plugged_in 0 2>/dev/null \
    && echo "✓ Screen stay-awake: restored to system default" || true
}

# Kill any existing native log capture processes cleanly
stop_native_capture() {
  pkill -f "adb logcat" 2>/dev/null || true
  pkill -f "simctl.*log stream" 2>/dev/null || true
  pkill -f "idevicesyslog" 2>/dev/null || true
  sleep 0.3
}

# Start Android native log capture — returns PID
start_logcat() {
  stop_native_capture
  adb logcat -c 2>/dev/null || true  # clear stale buffer
  # Tags: JS errors, RN bridge, native crashes, warnings
  adb logcat \
    ReactNativeJS:V \
    ReactNative:V \
    ReactNativeW:V \
    AndroidRuntime:E \
    JDWP:W \
    expo:V \
    '*:S' \
    2>&1 >> "$NATIVE_LOG" &
  echo $!
}

# Start iOS Simulator log capture — returns PID
start_simctl_log() {
  stop_native_capture
  xcrun simctl spawn booted log stream \
    --predicate 'process CONTAINS "hora" OR process CONTAINS "Expo" OR subsystem CONTAINS "react"' \
    --level debug \
    2>&1 >> "$NATIVE_LOG" &
  echo $!
}

# Start iOS physical device log capture — returns PID
start_idevicesyslog() {
  stop_native_capture
  if ! command -v idevicesyslog &>/dev/null; then
    echo "WARNING: idevicesyslog not found — install with: brew install libimobiledevice" >&2
    echo "0"
    return
  fi
  idevicesyslog 2>&1 \
    | grep --line-buffered -E "ReactNative|hora|Expo|RCT" \
    >> "$NATIVE_LOG" &
  echo $!
}

# ─── Commands ─────────────────────────────────────────────────────────────────

cmd_status() {
  echo "=== Hora Dev Session Status ==="
  echo ""

  if is_metro_running; then
    echo "✓ Metro: RUNNING (PID $(metro_pid), port 8081)"
  else
    echo "✗ Metro: NOT running"
  fi

  if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "--- Session ---"
    cat "$SESSION_FILE"
  else
    echo "(no active session file)"
  fi

  echo ""
  echo "--- Log files ---"
  for f in "$METRO_LOG" "$NATIVE_LOG"; do
    if [ -f "$f" ]; then
      lines=$(wc -l < "$f" | tr -d ' ')
      size=$(du -sh "$f" 2>/dev/null | cut -f1)
      echo "✓ $f  ($lines lines, $size)"
    else
      echo "✗ $f  (not found)"
    fi
  done

  echo ""
  echo "--- ADB devices ---"
  adb devices -l 2>/dev/null || echo "(adb not available)"

  echo ""
  echo "--- Booted iOS simulators ---"
  xcrun simctl list devices booted 2>/dev/null \
    | grep -E "(iPhone|iPad)" || echo "(none booted)"
}

cmd_avds() {
  echo "=== Available Android Emulators ==="
  # Try emulator in PATH or via ANDROID_HOME
  if command -v emulator &>/dev/null; then
    emulator -list-avds
  elif [ -n "${ANDROID_HOME:-}" ] && [ -x "$ANDROID_HOME/emulator/emulator" ]; then
    "$ANDROID_HOME/emulator/emulator" -list-avds
  elif ls ~/.android/avd/*.ini &>/dev/null 2>&1; then
    ls ~/.android/avd/*.ini | sed 's|.*/||;s|\.ini||'
  else
    echo "(emulator not found — install Android Studio or set ANDROID_HOME)"
  fi
}

cmd_simulators() {
  echo "=== Available iOS Simulators ==="
  xcrun simctl list devices available 2>/dev/null \
    | grep -E "(iPhone|iPad)" | head -30 \
    || echo "(xcrun not found)"
}

cmd_logs() {
  local target="${1:-all}"
  local lines=100
  # Support --lines N anywhere in args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --lines|-n) lines="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  show_log() {
    local file="$1" label="$2"
    echo "=== $label (last $lines lines: $file) ==="
    if [ -f "$file" ]; then
      tail -n "$lines" "$file"
    else
      echo "(log not found)"
    fi
    echo ""
  }

  case "$target" in
    metro)  show_log "$METRO_LOG"  "Metro / JS bundler" ;;
    native) show_log "$NATIVE_LOG" "Native device log" ;;
    all|*)
      show_log "$METRO_LOG"  "Metro / JS bundler"
      show_log "$NATIVE_LOG" "Native device log"
      ;;
  esac
}

cmd_stop() {
  echo "Stopping dev session..."

  # Stop native log capture + restore screen sleep
  stop_native_capture
  echo "✓ Native capture stopped"
  adb_restore_sleep

  # Kill Metro
  local mpid
  mpid="$(metro_pid)"
  if [ -n "$mpid" ]; then
    kill -9 "$mpid" 2>/dev/null && echo "✓ Metro stopped (PID $mpid)" || true
    sleep 0.5
  else
    echo "✓ Metro: already stopped"
  fi

  # Clean up temp files
  rm -f "$SESSION_FILE" "$METRO_LOG" "$NATIVE_LOG" \
        "/tmp/hora-metro.prev.log" "/tmp/hora-native.prev.log" 2>/dev/null
  echo "✓ Temp files cleaned"

  echo "Done."
}

cmd_start() {
  local platform="" device="" port="" avd="" sim=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --platform) platform="$2"; shift 2 ;;
      --device)   device="$2";   shift 2 ;;
      --port)     port="$2";     shift 2 ;;
      --avd)      avd="$2";      shift 2 ;;
      --sim)      sim="$2";      shift 2 ;;
      *) echo "Unknown arg: $1" >&2; shift ;;
    esac
  done

  if [ -z "$platform" ] || [ -z "$device" ]; then
    echo "Error: --platform and --device are required" >&2
    echo "Run with no args to see usage." >&2
    exit 1
  fi

  echo "=== Starting Dev Session: $platform / $device ==="
  echo "Metro log  → $METRO_LOG"
  echo "Native log → $NATIVE_LOG"
  echo ""

  # Truncate old logs (keep previous content for debugging if needed via backup)
  cp "$METRO_LOG" "/tmp/hora-metro.prev.log" 2>/dev/null || true
  cp "$NATIVE_LOG" "/tmp/hora-native.prev.log" 2>/dev/null || true
  > "$METRO_LOG"
  > "$NATIVE_LOG"

  cd "$PROJECT_DIR"

  # ── Android ─────────────────────────────────────────────────────────────────
  if [ "$platform" = "android" ]; then

    case "$device" in
      wifi)
        [ -z "$port" ] && { echo "Error: --port required for WiFi device" >&2; exit 1; }
        echo "→ Connecting ADB WiFi: ${ANDROID_IP}:${port}"
        adb connect "${ANDROID_IP}:${port}" 2>&1
        sleep 1
        if ! adb devices | grep -q "${ANDROID_IP}:${port}"; then
          echo "✗ ADB connect failed. Check the port shown on device." >&2
          exit 1
        fi
        echo "✓ ADB connected"
        adb_stay_awake
        ;;

      emulator)
        if [ -n "$avd" ]; then
          echo "→ Launching emulator: $avd"
          if command -v emulator &>/dev/null; then
            emulator -avd "$avd" -no-snapshot-load &>/dev/null &
          elif [ -n "${ANDROID_HOME:-}" ]; then
            "$ANDROID_HOME/emulator/emulator" -avd "$avd" -no-snapshot-load &>/dev/null &
          else
            echo "✗ emulator binary not found" >&2; exit 1
          fi
          echo "  Waiting for emulator boot (up to 60s)..."
          adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 2; done' 2>/dev/null || sleep 15
          echo "✓ Emulator ready"
        else
          echo "→ Using already-running emulator"
          adb devices -l
        fi
        adb_stay_awake
        ;;

      usb)
        echo "→ Using USB device"
        adb devices -l
        adb_stay_awake
        ;;

      *)
        echo "Error: unknown android device type '$device'" >&2; exit 1 ;;
    esac

    echo "→ Starting adb logcat..."
    native_pid="$(start_logcat)"
    echo "✓ logcat started (PID $native_pid)"

    echo "→ Starting expo run:android (build + install + Metro)..."
    echo "  This may take 2-5 minutes for the first build."
    npx expo run:android >> "$METRO_LOG" 2>&1 &
    metro_bg_pid=$!
    echo "✓ expo run:android started (PID $metro_bg_pid)"

    write_session "$platform" "$device" "$metro_bg_pid" "$native_pid"

  # ── iOS ──────────────────────────────────────────────────────────────────────
  elif [ "$platform" = "ios" ]; then

    case "$device" in
      simulator)
        if [ -n "$sim" ]; then
          echo "→ Booting simulator: $sim"
          xcrun simctl boot "$sim" 2>/dev/null || true
          open -a Simulator 2>/dev/null || true
          echo "  Waiting for simulator..."
          sleep 4
        else
          echo "→ Using booted simulator"
          xcrun simctl list devices booted 2>/dev/null | grep -E "(iPhone|iPad)" || true
        fi
        echo "→ Starting simctl log stream..."
        native_pid="$(start_simctl_log)"
        echo "✓ log stream started (PID $native_pid)"

        echo "→ Starting expo run:ios..."
        npx expo run:ios >> "$METRO_LOG" 2>&1 &
        metro_bg_pid=$!
        echo "✓ expo run:ios started (PID $metro_bg_pid)"

        write_session "$platform" "$device" "$metro_bg_pid" "$native_pid"
        ;;

      physical)
        echo "→ Physical iOS device (USB)"
        echo "→ Starting idevicesyslog..."
        native_pid="$(start_idevicesyslog)"
        echo "✓ idevicesyslog started (PID $native_pid)"

        echo "→ Starting expo run:ios --device..."
        npx expo run:ios --device >> "$METRO_LOG" 2>&1 &
        metro_bg_pid=$!
        echo "✓ expo run:ios --device started (PID $metro_bg_pid)"

        write_session "$platform" "$device" "$metro_bg_pid" "$native_pid"
        ;;

      *)
        echo "Error: unknown ios device type '$device'" >&2; exit 1 ;;
    esac

  else
    echo "Error: unknown platform '$platform' (use android or ios)" >&2; exit 1
  fi

  echo ""
  echo "=== Session started ==="
  echo "  Check status:  bash scripts/dev-session.sh status"
  echo "  Read logs:     bash scripts/dev-session.sh logs all --lines 80"
  echo "  Stop capture:  bash scripts/dev-session.sh stop"
}

# ─── Dispatch ─────────────────────────────────────────────────────────────────

CMD="${1:-status}"
shift 2>/dev/null || true

case "$CMD" in
  status)     cmd_status ;;
  start)      cmd_start "$@" ;;
  stop)       cmd_stop ;;
  logs)       cmd_logs "$@" ;;
  avds)       cmd_avds ;;
  simulators) cmd_simulators ;;
  help|-h|--help)
    echo "Usage: dev-session.sh {status|start|stop|logs|avds|simulators}"
    echo ""
    echo "start options:"
    echo "  --platform android|ios"
    echo "  --device   wifi|emulator|usb|simulator|physical"
    echo "  --port N         (android wifi)"
    echo "  --avd  NAME      (android emulator)"
    echo "  --sim  NAME      (ios simulator)"
    ;;
  *)
    echo "Unknown command: $CMD" >&2
    echo "Run: dev-session.sh help" >&2
    exit 1
    ;;
esac
