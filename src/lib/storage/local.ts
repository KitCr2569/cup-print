import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
const ROOT=path.resolve(process.cwd(),"data","uploads");
export async function storeFile(folder:string,file:Blob,extension:string){const dir=path.join(ROOT,folder);await mkdir(dir,{recursive:true});const name=`${randomUUID()}.${extension.replace(/[^a-z0-9]/gi,"")}`;const full=path.join(dir,name);await writeFile(full,Buffer.from(await file.arrayBuffer()));return `${folder}/${name}`}
export async function loadFile(storagePath:string){const safe=storagePath.replace(/\\/g,"/");if(safe.includes("..")||safe.startsWith("/"))throw new Error("Invalid path");return readFile(path.join(ROOT,safe))}
