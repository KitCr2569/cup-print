import bpy
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = root / "public" / "models" / "mug-11oz.glb"
target = root / "assets" / "blender" / "mug-11oz.blend"
target.parent.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))

for obj in bpy.context.scene.objects:
    if obj.type == "MESH":
        obj.select_set(True)
        obj["cupstory_part"] = obj.name
        obj["print_size_cm"] = "20x9" if obj.name == "MugBodyPrint" else "not_printable"

bpy.context.scene["product_id"] = "ceramic-mug-11oz"
bpy.context.scene["print_width_cm"] = 20.0
bpy.context.scene["print_height_cm"] = 9.0
bpy.context.scene["print_dpi"] = 300
bpy.ops.wm.save_as_mainfile(filepath=str(target))
print(f"Saved {target}")
