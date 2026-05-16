# Convenience wrapper for environments that want a stable script name.
# Run with Blender:
#   blender --background --python asset-lab/scripts/render_all.py
exec(open('asset-lab/scripts/generate_assets.py', encoding='utf-8').read())
