"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  Canvas,
  FabricImage,
  FabricObject,
  Rect,
  Textbox,
  filters,
} from "fabric";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Maximize2,
  Palette,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  printPixels,
  type ProductTemplate,
} from "@/lib/design/product-config";
import { useDesign } from "./design-provider";

const WORKING_WIDTH = 800;
const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  opacity: 100,
};

type Adjustments = typeof DEFAULT_ADJUSTMENTS;

export default function DesignEditor({
  template,
}: {
  template: ProductTemplate;
}) {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const notifyRef = useRef<(() => void) | null>(null);
  const { setTextureCanvas, publishChange, registerExporter } = useDesign();
  const [background, setBackground] = useState("#fffdf8");
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedIsImage, setSelectedIsImage] = useState(false);
  const [selectionAngle, setSelectionAngle] = useState(0);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const workingHeight = Math.round(
    (WORKING_WIDTH * template.print.heightCm) / template.print.widthCm,
  );
  const pixels = printPixels(template);

  useEffect(() => {
    if (!elementRef.current) return;
    const canvas = new Canvas(elementRef.current, {
      width: WORKING_WIDTH,
      height: workingHeight,
      backgroundColor: "#fffdf8",
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    const notify = () => {
      setTextureCanvas(
        createMugWrapTexture(canvas.toCanvasElement(1), template),
      );
      publishChange(canvas.toJSON() as Record<string, unknown>);
    };
    notifyRef.current = notify;

    registerExporter(async () => {
      const fabricJson = canvas.toJSON() as Record<string, unknown>;
      const previewUrl = canvas.toDataURL({
        format: "png",
        multiplier: 1,
        enableRetinaScaling: false,
      });
      const printUrl = canvas.toDataURL({
        format: "png",
        multiplier: pixels.width / WORKING_WIDTH,
        enableRetinaScaling: false,
      });
      const [preview, print] = await Promise.all([
        fetch(previewUrl).then((response) => response.blob()),
        fetch(printUrl).then((response) => response.blob()),
      ]);
      return {
        fabricJson,
        preview,
        print,
        printWidth: pixels.width,
        printHeight: pixels.height,
      };
    });

    const selection = () => {
      const active = canvas.getActiveObject();
      setHasSelection(Boolean(active));
      setSelectionAngle(Math.round(active?.angle ?? 0));
      const isImage = active instanceof FabricImage;
      setSelectedIsImage(isImage);
      if (!isImage) {
        setAdjustOpen(false);
        setAdjustments(DEFAULT_ADJUSTMENTS);
        return;
      }
      setAdjustments(readImageAdjustments(active));
    };

    canvas.on("object:added", notify);
    canvas.on("object:modified", notify);
    canvas.on("object:removed", notify);
    canvas.on("object:rotating", selection);
    canvas.on("selection:created", selection);
    canvas.on("selection:updated", selection);
    canvas.on("selection:cleared", selection);

    const starter = new Textbox("เรื่องราวของคุณ", {
      left: 270,
      top: 155,
      width: 260,
      fontSize: 40,
      fontFamily: "Arial",
      fontWeight: "bold",
      textAlign: "center",
      fill: "#315c50",
    });
    canvas.add(starter);
    canvas.setActiveObject(starter);
    canvas.renderAll();
    selection();
    notify();

    return () => {
      registerExporter(null);
      setTextureCanvas(null);
      notifyRef.current = null;
      canvas.dispose();
      fabricRef.current = null;
    };
    // Fabric canvas must be created exactly once for this mounted editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(canvas: Canvas, object: FabricObject) {
    object.setCoords();
    canvas.requestRenderAll();
    setSelectionAngle(Math.round(object.angle ?? 0));
    notifyRef.current?.();
  }

  function changeActive(mutator: (object: FabricObject, canvas: Canvas) => void) {
    const canvas = fabricRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !object) return;
    mutator(object, canvas);
    commit(canvas, object);
  }

  function addText() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox("เพิ่มข้อความ", {
      left: 250,
      top: 160,
      width: 300,
      fontSize: 38,
      fontFamily: "Arial",
      textAlign: "center",
      fill: "#1f3d35",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const canvas = fabricRef.current;
    if (!file || !canvas) return;
    const url = URL.createObjectURL(file);
    try {
      const image = await FabricImage.fromURL(url);
      image.scaleToWidth(Math.min(330, image.width || 330));
      image.set({
        left: WORKING_WIDTH / 2 - image.getScaledWidth() / 2,
        top: workingHeight / 2 - image.getScaledHeight() / 2,
      });
      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.renderAll();
    } finally {
      URL.revokeObjectURL(url);
      event.target.value = "";
    }
  }

  async function duplicate() {
    const canvas = fabricRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !object) return;
    const clone = await object.clone();
    clone.set({ left: (object.left ?? 0) + 24, top: (object.top ?? 0) + 24 });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.renderAll();
  }

  function remove() {
    const canvas = fabricRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !object) return;
    canvas.remove(object);
    canvas.discardActiveObject();
    canvas.renderAll();
  }

  function reset() {
    const canvas = fabricRef.current;
    if (!canvas || !confirm("ล้างงานออกแบบทั้งหมดหรือไม่?")) return;
    canvas.getObjects().forEach((object) => canvas.remove(object));
    canvas.backgroundColor = "#fffdf8";
    setBackground("#fffdf8");
    setAdjustOpen(false);
    canvas.renderAll();
    notifyRef.current?.();
  }

  function changeBackground(color: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setBackground(color);
    canvas.backgroundColor = color;
    canvas.renderAll();
    notifyRef.current?.();
  }

  function addShape() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const shape = new Rect({
      left: 345,
      top: 155,
      width: 110,
      height: 110,
      rx: 24,
      ry: 24,
      fill: "#e8a178",
      angle: 8,
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  }

  function scaleActive(factor: number) {
    changeActive((object) => {
      object.set({
        scaleX: Math.max(0.02, (object.scaleX ?? 1) * factor),
        scaleY: Math.max(0.02, (object.scaleY ?? 1) * factor),
      });
    });
  }

  function rotateActive(delta: number) {
    changeActive((object) => {
      object.rotate(((object.angle ?? 0) + delta + 360) % 360);
    });
  }

  function setActiveAngle(angle: number) {
    const safeAngle = Number.isFinite(angle) ? angle : 0;
    setSelectionAngle(safeAngle);
    changeActive((object) => object.rotate(safeAngle));
  }

  function centerActive() {
    changeActive((object, canvas) => canvas.centerObject(object));
  }

  function fitActive() {
    changeActive((object, canvas) => {
      const marginX =
        (template.print.safeMarginCm / template.print.widthCm) * WORKING_WIDTH;
      const marginY =
        (template.print.safeMarginCm / template.print.heightCm) * workingHeight;
      const sourceWidth = Math.max(1, object.width ?? 1);
      const sourceHeight = Math.max(1, object.height ?? 1);
      const scale = Math.min(
        (WORKING_WIDTH - marginX * 2) / sourceWidth,
        (workingHeight - marginY * 2) / sourceHeight,
      );
      object.set({ scaleX: scale, scaleY: scale });
      canvas.centerObject(object);
    });
  }

  function flipActive(axis: "x" | "y") {
    changeActive((object) => {
      if (axis === "x") object.set("flipX", !object.flipX);
      else object.set("flipY", !object.flipY);
    });
  }

  function nudgeActive(left: number, top: number) {
    changeActive((object) => {
      object.set({
        left: (object.left ?? 0) + left,
        top: (object.top ?? 0) + top,
      });
    });
  }

  function applySelection() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    notifyRef.current?.();
  }

  function adjustImage(key: keyof Adjustments, value: number) {
    const canvas = fabricRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !(object instanceof FabricImage)) return;
    const next = { ...adjustments, [key]: value };
    setAdjustments(next);
    object.set("opacity", next.opacity / 100);
    object.filters = [
      new filters.Brightness({ brightness: next.brightness / 100 }),
      new filters.Contrast({ contrast: next.contrast / 100 }),
      new filters.Saturation({ saturation: next.saturation / 100 }),
    ];
    object.applyFilters();
    commit(canvas, object);
  }

  function resetImageAdjustments() {
    const canvas = fabricRef.current;
    const object = canvas?.getActiveObject();
    if (!canvas || !(object instanceof FabricImage)) return;
    setAdjustments(DEFAULT_ADJUSTMENTS);
    object.set("opacity", 1);
    object.filters = [];
    object.applyFilters();
    commit(canvas, object);
  }

  function exportPrint() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL({
      format: "png",
      multiplier: pixels.width / WORKING_WIDTH,
      enableRetinaScaling: false,
    });
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = `cup-story-${template.productId}-${pixels.width}x${pixels.height}.png`;
    anchor.click();
  }

  return (
    <section className="editor-panel">
      <div className="panel-title">
        <div>
          <span>01</span>
          <div>
            <h2>ออกแบบลายของคุณ</h2>
            <p>พื้นที่พิมพ์จริง {template.print.widthCm} × {template.print.heightCm} ซม.</p>
          </div>
        </div>
        <button className="ghost-button" onClick={reset}><RotateCcw /> เริ่มใหม่</button>
      </div>

      <div className="editor-toolbar">
        <label className="tool-button"><ImagePlus /><span>อัปโหลดรูป</span><input type="file" accept="image/png,image/jpeg" onChange={upload} /></label>
        <button className="tool-button" onClick={addText}><Type /><span>ข้อความ</span></button>
        <button className="tool-button" onClick={addShape}><Palette /><span>กราฟิก</span></button>
        <span className="tool-divider" />
        <button className="tool-icon" disabled={!hasSelection} onClick={duplicate} title="ทำสำเนา"><Copy /></button>
        <button className="tool-icon danger" disabled={!hasSelection} onClick={remove} title="ลบ"><Trash2 /></button>
        <label className="color-input" title="สีพื้นหลัง"><input type="color" value={background} onChange={(event) => changeBackground(event.target.value)} /><i style={{ background }} /></label>
      </div>

      <div className="transform-toolbar" aria-label="เครื่องมือปรับวัตถุ">
        <button disabled={!hasSelection} onClick={() => scaleActive(1.1)} title="ขยาย"><ZoomIn /></button>
        <button disabled={!hasSelection} onClick={() => scaleActive(0.9)} title="ย่อ"><ZoomOut /></button>
        <button disabled={!hasSelection} onClick={() => rotateActive(-5)} title="หมุนซ้าย"><RotateCcw /></button>
        <button disabled={!hasSelection} onClick={() => rotateActive(5)} title="หมุนขวา"><RotateCw /></button>
        <button disabled={!hasSelection} onClick={centerActive}>Center</button>
        <button disabled={!hasSelection} onClick={fitActive}><Maximize2 /> Fit</button>
        <button disabled={!hasSelection} onClick={() => flipActive("x")}><FlipHorizontal2 /> Mirror</button>
        <button disabled={!hasSelection} onClick={() => flipActive("y")} title="กลับด้านบนล่าง"><FlipVertical2 /></button>
        <button disabled={!hasSelection} onClick={() => nudgeActive(0, -5)} title="เลื่อนขึ้น"><ArrowUp /></button>
        <button disabled={!hasSelection} onClick={() => nudgeActive(0, 5)} title="เลื่อนลง"><ArrowDown /></button>
        <button disabled={!hasSelection} onClick={() => nudgeActive(-5, 0)} title="เลื่อนซ้าย"><ArrowLeft /></button>
        <button disabled={!hasSelection} onClick={() => nudgeActive(5, 0)} title="เลื่อนขวา"><ArrowRight /></button>
        <label className="object-angle"><input type="number" disabled={!hasSelection} value={selectionAngle} onChange={(event) => setActiveAngle(Number(event.target.value))} /><span>°</span></label>
        <button disabled={!hasSelection} onClick={applySelection} title="ยืนยัน"><Check /> ใช้ค่า</button>
        <button className={adjustOpen ? "active" : ""} disabled={!selectedIsImage} onClick={() => setAdjustOpen((value) => !value)}><SlidersHorizontal /> Image Adjust</button>
      </div>

      {adjustOpen && selectedIsImage && (
        <div className="image-adjust-panel">
          <AdjustmentSlider label="ความสว่าง" value={adjustments.brightness} min={-50} max={50} onChange={(value) => adjustImage("brightness", value)} />
          <AdjustmentSlider label="คอนทราสต์" value={adjustments.contrast} min={-50} max={50} onChange={(value) => adjustImage("contrast", value)} />
          <AdjustmentSlider label="ความอิ่มสี" value={adjustments.saturation} min={-100} max={100} onChange={(value) => adjustImage("saturation", value)} />
          <AdjustmentSlider label="ความทึบ" value={adjustments.opacity} min={10} max={100} onChange={(value) => adjustImage("opacity", value)} />
          <button onClick={resetImageAdjustments}>คืนค่ารูป</button>
        </div>
      )}

      <div className="print-wrap">
        <div className="print-label bleed">BLEED</div>
        <div className="print-canvas" style={{ aspectRatio: `${template.print.widthCm}/${template.print.heightCm}` }}>
          <canvas ref={elementRef} />
          <div className="safe-guide" style={{ inset: `${(template.print.safeMarginCm / template.print.heightCm) * 100}% ${(template.print.safeMarginCm / template.print.widthCm) * 100}%` }}><span>SAFE AREA</span></div>
        </div>
        <div className="dimension width">{template.print.widthCm} cm</div>
        <div className="dimension height">{template.print.heightCm} cm</div>
      </div>

      <div className="editor-footer">
        <p>ไฟล์พิมพ์ <b>{pixels.width} × {pixels.height} px</b> ที่ {template.print.dpi} DPI</p>
        <button className="download-button" onClick={exportPrint}><Download /> Export Print PNG</button>
      </div>
    </section>
  );
}

function AdjustmentSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input type="range" min={min} max={max} step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <b>{value}</b>
    </label>
  );
}

function readImageAdjustments(image: FabricImage): Adjustments {
  const brightness = image.filters.find((filter) => filter instanceof filters.Brightness);
  const contrast = image.filters.find((filter) => filter instanceof filters.Contrast);
  const saturation = image.filters.find((filter) => filter instanceof filters.Saturation);
  return {
    brightness: Math.round((brightness?.brightness ?? 0) * 100),
    contrast: Math.round((contrast?.contrast ?? 0) * 100),
    saturation: Math.round((saturation?.saturation ?? 0) * 100),
    opacity: Math.round((image.opacity ?? 1) * 100),
  };
}

function createMugWrapTexture(
  designCanvas: HTMLCanvasElement,
  template: ProductTemplate,
) {
  const circumference = Math.PI * template.mug.diameterCm;
  const wrapWidth = Math.round(
    (designCanvas.width * circumference) / template.print.widthCm,
  );
  const output = document.createElement("canvas");
  output.width = wrapWidth;
  output.height = designCanvas.height;
  const context = output.getContext("2d");
  if (!context) return designCanvas;
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, output.width, output.height);
  const gap = (output.width - designCanvas.width) / 2;
  context.drawImage(designCanvas, gap, 0);
  return output;
}
