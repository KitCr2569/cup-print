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
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Check,
  ChevronsDown,
  ChevronsUp,
  Copy,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Italic,
  Maximize2,
  Palette,
  PaintBucket,
  Redo2,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  printPixels,
  type ProductTemplate,
} from "@/lib/design/product-config";
import type { PrintOptionType, PrintPlacement } from "@/lib/design/print-option";
import { EditorHistory } from "@/lib/design/editor-history";
import { DEFAULT_FONT_FAMILY, EDITOR_FONTS } from "@/lib/design/editor-fonts";
import LayerPanel, { type EditorLayer } from "./layer-panel";
import { useDesign } from "./design-provider";

const WORKING_WIDTH = 800;
const DEFAULT_ADJUSTMENTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  opacity: 100,
};
const COLOR_PALETTE = [
  "#1f3d35", "#315c50", "#557d6c", "#8fae9b",
  "#fffdf8", "#f4ead9", "#e8d7bd", "#c9a97a",
  "#df5f36", "#e8a178", "#f2c9a0", "#b0453a",
  "#2f4858", "#4a6fa5", "#8aa7c4", "#c9d7e6",
  "#5c4a72", "#9b7aa8", "#d8c3de", "#1a1a1a",
];
const FALLBACK_FILL = "#315c50";

type Adjustments = typeof DEFAULT_ADJUSTMENTS;

