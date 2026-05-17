# Asset Directory Policy

LidoPro uses several asset folders with different roles. Keep the boundaries explicit so generated, experimental, and canonical assets do not get mixed.

## Canonical Asset Locations

| Path | Policy |
| --- | --- |
| `public/brand/` | Canonical public brand assets: app icons, wordmarks, favicons, static logo files. Brand rights remain reserved. |
| `public/assets/` | Static public app assets loaded by URL at runtime. |
| `src/assets/beach-generated/` | Generated beach assets promoted into app source and bundled by Vite. |
| `src/assets/beach-library/` | Curated source asset library with licensing metadata and quarantine tracking. |

## Asset Lab

`asset-lab/` is the internal asset generation/rendering pipeline.

Keep:

- scripts;
- manifests;
- source working files that are needed to regenerate assets;
- documentation for generated assets.

Do not commit routine output from:

- `asset-lab/output/`
- temporary renders;
- unreviewed imports;
- local experiments.

Generated output can be promoted only after rights review, naming cleanup, size check, and app integration review.

## Rights And Quarantine

Do not promote third-party, AI-generated, copied, or imported assets into canonical app folders unless the rights and intended use are clear.

Quarantined/random assets must remain out of canonical app surfaces until reviewed. Licensing metadata belongs next to curated asset libraries.

## Brand Assets

LidoPro name, wordmark, siren/mermaid mark, app icon, screenshots, and product identity are reserved. Public source visibility does not grant reuse rights.

## Generated Artifacts

Do not commit generated release packages or platform build assets:

- `.dmg`
- `.app`
- `.AppImage`
- `.deb`
- `.rpm`
- `.apk`
- `.aab`
- `.ipa`

Those artifacts are local build outputs unless a future release process explicitly promotes them.
