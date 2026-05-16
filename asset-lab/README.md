# Beach BDF Asset Lab

Codex-driven asset factory for Beach BDF/Spiaggia BDF.

The user does not need to open Blender. Blender is used only as a headless rendering binary:

```bash
bash asset-lab/scripts/check_blender.sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python asset-lab/scripts/generate_assets.py
```

Outputs are generated project-owned PNG sprites in:

```txt
src/assets/beach-generated/
```

Rules:
- generate coherent top-down / light semi-3D assets;
- transparent PNG output;
- no random third-party SVGs in the main library UI;
- no DB, seed, layout, coordinate, customer, account, tariff or extra changes;
- generated assets are preview/library assets until a renderer binding wave explicitly enables them.

## Local note

On this machine Blender 4.5.2 LTS is installed, but it crashes during process initialization in the Metal GPU backend before Python execution. The Blender generator remains the canonical script. A dependency-free fallback renderer (`asset-lab/scripts/render_fallback.py`) generated the current project-owned PNG pack so the app can use coherent local assets while the Blender installation issue is resolved.
