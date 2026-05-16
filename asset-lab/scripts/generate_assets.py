import json
import math
import shutil
from pathlib import Path

import bpy
from mathutils import Euler

ROOT = Path(__file__).resolve().parents[2]
APP_OUT = ROOT / 'src' / 'assets' / 'beach-generated'
LAB_OUT = ROOT / 'asset-lab' / 'output'
LAB_MANIFEST = ROOT / 'asset-lab' / 'manifests' / 'generated-assets.json'

PALETTE = {
    'sand_shadow': (0.34, 0.25, 0.17, 0.34),
    'white': (0.94, 0.91, 0.83, 1.0),
    'canvas': (0.86, 0.43, 0.35, 1.0),
    'canvas_dark': (0.62, 0.26, 0.22, 1.0),
    'canvas_blue': (0.24, 0.50, 0.63, 1.0),
    'leaf': (0.12, 0.43, 0.31, 1.0),
    'leaf_light': (0.22, 0.60, 0.39, 1.0),
    'leaf_dark': (0.07, 0.28, 0.21, 1.0),
    'wood': (0.63, 0.42, 0.23, 1.0),
    'wood_light': (0.78, 0.58, 0.34, 1.0),
    'bamboo': (0.76, 0.66, 0.36, 1.0),
    'fabric': (0.86, 0.80, 0.68, 1.0),
    'fabric_shadow': (0.58, 0.52, 0.45, 1.0),
    'metal': (0.62, 0.68, 0.68, 1.0),
}

ASSETS = [
    dict(id='umbrella_classic_top', family='umbrella', label='Ombrellone classico', folder='umbrellas', file='umbrellas/umbrella_classic_top.png', preview='previews/umbrellas/umbrella_classic_top.png', width=1.4, height=1.4, collision='circle'),
    dict(id='umbrella_striped_top', family='umbrella', label='Ombrellone rigato', folder='umbrellas', file='umbrellas/umbrella_striped_top.png', preview='previews/umbrellas/umbrella_striped_top.png', width=1.4, height=1.4, collision='circle'),
    dict(id='umbrella_premium_top', family='umbrella', label='Ombrellone premium', folder='umbrellas', file='umbrellas/umbrella_premium_top.png', preview='previews/umbrellas/umbrella_premium_top.png', width=1.6, height=1.6, collision='circle'),
    dict(id='palm_large_top', family='palm', label='Palma grande', folder='palms', file='palms/palm_large_top.png', preview='previews/palms/palm_large_top.png', width=1.35, height=1.35, collision='circle', palmScaleGroup='large'),
    dict(id='palm_medium_top', family='palm', label='Palma media', folder='palms', file='palms/palm_medium_top.png', preview='previews/palms/palm_medium_top.png', width=1.15, height=1.15, collision='circle', palmScaleGroup='medium'),
    dict(id='palm_small_top', family='palm', label='Palma piccola / palmetta', folder='palms', file='palms/palm_small_top.png', preview='previews/palms/palm_small_top.png', width=0.9, height=0.9, collision='circle', palmScaleGroup='small'),
    dict(id='sunbed_top', family='furniture', label='Lettino top-down', folder='furniture', file='furniture/sunbed_top.png', preview='previews/furniture/sunbed_top.png', width=0.8, height=1.9, collision='rect'),
    dict(id='deck_chair_top', family='furniture', label='Sdraio top-down', folder='furniture', file='furniture/deck_chair_top.png', preview='previews/furniture/deck_chair_top.png', width=0.7, height=1.5, collision='rect'),
    dict(id='chair_top', family='furniture', label='Sedia top-down', folder='furniture', file='furniture/chair_top.png', preview='previews/furniture/chair_top.png', width=0.55, height=0.55, collision='rect'),
    dict(id='table_top', family='furniture', label='Tavolino top-down', folder='furniture', file='furniture/table_top.png', preview='previews/furniture/table_top.png', width=0.7, height=0.7, collision='circle'),
    dict(id='walkway_wood_tile', family='walkway', label='Passerella legno', folder='walkways', file='walkways/walkway_wood_tile.png', preview='previews/walkways/walkway_wood_tile.png', width=1.2, height=2.0, collision='rect', moduleLengthM=2.0),
    dict(id='walkway_bamboo_tile', family='walkway', label='Passerella bamboo', folder='walkways', file='walkways/walkway_bamboo_tile.png', preview='previews/walkways/walkway_bamboo_tile.png', width=1.1, height=1.8, collision='rect', moduleLengthM=1.8),
    dict(id='walkway_modular_tile', family='walkway', label='Pedana modulare', folder='walkways', file='walkways/walkway_modular_tile.png', preview='previews/walkways/walkway_modular_tile.png', width=1.2, height=1.2, collision='rect', moduleLengthM=1.2),
]


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 96
    bpy.context.scene.view_settings.view_transform = 'Filmic'
    bpy.context.scene.view_settings.look = 'Medium High Contrast'
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.world = bpy.data.worlds.new('World') if not bpy.context.scene.world else bpy.context.scene.world
    bpy.context.scene.world.color = (1, 1, 1)

    cam_data = bpy.data.cameras.new('Camera')
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = (0, 0, 7.5)
    cam.rotation_euler = Euler((0, 0, 0), 'XYZ')
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 3.2
    bpy.context.scene.camera = cam

    light_data = bpy.data.lights.new('Key softbox', 'AREA')
    light = bpy.data.objects.new('Key softbox', light_data)
    bpy.context.collection.objects.link(light)
    light.location = (-2.6, -3.2, 5.0)
    light.data.energy = 420
    light.data.size = 5.0


