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

Do not run `npm run dev` and `npm run desktop:dev` separately for normal app development. Use `npm run app:dev` so there is one Vite server and one Tauri desktop shell attached to it.

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

## Validation Notes

Use `npm run dev:server` only when debugging the frontend server itself. Use `npm run app:dev` for the real desktop development loop.

Responsive browser inspection can use `http://localhost:5173`, but final native validation must happen in Tauri Desktop, Android Studio/device, and Xcode/iOS Simulator or device where applicable.
