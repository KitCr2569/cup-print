"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  Square,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";

export type EditorLayer = {
  index: number;
  label: string;
  kind: "text" | "image" | "shape";
  isVisible: boolean;
  isLocked: boolean;
};

export default function LayerPanel({
  layers,
  activeIndex,
  onSelect,
  onToggleVisible,
  onToggleLock,
  onMove,
  onRemove,
}: {
  layers: EditorLayer[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onToggleVisible: (index: number) => void;
  onToggleLock: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onRemove: (index: number) => void;
}) {
  const ordered = [...layers].reverse();

  return (
    <div className="layer-panel" aria-label="เลเยอร์">
      <div className="layer-panel-head">
        <Layers />
        <span>เลเยอร์</span>
        <b>{layers.length}</b>
      </div>
      {ordered.length === 0 && <p className="layer-empty">ยังไม่มีวัตถุในงานออกแบบ</p>}
      <ul>
        {ordered.map((layer) => (
          <li
            key={layer.index}
            className={layer.index === activeIndex ? "active" : ""}
            data-layer-index={layer.index}
          >
            <button
              type="button"
              className="layer-name"
              onClick={() => onSelect(layer.index)}
              title={layer.label}
            >
              <LayerIcon kind={layer.kind} />
              <span>{layer.label}</span>
            </button>
            <div className="layer-actions">
              <button
                type="button"
                onClick={() => onMove(layer.index, "up")}
                title="เลื่อนขึ้น"
                aria-label={`เลื่อน ${layer.label} ขึ้น`}
              >
                <ChevronUp />
              </button>
              <button
                type="button"
                onClick={() => onMove(layer.index, "down")}
                title="เลื่อนลง"
                aria-label={`เลื่อน ${layer.label} ลง`}
              >
                <ChevronDown />
              </button>
              <button
                type="button"
                onClick={() => onToggleVisible(layer.index)}
                title={layer.isVisible ? "ซ่อน" : "แสดง"}
                aria-label={layer.isVisible ? `ซ่อน ${layer.label}` : `แสดง ${layer.label}`}
              >
                {layer.isVisible ? <Eye /> : <EyeOff />}
              </button>
              <button
                type="button"
                onClick={() => onToggleLock(layer.index)}
                title={layer.isLocked ? "ปลดล็อก" : "ล็อก"}
                aria-label={layer.isLocked ? `ปลดล็อก ${layer.label}` : `ล็อก ${layer.label}`}
              >
                {layer.isLocked ? <Lock /> : <Unlock />}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => onRemove(layer.index)}
                title="ลบ"
                aria-label={`ลบ ${layer.label}`}
              >
                <Trash2 />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LayerIcon({ kind }: { kind: EditorLayer["kind"] }) {
  if (kind === "text") return <Type />;
  if (kind === "image") return <ImageIcon />;
  return <Square />;
}