def mat(name, color, roughness=0.7):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = roughness
    return m


def add_cylinder(name, radius, depth, loc, material, vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    return obj


def add_cube(name, loc, scale, material, rot_z=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=(0, 0, rot_z))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    bevel = obj.modifiers.new('soft bevel', 'BEVEL')
    bevel.width = min(scale[0], scale[1]) * 0.08
    bevel.segments = 5
    obj.modifiers.new('weighted normals', 'WEIGHTED_NORMAL')
    return obj


def add_leaf(angle, length, width, z, material, offset=0.18):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=12, location=(math.cos(angle)*offset, math.sin(angle)*offset, z), rotation=(0, 0, angle))
    obj = bpy.context.object
    obj.name = 'palm leaf'
    obj.scale = (width, length, 0.045)
    obj.data.materials.append(material)
    return obj


def add_shadow_blob(scale=(1.3, 1.3, 0.02), alpha=0.22):
    m = mat('soft transparent shadow', PALETTE['sand_shadow'])
    m.blend_method = 'BLEND'
    add_cylinder('soft shadow', 0.5, 0.01, (0.08, -0.08, -0.05), m, vertices=96).scale = scale


def build_umbrella(kind):
    add_shadow_blob((1.7, 1.55, 0.02), 0.2)
    canvas = mat('canvas coral', PALETTE['canvas'])
    light = mat('canvas cream', PALETTE['white'])
    blue = mat('canvas muted blue', PALETTE['canvas_blue'])
    dark = mat('canvas dark', PALETTE['canvas_dark'])
    rib = mat('rib', (0.76, 0.68, 0.58, 1))
    pole = mat('pole', PALETTE['metal'])

    radius = 0.72 if kind != 'premium' else 0.82
    add_cylinder('umbrella canopy base', radius, 0.12, (0, 0, 0.08), light if kind == 'classic' else canvas, 96)
    if kind == 'striped':
        for i in range(10):
            angle = i * math.tau / 10
            color = blue if i % 2 else light
            add_cube('stripe rib', (math.cos(angle)*0.22, math.sin(angle)*0.22, 0.17), (0.04, radius*1.1, 0.035), color, angle)
    elif kind == 'premium':
        add_cylinder('premium inner', radius*0.66, 0.04, (0, 0, 0.18), dark, 96)
        add_cylinder('premium cap', radius*0.28, 0.05, (0, 0, 0.23), light, 96)

    for i in range(12):
        angle = i * math.tau / 12
        add_cube('subtle rib', (math.cos(angle)*0.2, math.sin(angle)*0.2, 0.24), (0.018, radius*1.15, 0.025), rib, angle)
    add_cylinder('center hub', 0.055, 0.18, (0, 0, 0.31), pole, 48)


def build_palm(size):
    scale = {'large': 1.15, 'medium': 0.98, 'small': 0.76}[size]
    add_shadow_blob((1.25*scale, 1.15*scale, 0.02), 0.2)
    leaf = mat('leaf', PALETTE['leaf'])
    leaf_light = mat('leaf light', PALETTE['leaf_light'])
    leaf_dark = mat('leaf dark', PALETTE['leaf_dark'])
    trunk = mat('trunk', PALETTE['wood'])
    count = {'large': 11, 'medium': 9, 'small': 7}[size]
    for i in range(count):
        angle = i * math.tau / count + (0.08 if i % 2 else 0)
        material = [leaf, leaf_light, leaf_dark][i % 3]
        add_leaf(angle, 0.47*scale, 0.105*scale, 0.08 + i*0.006, material, 0.16*scale)
    add_cylinder('top trunk', 0.12*scale, 0.16, (0, 0, 0.11), trunk, 32)
    add_cylinder('heart', 0.08*scale, 0.13, (0, 0, 0.24), leaf_dark, 32)


