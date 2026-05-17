#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== LidoPro repository scan =="
echo

echo "-- tracked generated artifacts --"
if ! git ls-files | rg '(^|/)dist/|(^|/)node_modules/|(^|/)android/.*/build/|(^|/)src-tauri/target/|\.(db|sqlite|sqlite3|apk|aab|dmg|AppImage|deb|rpm|msi|exe)$'; then
  echo "none"
fi
echo

echo "-- local generated/release artifacts outside ignored heavy folders --"
local_artifacts="$(find . \
  -path './.git' -prune -o \
  -path './node_modules' -prune -o \
  -path './dist' -prune -o \
  -path './src-tauri/target' -prune -o \
  -path './android/.gradle' -prune -o \
  -path './android/app/build' -prune -o \
  -path './android/build' -prune -o \
  -path './android/capacitor-cordova-android-plugins/build' -prune -o \
  -type f \( \
    -name '*.db' -o \
    -name '*.sqlite' -o \
    -name '*.sqlite3' -o \
    -name '*.apk' -o \
    -name '*.aab' -o \
    -name '*.dmg' -o \
    -name '*.AppImage' -o \
    -name '*.deb' -o \
    -name '*.rpm' -o \
    -name '*.msi' -o \
    -name '*.exe' \
  \) -print | sort)"
if [[ -n "$local_artifacts" ]]; then
  echo "$local_artifacts"
else
  echo "none"
fi
echo

echo "-- secret/signing indicators --"
if ! rg -n \
  '\bAPI_KEY\b|\bSECRET\b|\bTOKEN\b|\bPASSWORD\b|\bPRIVATE_KEY\b|\bKEYSTORE\b|\bJKS\b|\.p12\b|\.mobileprovision\b|\.keystore\b' \
  --hidden \
  --glob '!node_modules/**' \
  --glob '!dist/**' \
  --glob '!src-tauri/target/**' \
  --glob '!android/**/build/**' \
  --glob '!android/.gradle/**' \
  --glob '!scripts/repo-scan.sh' \
  --glob '!.git/**' \
  .; then
  echo "none"
fi
echo

echo "-- old naming references --"
if ! rg -n -i 'Beach BDF|beach-bdf|Spiaggia BDF|\bBDF\b|beach bdf' \
  README.md docs src public index.html package.json capacitor.config.ts src-tauri 2>/dev/null; then
  echo "none"
fi
echo

echo "-- risky runtime/release claims --"
if ! rg -n -i \
  'Electron|Firefox primary|browser production|App Store released|Mac App Store released|Linux package released|cloud live|payment live|account live|customer portal live' \
  README.md docs src public index.html package.json capacitor.config.ts src-tauri 2>/dev/null; then
  echo "none"
fi
echo

echo "Scan complete. This script reports findings only and does not modify files."
