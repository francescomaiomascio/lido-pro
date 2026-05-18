# Development Workflows

## Canonical Local Workflow

The canonical development command is:

```sh
npm run app:dev
```

This starts the Vite development server through Tauri's `beforeDevCommand` and opens LidoPro Desktop through Tauri.

The single frontend endpoint is:

```text
http://localhost:5173
```

Tauri and the optional browser preview use the same endpoint. Browser preview is secondary and should be used only for fast UI or responsive inspection.

## Command Model

| Command | Purpose |
| --- | --- |
| `npm run app:dev` | Primary workflow. Starts Vite through Tauri config and opens LidoPro Desktop. |
| `npm run desktop:dev` | Alias for `npm run app:dev`. |
| `npm run tauri:dev` | Direct Tauri dev command. |
| `npm run dev:server` | Vite server only on `http://localhost:5173`. |
| `npm run web:dev` | Alias for server-only web preview. |
| `npm run dev` | Backward-compatible alias for `npm run dev:server`. |
| `npm run cap:sync:android` | Build and sync the Vite output into the Capacitor Android shell. |
| `npm run cap:open:android` | Open the Android shell through the repository Android Studio launcher resolver. |
| `npm run cap:run:android` | Build, sync, install, and run on an available Android device or emulator. |

Do not run `npm run dev` and `npm run desktop:dev` separately for normal app development. Use `npm run app:dev` so there is one Vite server and one Tauri desktop shell attached to it.

On Linux, `npm run app:dev` runs through `scripts/tauri-dev.sh`. The helper preserves the normal Tauri workflow while applying local WebKitGTK/Wayland runtime environment fixes when needed.

## Browser Preview

While `npm run app:dev` is running, the same frontend can be opened manually:

```text
http://localhost:5173
```

Browser preview does not validate Tauri APIs, Capacitor APIs, native WebView behavior, storage, device permissions, signing, or packaging. It is not the product runtime.

## Port 5173 In Use

`dev:server` uses a strict port. If `npm run app:dev` fails because port `5173` is already occupied, stop the old process first.

macOS/Linux:

```sh
lsof -i :5173
kill <PID>
```

Then restart:

```sh
npm run app:dev
```

## Linux Wayland / WebKitGTK

If Tauri exits with a WebKitGTK internal error or a Wayland protocol dispatch error, use the canonical command:

```sh
npm run app:dev
```

The repository launcher sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` on Linux and uses `GDK_BACKEND=x11` under Wayland when an X display is available. To debug without the wrapper, run `npm run tauri:dev` directly.

## Validation Notes

Use `npm run dev:server` only when debugging the frontend server itself. Use `npm run app:dev` for the real desktop development loop.

Responsive browser inspection can use `http://localhost:5173`, but final native validation must happen in Tauri Desktop, Android Studio/device, and Xcode/iOS Simulator or device where applicable.

For Android-specific setup, launcher resolution, tablet emulator use, and module troubleshooting, see [Android Capacitor workflow](android-capacitor-workflow.md).
