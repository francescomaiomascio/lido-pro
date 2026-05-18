#!/usr/bin/env sh
set -eu

command_name="${1:-open}"
vite_port="${LIDOPRO_DEV_SERVER_PORT:-${VITE_PORT:-5173}}"

detect_host_ip() {
  if [ "${LIDOPRO_ANDROID_DEV_HOST:-}" ]; then
    printf '%s\n' "$LIDOPRO_ANDROID_DEV_HOST"
    return 0
  fi

  # Android Emulator reaches the host machine through this special alias.
  # Physical tablets can override LIDOPRO_ANDROID_DEV_HOST with the host LAN IP.
  printf '%s\n' "10.0.2.2"
  return 0

}

dev_host="$(detect_host_ip)"
dev_url="${LIDOPRO_CAPACITOR_SERVER_URL:-http://$dev_host:$vite_port}"

printf '%s\n' "Android dev server URL: $dev_url"
printf '%s\n' "Keep npm run dev running in another terminal for live reload."

if command -v curl >/dev/null 2>&1; then
  check_url="$dev_url"
  if [ "$dev_host" = "10.0.2.2" ]; then
    check_url="http://127.0.0.1:$vite_port"
  fi

  if ! curl -fsS "$check_url" >/dev/null 2>&1; then
    printf '%s\n' "Warning: $dev_url is not responding yet."
    printf '%s\n' "Start it with: npm run dev"
  fi
fi

export LIDOPRO_CAPACITOR_SERVER_URL="$dev_url"

case "$command_name" in
  sync)
    npx cap sync android
    ;;
  open)
    npx cap sync android
    sh scripts/cap-open-android.sh
    ;;
  run)
    npx cap sync android
    npx cap run android
    ;;
  *)
    printf '%s\n' "Usage: sh scripts/cap-android-dev.sh [sync|open|run]"
    exit 1
    ;;
esac
