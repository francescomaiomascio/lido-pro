#!/usr/bin/env bash
set -euo pipefail

MAC_BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"

if [[ -x "$MAC_BLENDER" ]]; then
  echo "Blender found: $MAC_BLENDER"
  "$MAC_BLENDER" --version | head -n 3
  exit 0
fi

if command -v blender >/dev/null 2>&1; then
  BLENDER_BIN="$(command -v blender)"
  echo "Blender found: $BLENDER_BIN"
  "$BLENDER_BIN" --version | head -n 3
  exit 0
fi

cat <<'MSG'
Blender binary not found.

MAP.R6.3P uses Blender only as a headless renderer/compiler for generated PNG assets.
You do not need to open or use the Blender UI.

Install option on macOS:
  brew install --cask blender

Or install Blender normally so this binary exists:
  /Applications/Blender.app/Contents/MacOS/Blender

Then rerun:
  bash asset-lab/scripts/check_blender.sh
  /Applications/Blender.app/Contents/MacOS/Blender --background --python asset-lab/scripts/generate_assets.py
MSG
exit 1
