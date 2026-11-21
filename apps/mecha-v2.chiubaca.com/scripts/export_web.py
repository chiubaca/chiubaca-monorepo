"""Run with Blender in background, opening winged_mech_rifle_97pct.blend."""
import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

parser = argparse.ArgumentParser()
parser.add_argument("project", type=Path, help="Path to the winged-mech Blender project")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
project = args.project.resolve()
assets = Path(__file__).resolve().parents[1] / "public/assets"
assets.mkdir(parents=True, exist_ok=True)
render = (project / "scripts/render.py").read_text().split('MODE = globals().get', 1)[0]
env = {}
exec(compile(render, "render.py", "exec"), env)
rig = env["rig"]


def trs(matrix):
    p, q, s = matrix.decompose()
    return [list(p), [q.x, q.y, q.z, q.w], list(s)]


poses = {}
for key, fn in [("hero", "apply_hero_pose"), ("rifle", "apply_rifle_pose"), ("flight", "apply_flying_pose")]:
    env[fn]()
    bpy.context.view_layer.update()
    poses[key] = {
        b.name: trs(b.parent.matrix.inverted() @ b.matrix if b.parent else rig.matrix_world @ b.matrix)
        for b in rig.pose.bones
    }
    if key == "flight":
        env["flight_plumes"](True)
        bpy.context.view_layer.update()
        plumes = [trs(o.matrix_world) for o in bpy.data.collections["FlightPlumes"].objects]

rig.data.pose_position = 'REST'
rig.location = (0, 0, 0)
rig.rotation_euler = (0, 0, 0)
env["set_knee"](False)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
parts = defaultdict(list)
part_bones = {}
separation = {}


def part_for(obj, bone):
    name = obj.name
    side = -1 if name.endswith("_R") or bone.endswith(".R") else 1
    suffix = "R" if side < 0 else "L"
    if bone == "Head" and name.startswith("Antenna_"):
        return f"Antenna_{suffix}", (side * .075, .015, .10)
    if bone == "Chest" and name.startswith(("Chest_Main_", "Chest_Deck_", "Vent_")):
        suffix = name.split("_")[2]
        side = -1 if suffix == "R" else 1
        return f"ChestShell_{suffix}", (side * .14, -.18, .055)
    if bone == "Shield.L" and name.startswith(("Shield_Hull", "Shield_Compass")):
        return "ShieldFace", (0, 0, 0)
    if bone.startswith("WingBinder"):
        return bone, (side * .25, .10, .10)
    return bone, None


for obj in bpy.data.collections["Mech"].objects:
    bone = obj.get("bone")
    if not bone:
        continue
    evaluated = obj.evaluated_get(dg)
    mesh = bpy.data.meshes.new_from_object(evaluated, preserve_all_data_layers=True, depsgraph=dg)
    mesh.transform(rig.data.bones[bone].matrix_local.inverted() @ evaluated.matrix_world)
    group, direction = part_for(obj, bone)
    part_bones[group] = bone
    if direction is not None:
        local = rig.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(direction)
        if group == "ShieldFace":
            shield = Matrix([rig["SH_rest"][i:i + 4] for i in range(0, 16, 4)])
            local = rig.data.bones[bone].matrix_local.to_3x3().inverted() @ (
                shield.to_3x3() @ Vector((.14, 0, 0))
            )
        separation[group] = list(local)
    part = bpy.data.objects.new(obj.name + "_web", mesh)
    bpy.context.scene.collection.objects.link(part)
    parts[group].append(part)

merged = []
for bone, objects in parts.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
    objects[0].name = "Part_" + bone
    merged.append(objects[0])

bpy.ops.object.select_all(action='DESELECT')
for obj in merged:
    obj.select_set(True)

# Replace unsupported procedural graph inputs with their Blender palette values.
for mat in {mat for obj in merged for mat in obj.data.materials if mat and mat.use_nodes}:
    nodes = mat.node_tree.nodes
    bsdf = next((node for node in nodes if node.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf:
        continue
    base = bsdf.inputs["Base Color"]
    if base.is_linked and not any(n.type == 'TEX_IMAGE' for n in nodes):
        ramp = next((n for n in nodes if n.type == 'VALTORGB'), None)
        if ramp:
            mat.node_tree.links.remove(base.links[0])
            base.default_value = ramp.color_ramp.elements[-1].color
    if mat.name.startswith("Glow_"):
        bsdf.inputs["Emission Strength"].default_value = min(2, bsdf.inputs["Emission Strength"].default_value)

bpy.ops.export_scene.gltf(filepath=str(assets / "vk07-systems.glb"), use_selection=True,
                          export_yup=False, export_animations=False)
(assets / "parts-rig.json").write_text(json.dumps({
    "parents": {b.name: b.parent.name if b.parent else None for b in rig.data.bones},
    "parts": part_bones, "separation": separation,
    "poses": poses, "plumes": plumes,
}, separators=(",", ":")))