export default function DesignEditor({
  template,
  printOption,
  placement,
}: {
  template: ProductTemplate;
  printOption: PrintOptionType;
  placement: PrintPlacement | null;
}) {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const notifyRef = useRef<(() => void) | null>(null);
  const historyRef = useRef(new EditorHistory());
  const isRestoringRef = useRef(false);
  const { setTextureCanvas, publishChange, registerExporter } = useDesign();
  const [background, setBackground] = useState("#fffdf8");
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedIsImage, setSelectedIsImage] = useState(false);
  const [selectedIsText, setSelectedIsText] = useState(false);
  const [selectionAngle, setSelectionAngle] = useState(0);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [colorOpen, setColorOpen] = useState(false);
  const [activeFill, setActiveFill] = useState(FALLBACK_FILL);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILY);
  const [fontSize, setFontSize] = useState(38);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
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

    const refreshLayers = () => {
      setLayers(
        canvas.getObjects().map((object, index) => ({
          index,
          label: describeLayer(object),
          kind: layerKind(object),
          isVisible: object.visible !== false,
          isLocked: object.selectable === false,
        })),
      );
    };

    const record = () => {
      if (isRestoringRef.current) return;
      historyRef.current.push(JSON.stringify(canvas.toJSON()));
      setHistoryState(historyRef.current.state());
    };

    const syncPreview = () => {
      setTextureCanvas(
        createMugWrapTexture(canvas.toCanvasElement(1), template, printOption, placement),
      );
      publishChange(canvas.toJSON() as Record<string, unknown>);
      refreshLayers();
    };

    const notify = () => {
      syncPreview();
      record();
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
      const objectIndex = active ? canvas.getObjects().indexOf(active) : -1;
      setHasSelection(Boolean(active));
      setActiveIndex(objectIndex >= 0 ? objectIndex : null);
      setSelectionAngle(Math.round(active?.angle ?? 0));
      const isImage = active instanceof FabricImage;
      setSelectedIsImage(isImage);
      const isText = active instanceof Textbox;
      setSelectedIsText(isText);
      if (active) {
        setActiveFill(readFillColor(active));
        if (active.visible === false) {
          setActiveFill(FALLBACK_FILL);
        }
      }
      if (isText) {
        const text = active as Textbox;
        setFontFamily(typeof text.fontFamily === "string" ? text.fontFamily : DEFAULT_FONT_FAMILY);
        setFontSize(Math.round(text.fontSize ?? 38));
        setIsBold(String(text.fontWeight) === "bold" || Number(text.fontWeight) >= 600);
        setIsItalic(text.fontStyle === "italic");
        setTextAlign(normalizeTextAlign(text.textAlign));
      }
      if (isImage) {
        setAdjustments(readImageAdjustments(active));
        setColorOpen(false);
        return;
      }
      setAdjustOpen(false);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      if (!active) setColorOpen(false);
    };

    canvas.on("object:added", notify);
    canvas.on("object:modified", notify);
    canvas.on("object:removed", notify);
    canvas.on("text:changed", syncPreview);
    canvas.on("text:editing:exited", notify);
    canvas.on("object:rotating", selection);
    canvas.on("selection:created", selection);
    canvas.on("selection:updated", selection);
    canvas.on("selection:cleared", selection);

    const starter = new Textbox("เรื่องราวของคุณ", {
      left: 270,
      top: 155,
      width: 260,
      fontSize: 40,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: "bold",
      textAlign: "center",
      fill: "#315c50",
    });
    canvas.add(starter);
    canvas.setActiveObject(starter);
    canvas.renderAll();
    historyRef.current.push(JSON.stringify(canvas.toJSON()));
    setHistoryState(historyRef.current.state());
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function restore(snapshot: string) {
    const canvas = fabricRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    historyRef.current.beginRestore();
    try {
      await canvas.loadFromJSON(snapshot);
      canvas.renderAll();
      setActiveIndex(null);
      setHasSelection(false);
      setColorOpen(false);
      setAdjustOpen(false);
      setTextureCanvas(
        createMugWrapTexture(canvas.toCanvasElement(1), template, printOption, placement),
      );
      publishChange(canvas.toJSON() as Record<string, unknown>);
      setLayers(
        canvas.getObjects().map((object, index) => ({
          index,
          label: describeLayer(object),
          kind: layerKind(object),
          isVisible: object.visible !== false,
          isLocked: object.selectable === false,
        })),
      );
    } finally {
      historyRef.current.endRestore();
      isRestoringRef.current = false;
      setHistoryState(historyRef.current.state());
    }
  }

  function undo() {
    if (isRestoringRef.current) return;
    const snapshot = historyRef.current.undo();
    setHistoryState(historyRef.current.state());
    if (snapshot) void restore(snapshot);
  }

  function redo() {
    if (isRestoringRef.current) return;
    const snapshot = historyRef.current.redo();
    setHistoryState(historyRef.current.state());
    if (snapshot) void restore(snapshot);
  }

  function objectAt(index: number) {
    return fabricRef.current?.getObjects()[index];
  }

  function selectLayer(index: number) {
    const canvas = fabricRef.current;
    const object = objectAt(index);
    if (!canvas || !object) return;
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    setActiveIndex(index);
    setHasSelection(true);
  }

  function toggleLayerVisible(index: number) {
    const canvas = fabricRef.current;
    const object = objectAt(index);
    if (!canvas || !object) return;
    const nextVisible = object.visible === false;
    object.set({ visible: nextVisible, evented: nextVisible });
    if (!nextVisible && canvas.getActiveObject() === object) canvas.discardActiveObject();
    canvas.requestRenderAll();
    notifyRef.current?.();
  }

  function toggleLayerLock(index: number) {
    const canvas = fabricRef.current;
    const object = objectAt(index);
    if (!canvas || !object) return;
    const isLocked = object.selectable === false;
    object.set({
      selectable: isLocked,
      evented: isLocked,
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      hasControls: isLocked,
    });
    if (!isLocked && canvas.getActiveObject() === object) canvas.discardActiveObject();
    canvas.requestRenderAll();
    notifyRef.current?.();
  }

  function moveLayer(index: number, direction: "up" | "down") {
    const canvas = fabricRef.current;
    const object = objectAt(index);
    if (!canvas || !object) return;
    if (direction === "up") canvas.bringObjectForward(object);
    else canvas.sendObjectBackwards(object);
    canvas.requestRenderAll();
    const nextIndex = canvas.getObjects().indexOf(object);
    setActiveIndex(nextIndex);
    notifyRef.current?.();
  }

  function removeLayer(index: number) {
    const canvas = fabricRef.current;
    const object = objectAt(index);
    if (!canvas || !object) return;
    canvas.remove(object);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setHasSelection(false);
    setActiveIndex(null);
    notifyRef.current?.();
  }

  function bringToFront() {
    changeActive((object, canvas) => canvas.bringObjectToFront(object));
  }

  function sendToBack() {
    changeActive((object, canvas) => canvas.sendObjectToBack(object));
  }

  function bringForward() {
    changeActive((object, canvas) => canvas.bringObjectForward(object));
  }

  function sendBackward() {
    changeActive((object, canvas) => canvas.sendObjectBackwards(object));
  }

  function applyTextFormat(patch: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: "left" | "center" | "right";
  }) {
    setFontFamily(patch.fontFamily ?? fontFamily);
    setFontSize(patch.fontSize ?? fontSize);
    if (patch.fontWeight !== undefined) setIsBold(patch.fontWeight === "bold");
    if (patch.fontStyle !== undefined) setIsItalic(patch.fontStyle === "italic");
    if (patch.textAlign !== undefined) setTextAlign(patch.textAlign);
    changeActive((object) => {
      if (!(object instanceof Textbox)) return;
      object.set(patch);
      object.initDimensions();
    });
  }

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
      fontSize,
      fontFamily,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textAlign,
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
    setColorOpen(false);
    canvas.renderAll();
    historyRef.current.clear();
    setHistoryState({ canUndo: false, canRedo: false });
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

  function applyFill(color: string) {
    setActiveFill(color);
    changeActive((object) => object.set("fill", color));
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

  function centerActiveOnSide(side: "LEFT" | "RIGHT") {
    changeActive((object) => {
      object.set({
        left: WORKING_WIDTH * (side === "LEFT" ? 0.25 : 0.75),
        top: workingHeight / 2,
        originX: "center",
        originY: "center",
      });
      object.setCoords();
    });
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
        <button
          className={`tool-button${colorOpen ? " active" : ""}`}
          disabled={!hasSelection || selectedIsImage}
          onClick={() => setColorOpen((value) => !value)}
          title={selectedIsImage ? "รูปภาพใช้แถบ Image Adjust แทน" : "เปลี่ยนสีวัตถุ"}
        >
          <PaintBucket /><span>สี</span>
        </button>
        <span className="tool-divider" />
        <button className="tool-icon" disabled={!historyState.canUndo} onClick={undo} title="ย้อนกลับ (Ctrl+Z)"><Undo2 /></button>
        <button className="tool-icon" disabled={!historyState.canRedo} onClick={redo} title="ทำซ้ำ (Ctrl+Shift+Z)"><Redo2 /></button>
        <button className="tool-icon" disabled={!hasSelection} onClick={duplicate} title="ทำสำเนา"><Copy /></button>
        <button className="tool-icon danger" disabled={!hasSelection} onClick={remove} title="ลบ"><Trash2 /></button>
        <label className="color-input" title="สีพื้นหลัง"><input type="color" value={background} onChange={(event) => changeBackground(event.target.value)} /><i style={{ background }} /></label>
      </div>

      <div className="transform-toolbar" aria-label="ลำดับวัตถุ">
        <button disabled={!hasSelection} onClick={bringToFront} title="ไปข้างหน้าสุด"><ChevronsUp /> หน้าสุด</button>
        <button disabled={!hasSelection} onClick={bringForward} title="เลื่อนไปข้างหน้า 1 ชั้น"><ArrowUp /> ขึ้น</button>
        <button disabled={!hasSelection} onClick={sendBackward} title="เลื่อนไปข้างหลัง 1 ชั้น"><ArrowDown /> ลง</button>
        <button disabled={!hasSelection} onClick={sendToBack} title="ไปหลังสุด"><ChevronsDown /> หลังสุด</button>
      </div>

      <div className="transform-toolbar" aria-label="เครื่องมือปรับวัตถุ">
        <button disabled={!hasSelection} onClick={() => scaleActive(1.1)} title="ขยาย"><ZoomIn /></button>
        <button disabled={!hasSelection} onClick={() => scaleActive(0.9)} title="ย่อ"><ZoomOut /></button>
        <button disabled={!hasSelection} onClick={() => rotateActive(-5)} title="หมุนซ้าย"><RotateCcw /></button>
        <button disabled={!hasSelection} onClick={() => rotateActive(5)} title="หมุนขวา"><RotateCw /></button>
        <button disabled={!hasSelection} onClick={centerActive}>Center</button>
        {printOption==="TWO_SIDES"&&<><button disabled={!hasSelection} onClick={()=>centerActiveOnSide("LEFT")}>กลางซ้าย</button><button disabled={!hasSelection} onClick={()=>centerActiveOnSide("RIGHT")}>กลางขวา</button></>}
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

      {selectedIsText && (
        <div className="text-format-panel" role="group" aria-label="รูปแบบตัวอักษร">
          <label className="text-font">
            <span>ฟอนต์</span>
            <select id="text-font-family" value={fontFamily} onChange={(event) => applyTextFormat({ fontFamily: event.target.value })}>
              {EDITOR_FONTS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
            </select>
          </label>
          <label className="text-size">
            <span>ขนาด</span>
            <input id="text-font-size" type="number" min={8} max={200} value={fontSize} onChange={(event) => applyTextFormat({ fontSize: Number(event.target.value) || 8 })} />
          </label>
          <button type="button" className={isBold ? "active" : ""} onClick={() => applyTextFormat({ fontWeight: isBold ? "normal" : "bold" })} title="ตัวหนา"><Bold /></button>
          <button type="button" className={isItalic ? "active" : ""} onClick={() => applyTextFormat({ fontStyle: isItalic ? "normal" : "italic" })} title="ตัวเอียง"><Italic /></button>
          <span className="tool-divider" />
          <button type="button" className={textAlign === "left" ? "active" : ""} onClick={() => applyTextFormat({ textAlign: "left" })} title="ชิดซ้าย"><AlignLeft /></button>
          <button type="button" className={textAlign === "center" ? "active" : ""} onClick={() => applyTextFormat({ textAlign: "center" })} title="กึ่งกลาง"><AlignCenter /></button>
          <button type="button" className={textAlign === "right" ? "active" : ""} onClick={() => applyTextFormat({ textAlign: "right" })} title="ชิดขวา"><AlignRight /></button>
        </div>
      )}

      {colorOpen && hasSelection && !selectedIsImage && (
        <div className="color-panel" role="group" aria-label="เลือกสีวัตถุ">
          <div className="color-swatches">
            {COLOR_PALETTE.map((color, index) => (
              <button
                key={color}
                type="button"
                id={`swatch-${index}`}
                className={activeFill.toLowerCase() === color ? "active" : ""}
                style={{ background: color }}
                title={color}
                aria-label={`สี ${color}`}
                onClick={() => applyFill(color)}
              />
            ))}
          </div>
          <label className="color-custom">
            <input
              id="custom-fill"
              type="color"
              value={activeFill}
              onChange={(event) => applyFill(event.target.value)}
            />
            <span>{activeFill.toUpperCase()}</span>
          </label>
          <button type="button" className="color-apply" onClick={applySelection}>
            <Check /> ใช้สีนี้
          </button>
        </div>
      )}

      {adjustOpen && selectedIsImage && (
        <div className="image-adjust-panel">
          <AdjustmentSlider label="ความสว่าง" value={adjustments.brightness} min={-50} max={50} onChange={(value) => adjustImage("brightness", value)} />
          <AdjustmentSlider label="คอนทราสต์" value={adjustments.contrast} min={-50} max={50} onChange={(value) => adjustImage("contrast", value)} />
          <AdjustmentSlider label="ความอิ่มสี" value={adjustments.saturation} min={-100} max={100} onChange={(value) => adjustImage("saturation", value)} />
          <AdjustmentSlider label="ความทึบ" value={adjustments.opacity} min={10} max={100} onChange={(value) => adjustImage("opacity", value)} />
          <button onClick={resetImageAdjustments}>คืนค่ารูป</button>
        </div>
      )}

      <div className="editor-stage">
        <div className="print-wrap">
          <div className="print-label bleed">BLEED</div>
          <div className="print-canvas" style={{ aspectRatio: `${template.print.widthCm}/${template.print.heightCm}` }}>
            <canvas ref={elementRef} />
            <div className="safe-guide" style={{ inset: `${(template.print.safeMarginCm / template.print.heightCm) * 100}% ${(template.print.safeMarginCm / template.print.widthCm) * 100}%` }}><span>SAFE AREA</span></div>
            {printOption==="TWO_SIDES"&&<div className="two-side-guides" aria-hidden="true"><div><span>ด้านซ้าย</span><b><i/>CENTER<br/>5 × 4.5 cm</b></div><em/><div><span>ด้านขวา</span><b><i/>CENTER<br/>15 × 4.5 cm</b></div></div>}
          </div>
          <div className="dimension width">{template.print.widthCm} cm</div>
          <div className="dimension height">{template.print.heightCm} cm</div>
        </div>
        <LayerPanel
          layers={layers}
          activeIndex={activeIndex}
          onSelect={selectLayer}
          onToggleVisible={toggleLayerVisible}
          onToggleLock={toggleLayerLock}
          onMove={moveLayer}
          onRemove={removeLayer}
        />
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

function layerKind(object: FabricObject): EditorLayer["kind"] {
  if (object instanceof Textbox) return "text";
  if (object instanceof FabricImage) return "image";
  return "shape";
}

function describeLayer(object: FabricObject): string {
  if (object instanceof Textbox) {
    const text = object.text.replace(/\s+/g, " ").trim();
    return text ? (text.length > 18 ? `${text.slice(0, 18)}…` : text) : "ข้อความ";
  }
  if (object instanceof FabricImage) return "รูปภาพ";
  if (object instanceof Rect) return "กราฟิก";
  return object.type ?? "วัตถุ";
}

function normalizeTextAlign(value: unknown): "left" | "center" | "right" {
  if (value === "left" || value === "right") return value;
  return "center";
}

function readFillColor(object: FabricObject) {
  const { fill } = object;
  return typeof fill === "string" ? fill : FALLBACK_FILL;
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
  printOption: PrintOptionType,
  placement: PrintPlacement | null,
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
  const baseX = (output.width - designCanvas.width) / 2;
  const quarterTurn = output.width / 4;
  const placementOffset = printOption === "ONE_SIDE" && placement === "LEFT" ? -quarterTurn : printOption === "ONE_SIDE" && placement === "RIGHT" ? quarterTurn : 0;
  context.drawImage(designCanvas, baseX + placementOffset, 0);
  return output;
}