def build_furniture(kind):
    wood = mat('wood', PALETTE['wood'])
    wood_light = mat('wood light', PALETTE['wood_light'])
    fabric = mat('fabric', PALETTE['fabric'])
    fabric_shadow = mat('fabric shadow', PALETTE['fabric_shadow'])
    metal = mat('metal', PALETTE['metal'])
    add_shadow_blob((1.2, 1.6, 0.02), 0.16)
    if kind == 'sunbed':
        add_cube('sunbed frame', (0, 0, 0.04), (0.62, 1.45, 0.08), wood)
        add_cube('sunbed cushion', (0, 0.05, 0.13), (0.5, 1.23, 0.08), fabric)
        add_cube('sunbed head', (0, 0.58, 0.21), (0.5, 0.34, 0.08), fabric_shadow)
        for x in (-0.28, 0.28): add_cube('leg', (x, -0.55, 0.0), (0.06, 0.28, 0.06), metal)
    elif kind == 'deck_chair':
        add_cube('deck frame', (0, 0, 0.04), (0.58, 1.2, 0.06), wood)
        add_cube('deck fabric lower', (0, -0.16, 0.13), (0.45, 0.72, 0.06), fabric)
        add_cube('deck fabric back', (0, 0.38, 0.18), (0.45, 0.5, 0.08), fabric_shadow)
    elif kind == 'chair':
        add_cube('chair seat', (0, -0.04, 0.09), (0.5, 0.44, 0.09), fabric)
        add_cube('chair back', (0, 0.24, 0.16), (0.52, 0.13, 0.16), wood)
        for x in (-0.22, 0.22):
            for y in (-0.2, 0.16): add_cube('chair leg', (x, y, 0.02), (0.055, 0.055, 0.08), wood)
    elif kind == 'table':
        add_cylinder('table top', 0.34, 0.08, (0, 0, 0.12), wood_light, 64)
        add_cylinder('table center', 0.08, 0.12, (0, 0, 0.03), wood, 32)


def build_walkway(kind):
    wood = mat('wood', PALETTE['wood'])
    wood_light = mat('wood light', PALETTE['wood_light'])
    bamboo = mat('bamboo', PALETTE['bamboo'])
    dark = mat('groove', (0.35, 0.24, 0.15, 1))
    add_shadow_blob((1.05, 1.55, 0.02), 0.12)
    if kind == 'wood':
        for i, x in enumerate([-0.36, -0.18, 0, 0.18, 0.36]):
            add_cube('wood plank', (x, 0, 0.06), (0.15, 1.35, 0.09), wood_light if i % 2 else wood)
    elif kind == 'bamboo':
        for i, x in enumerate([-0.38, -0.23, -0.08, 0.08, 0.23, 0.38]):
            add_cube('bamboo slat', (x, 0, 0.06), (0.11, 1.2, 0.08), bamboo)
            for y in (-0.32, 0.32): add_cube('bamboo node', (x, y, 0.12), (0.115, 0.025, 0.025), dark)
    else:
        for x in (-0.25, 0.25):
            for y in (-0.25, 0.25): add_cube('deck module', (x, y, 0.07), (0.46, 0.46, 0.1), wood_light)
        add_cube('deck groove x', (0, 0, 0.14), (1.0, 0.035, 0.025), dark)
        add_cube('deck groove y', (0, 0, 0.14), (0.035, 1.0, 0.025), dark)


def build(asset):
    reset_scene()
    fid = asset['id']
    if fid == 'umbrella_classic_top': build_umbrella('classic')
    elif fid == 'umbrella_striped_top': build_umbrella('striped')
    elif fid == 'umbrella_premium_top': build_umbrella('premium')
    elif fid == 'palm_large_top': build_palm('large')
    elif fid == 'palm_medium_top': build_palm('medium')
    elif fid == 'palm_small_top': build_palm('small')
    elif fid == 'sunbed_top': build_furniture('sunbed')
    elif fid == 'deck_chair_top': build_furniture('deck_chair')
    elif fid == 'chair_top': build_furniture('chair')
    elif fid == 'table_top': build_furniture('table')
    elif fid == 'walkway_wood_tile': build_walkway('wood')
    elif fid == 'walkway_bamboo_tile': build_walkway('bamboo')
    elif fid == 'walkway_modular_tile': build_walkway('modular')
    else: raise ValueError(fid)


def render_png(path, resolution):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.resolution_x = resolution
    bpy.context.scene.render.resolution_y = resolution
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.image_settings.color_mode = 'RGBA'
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def main():
    for base in [APP_OUT, LAB_OUT]:
        base.mkdir(parents=True, exist_ok=True)
    manifest = []
    for asset in ASSETS:
        build(asset)
        render_png(APP_OUT / asset['file'], 512)
        render_png(APP_OUT / asset['preview'], 256)
        shutil.copy2(APP_OUT / asset['file'], LAB_OUT / Path(asset['file']).name)
        item = {
            'id': asset['id'],
            'family': asset['family'],
            'label': asset['label'],
            'projection': 'top_down',
            'file': asset['file'],
            'previewFile': asset['preview'],
            'defaultWidthM': asset['width'],
            'defaultHeightM': asset['height'],
            'collisionShape': asset['collision'],
            'source': 'self_generated_blender_codex',
            'license': 'project_owned',
            'requiresAttribution': False,
            'qualityStatus': 'approved',
            'visualStyle': 'top_down',
            'approvedForCanvas': False,
            'approvedForLibraryPreview': True,
        }
        if 'moduleLengthM' in asset: item['moduleLengthM'] = asset['moduleLengthM']
        if 'palmScaleGroup' in asset: item['palmScaleGroup'] = asset['palmScaleGroup']
        manifest.append(item)
    (APP_OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    LAB_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    LAB_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Generated {len(manifest)} Beach BDF proprietary assets into {APP_OUT}')


if __name__ == '__main__':
    main()
