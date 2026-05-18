#!/usr/bin/env sh
set -eu

find_android_studio() {
  if [ "${CAPACITOR_ANDROID_STUDIO_PATH:-}" ] && [ -x "$CAPACITOR_ANDROID_STUDIO_PATH" ]; then
    printf '%s\n' "$CAPACITOR_ANDROID_STUDIO_PATH"
    return 0
  fi

  for candidate in \
    /opt/android-studio/bin/studio.sh \
    /usr/local/android-studio/bin/studio.sh \
    "$HOME/android-studio/bin/studio.sh" \
    "$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"
  do
    if [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  if command -v studio.sh >/dev/null 2>&1; then
    command -v studio.sh
    return 0
  fi

  return 1
}

studio_path="$(find_android_studio || true)"

if [ -z "$studio_path" ]; then
  printf '%s\n' "Unable to find Android Studio."
  printf '%s\n' "Set CAPACITOR_ANDROID_STUDIO_PATH to the full studio.sh path, then retry."
  exit 1
fi

CAPACITOR_ANDROID_STUDIO_PATH="$studio_path" npx cap open android
