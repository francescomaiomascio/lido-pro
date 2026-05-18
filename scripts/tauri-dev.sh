#!/usr/bin/env sh
set -eu

if [ "$(uname -s)" = "Linux" ]; then
  export WEBKIT_DISABLE_DMABUF_RENDERER="${WEBKIT_DISABLE_DMABUF_RENDERER:-1}"

  if [ "${XDG_SESSION_TYPE:-}" = "wayland" ] && [ "${DISPLAY:-}" ]; then
    export GDK_BACKEND="${GDK_BACKEND:-x11}"
  fi
fi

exec tauri dev "$@"
