import { readFile } from "node:fs/promises";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";

const bytes = await readFile(new URL("../public/models/mug-11oz.glb", import.meta.url));
const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const gltf = await new GLTFLoader().parseAsync(data, "");
const rows = [];
gltf.scene.traverse((object) => {
  if (!object.isMesh) return;
  rows.push({
    mesh: object.name,
    material: object.material?.name,
    vertices: object.geometry.attributes.position?.count ?? 0,
    uv: object.geometry.attributes.uv?.count ?? 0,
  });
});
console.table(rows);
const bounds=new Box3().setFromObject(gltf.scene);console.log("bounds",bounds.min.toArray(),bounds.max.toArray(),"size",bounds.getSize(new Vector3()).toArray(),"center",bounds.getCenter(new Vector3()).toArray());
const printMesh=gltf.scene.getObjectByName("MugBodyPrint");
if(printMesh?.isMesh){const positions=printMesh.geometry.attributes.position,uvs=printMesh.geometry.attributes.uv;const directions=[["+X",1,0],["-X",-1,0],["+Z",0,1],["-Z",0,-1]];for(const [label,dx,dz] of directions){let best=0,score=-Infinity;for(let i=0;i<positions.count;i++){const value=positions.getX(i)*dx+positions.getZ(i)*dz;if(value>score){score=value;best=i}}console.log(`print UV ${label}:`,uvs.getX(best).toFixed(4),uvs.getY(best).toFixed(4))}const seam=[];for(let i=0;i<positions.count;i++){if(positions.getZ(i)<-.042&&Math.abs(positions.getX(i))<.00001)seam.push(uvs.getX(i))}if(!seam.some(u=>u<.01)||!seam.some(u=>u>.99))throw new Error("Printable seam is not duplicated behind the mug");console.log("rear seam UVs:",[...new Set(seam.map(u=>u.toFixed(4)))])}
for (const required of ["MugBodyPrint", "MugCeramic", "MugHandle"]) {
  if (!rows.some((row) => row.mesh === required && row.material === required && row.uv > 0)) {
    throw new Error(`Missing validated mesh/material/UV: ${required}`);
  }
}
console.log("GLB validation passed");
