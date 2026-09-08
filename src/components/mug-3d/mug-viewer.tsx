"use client";

import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshPhysicalMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useDesign } from "@/components/editor/design-provider";
import { CERAMIC_MUG_11OZ } from "@/lib/design/product-config";

// Production view: artwork center is opposite the handle. The handle is at +X,
// so the camera faces the printable center from -X and the handle stays behind.
const DESIGN_CENTER_CAMERA: [number, number, number] = [-6, 0.25, 0];
const CENTER_ADJUST_LIMIT = 45;

function clampDegrees(value: number) {
  return Math.max(-CENTER_ADJUST_LIMIT, Math.min(CENTER_ADJUST_LIMIT, Math.round(value)));
}

function CameraReset({ signal }: { signal: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...DESIGN_CENTER_CAMERA);
    camera.lookAt(0, 0, 0);
  }, [camera, signal]);
  return null;
}

function Mug({
  canvas,
  revision,
  centerOffsetDeg,
}: {
  canvas: HTMLCanvasElement | null;
  revision: number;
  centerOffsetDeg: number;
}) {
  const texture = useMemo(
    () => createTexture(canvas, revision, centerOffsetDeg),
    [canvas, revision, centerOffsetDeg],
  );
  useEffect(() => () => texture?.dispose(), [texture]);

  const { scene } = useGLTF("/models/mug-11oz.glb?v=7");
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const source = object.material as MeshPhysicalMaterial;
      const material = source.clone();
      if (object.name === "MugBodyPrint" && texture) {
        material.map = texture;
        material.color.set("#ffffff");
        material.roughness = 0.3;
        material.clearcoat = 0.2;
      }
      object.material = material;
    });
    return clone;
  }, [scene, texture]);

  useEffect(
    () => () => {
      model.traverse((object) => {
        if (object instanceof Mesh) {
          (object.material as MeshPhysicalMaterial).dispose();
        }
      });
    },
    [model],
  );

  return <primitive object={model} scale={26} />;
}

function createTexture(
  canvas: HTMLCanvasElement | null,
  revision: number,
  centerOffsetDeg: number,
) {
  void revision;
  if (!canvas) return null;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.anisotropy = 8;
  texture.wrapS = RepeatWrapping;
  const offset = CERAMIC_MUG_11OZ.uv.offsetX + centerOffsetDeg / 360;
  texture.offset.x = ((offset % 1) + 1) % 1;
  return texture;
}

export default function MugViewer() {
  const {
    textureCanvas,
    textureRevision,
    centerOffsetDeg,
    setCenterOffsetDeg,
  } = useDesign();
  const controls = useRef<OrbitControlsImpl>(null);
  const [reset, setReset] = useState(0);
  const setDegrees = (value: number) => setCenterOffsetDeg(clampDegrees(value));

  useEffect(() => {
    if (Math.abs(centerOffsetDeg) > CENTER_ADJUST_LIMIT) setCenterOffsetDeg(0);
  }, [centerOffsetDeg, setCenterOffsetDeg]);

  return (
    <section className="viewer-panel">
      <div className="panel-title">
        <div>
          <span>02</span>
          <div>
            <h2>ตัวอย่างบนแก้ว 3D</h2>
            <p>ลากเพื่อหมุน 360° • เลื่อนเพื่อซูม</p>
          </div>
        </div>
        <button
          className="ghost-button"
          onClick={() => {
            setReset((value) => value + 1);
            controls.current?.reset();
          }}
        >
          <RotateCcw /> รีเซ็ตมุม
        </button>
      </div>

      <div className="viewer-canvas">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: DESIGN_CENTER_CAMERA, fov: 32 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={["#f4f4f2"]} />
          <ambientLight intensity={1.45} />
          <directionalLight
            castShadow
            position={[-4, 7, 5]}
            intensity={3.2}
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[5, 2, -4]} intensity={1.8} />
          <directionalLight position={[0, -1, 5]} intensity={0.7} />
          <Mug
            canvas={textureCanvas}
            revision={textureRevision}
            centerOffsetDeg={centerOffsetDeg}
          />
          <ContactShadows
            position={[0, -1.36, 0]}
            opacity={0.26}
            scale={7}
            blur={3}
            far={4}
          />
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={false}
            minDistance={4}
            maxDistance={8}
            minPolarAngle={Math.PI * 0.38}
            maxPolarAngle={Math.PI * 0.62}
          />
          <CameraReset signal={reset} />
        </Canvas>
        <div className="viewer-hint">↔ ลากแก้วเพื่อดูรอบด้าน</div>
      </div>

      <div className="viewer-note">
        <div className="viewer-live">
          <span />
          <p>
            <b>Live Preview</b>
            <br />ลายจะอัปเดตทันทีเมื่อแก้ไข
          </p>
        </div>
        <div className="center-control">
          <label htmlFor="mug-center-offset">กึ่งกลางตรงข้ามหู</label>
          <button type="button" onClick={() => setDegrees(centerOffsetDeg - 1)} aria-label="เลื่อนลายไปทางซ้าย 1 องศา">−</button>
          <input
            id="mug-center-offset"
            type="range"
            min={-CENTER_ADJUST_LIMIT}
            max={CENTER_ADJUST_LIMIT}
            step="1"
            value={centerOffsetDeg}
            onChange={(event) => setDegrees(Number(event.target.value))}
          />
          <label className="degree-input">
            <input
              type="number"
              min={-CENTER_ADJUST_LIMIT}
              max={CENTER_ADJUST_LIMIT}
              step="1"
              value={centerOffsetDeg}
              onChange={(event) => setDegrees(Number(event.target.value))}
              aria-label="ตำแหน่งกึ่งกลางลายเป็นองศา"
            />
            <span>°</span>
          </label>
          <button type="button" onClick={() => setDegrees(centerOffsetDeg + 1)} aria-label="เลื่อนลายไปทางขวา 1 องศา">+</button>
          <button type="button" className="center-reset" onClick={() => setDegrees(0)}>คืนกลาง</button>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload("/models/mug-11oz.glb?v=7");
