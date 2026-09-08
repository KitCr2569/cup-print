import { writeFile, mkdir } from "node:fs/promises";
import {
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Scene,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  Vector2,
} from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

// GLTFExporter targets browsers; this minimal adapter supplies the Blob read it uses in Node.
globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
  async readAsDataURL(blob) {
    const bytes = Buffer.from(await blob.arrayBuffer());
    this.result = `data:${blob.type};base64,${bytes.toString("base64")}`;
    this.onloadend?.();
  }
};

// Dimensions use meters. The printable sleeve is a separate mesh with cylindrical UVs.
// Proportions traced from mug ref.mp4: a compact 11 oz cylinder with a soft
// base, a restrained lip, and a classic oval handle.
const mugHeight = 0.095;
const outerRadiusTop = 0.042;
const outerRadiusBottom = 0.042;
const printHeight = 0.09;

const ceramic = new MeshPhysicalMaterial({
  name: "MugCeramic",
  color: new Color("#fffdf8"),
  roughness: 0.2,
  metalness: 0,
  clearcoat: 0.32,
  clearcoatRoughness: 0.2,
});
const printMaterial = new MeshPhysicalMaterial({
  name: "MugBodyPrint",
  color: new Color("#ffffff"),
  roughness: 0.3,
  metalness: 0,
  clearcoat: 0.18,
});
const handleMaterial = ceramic.clone();
handleMaterial.name = "MugHandle";

const scene = new Scene();
scene.name = "CupStory_11oz";
const mug = new Group();
mug.name = "CeramicMug11oz";
scene.add(mug);

const shellProfile = [
  new Vector2(0.0382, -mugHeight / 2),
  new Vector2(0.0408, -mugHeight / 2 + 0.0014),
  new Vector2(outerRadiusBottom, -mugHeight / 2 + 0.0042),
  new Vector2(outerRadiusTop, mugHeight / 2 - 0.0034),
  new Vector2(0.0412, mugHeight / 2 - 0.0009),
  new Vector2(0.0396, mugHeight / 2),
];
const shell = new Mesh(new LatheGeometry(shellProfile, 128), ceramic);
shell.name = "MugCeramic";
mug.add(shell);

const printable = new Mesh(new CylinderGeometry(outerRadiusTop + 0.00012, outerRadiusBottom + 0.00012, printHeight, 128, 1, true), printMaterial);
printable.name = "MugBodyPrint";
printable.position.y = 0;
// Preserve CylinderGeometry's duplicated seam vertices and rotate the entire
// geometry so the seam is physically behind the mug (-Z). Rewriting UV values
// from positions collapses those duplicate vertices and creates a visible tear.
printable.geometry.rotateY(Math.PI);
mug.add(printable);

const rim = new Mesh(new TorusGeometry(outerRadiusTop - 0.00135, 0.00145, 24, 128), ceramic);
rim.name = "MugCeramic_Rim";
rim.rotation.x = Math.PI / 2;
rim.position.y = mugHeight / 2 - 0.0004;
mug.add(rim);

const inside = new Mesh(new CircleGeometry(outerRadiusTop - 0.0028, 128), ceramic.clone());
inside.name = "MugCeramic_Inside";
inside.material.color.set("#dedbd3");
inside.rotation.x = -Math.PI / 2;
inside.position.y = mugHeight / 2 - 0.0022;
mug.add(inside);

const base = new Mesh(new CircleGeometry(outerRadiusBottom, 128), ceramic);
base.name = "MugCeramic_Base";
base.rotation.x = Math.PI / 2;
base.position.y = -mugHeight / 2;
mug.add(base);

// Reference handle: a substantial, softly rounded D profile. The end points
// sit inside the ceramic shell so the joins read as fired ceramic rather than
// an open tube attached to the surface.
const handleCurve = new CatmullRomCurve3([
  new Vector3(0.0375, 0.0290, 0),
  new Vector3(0.0475, 0.0308, 0),
  new Vector3(0.0600, 0.0315, 0),
  new Vector3(0.0715, 0.0288, 0),
  new Vector3(0.0805, 0.0205, 0),
  new Vector3(0.0840, 0.0105, 0),
  new Vector3(0.0848, 0.0000, 0),
  new Vector3(0.0840, -0.0105, 0),
  new Vector3(0.0805, -0.0205, 0),
  new Vector3(0.0715, -0.0288, 0),
  new Vector3(0.0600, -0.0315, 0),
  new Vector3(0.0475, -0.0308, 0),
  new Vector3(0.0375, -0.0290, 0),
], false, "centripetal");
const handle = new Mesh(new TubeGeometry(handleCurve, 144, 0.0052, 32, false), handleMaterial);
handle.name = "MugHandle";
mug.add(handle);

// Keep the origin on the mug body's cylindrical axis. Including the handle in
// a bounding-box center would move the rotation pivot toward the handle.
scene.updateMatrixWorld(true);

const exporter = new GLTFExporter();
const data = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });
await mkdir(new URL("../public/models/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/models/mug-11oz.glb", import.meta.url), Buffer.from(data));
console.log(`Created public/models/mug-11oz.glb (${data.byteLength} bytes)`);
