#!/bin/bash
# Connect to Samsung S23+ via ADB WiFi and optionally run the Expo build.
# Usage:
#   ./scripts/android-connect.sh            — prompts for port
#   ./scripts/android-connect.sh 42751      — connects directly

IP="192.168.1.87"

PORT="${1}"
if [ -z "$PORT" ]; then
  echo "Отладка по WiFi → текущий порт подключения:"
  read -rp "PORT> " PORT
fi

if [ -z "$PORT" ]; then
  echo "Порт не указан. Выход."
  exit 1
fi

echo ""
echo "→ adb connect ${IP}:${PORT}"
adb connect "${IP}:${PORT}"

echo ""
echo "Подключённые устройства:"
adb devices

# Check the device actually appeared
if ! adb devices | grep -q "${IP}:${PORT}"; then
  echo ""
  echo "Устройство не найдено. Проверь порт на телефоне и повтори."
  exit 1
fi

echo ""
read -rp "Запустить сборку? (expo run:android) [Y/n]: " RUN
RUN="${RUN:-Y}"
if [[ "$RUN" =~ ^[Yy]$ ]]; then
  npx expo run:android
fi
