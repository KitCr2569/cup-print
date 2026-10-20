export type EditorShortcutAction =
  | "undo"
  | "redo"
  | "duplicate"
  | "delete"
  | "addText"
  | "addShape"
  | "bringToFront"
  | "bringForward"
  | "sendBackward"
  | "sendToBack"
  | "nudge"
  | "deselect"
  | "exportPrint";

export type NudgeDirection = "up" | "down" | "left" | "right";

export interface EditorShortcut {
  action: EditorShortcutAction;
  direction?: NudgeDirection;
  distance?: number;
}

export interface EditorShortcutInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  isTextEditing: boolean;
  isEditableTarget: boolean;
}

const NUDGE_DISTANCE = 1;
const NUDGE_DISTANCE_LARGE = 10;

const NUDGE_DIRECTIONS: Record<string, NudgeDirection> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
};

const SELECTION_ACTIONS: ReadonlySet<EditorShortcutAction> = new Set<EditorShortcutAction>([
  "duplicate",
  "delete",
  "bringToFront",
  "bringForward",
  "sendBackward",
  "sendToBack",
  "nudge",
  "deselect",
]);

export const EDITOR_SHORTCUT_HINTS: ReadonlyArray<{ keys: string; label: string }> = [
  { keys: "Ctrl + Z", label: "ย้อนกลับ" },
  { keys: "Ctrl + Shift + Z", label: "ทำซ้ำ" },
  { keys: "Ctrl + D", label: "ทำสำเนาวัตถุ" },
  { keys: "Delete", label: "ลบวัตถุ" },
  { keys: "Esc", label: "ยกเลิกการเลือก" },
  { keys: "T", label: "เพิ่มข้อความ" },
  { keys: "R", label: "เพิ่มกราฟิก" },
  { keys: "Ctrl + ]", label: "เลื่อนไปข้างหน้า 1 ชั้น" },
  { keys: "Ctrl + [", label: "เลื่อนไปข้างหลัง 1 ชั้น" },
  { keys: "Ctrl + Shift + ]", label: "ไปข้างหน้าสุด" },
  { keys: "Ctrl + Shift + [", label: "ไปหลังสุด" },
  { keys: "↑ ↓ ← →", label: "เลื่อนวัตถุ 1 px" },
  { keys: "Shift + ↑ ↓ ← →", label: "เลื่อนวัตถุ 10 px" },
  { keys: "Ctrl + S", label: "Export ไฟล์พิมพ์" },
];

export function shortcutRequiresSelection(action: EditorShortcutAction): boolean {
  return SELECTION_ACTIONS.has(action);
}

export function resolveEditorShortcut(input: EditorShortcutInput): EditorShortcut | null {
  if (input.isEditableTarget || input.isTextEditing) return null;
  const key = input.key.toLowerCase();
  const isModifierPressed = input.ctrlKey || input.metaKey;
  if (isModifierPressed) return resolveModifierShortcut(key, input);
  return resolvePlainShortcut(key, input);
}

function resolveModifierShortcut(key: string, input: EditorShortcutInput): EditorShortcut | null {
  if (input.altKey) return null;
  if (key === "z") return { action: input.shiftKey ? "redo" : "undo" };
  if (key === "y") return { action: "redo" };
  if (key === "d") return { action: "duplicate" };
  if (key === "s") return { action: "exportPrint" };
  return resolveLayerShortcut(key, input.shiftKey);
}

function resolveLayerShortcut(key: string, isShiftPressed: boolean): EditorShortcut | null {
  if (key === "]") return { action: isShiftPressed ? "bringToFront" : "bringForward" };
  if (key === "[") return { action: isShiftPressed ? "sendToBack" : "sendBackward" };
  if (key === "}") return { action: "bringToFront" };
  if (key === "{") return { action: "sendToBack" };
  return null;
}

function resolvePlainShortcut(key: string, input: EditorShortcutInput): EditorShortcut | null {
  if (input.altKey) return null;
  if (key === "delete" || key === "backspace") return { action: "delete" };
  if (key === "escape") return { action: "deselect" };
  if (key === "t" && !input.shiftKey) return { action: "addText" };
  if (key === "r" && !input.shiftKey) return { action: "addShape" };
  const direction = NUDGE_DIRECTIONS[key];
  if (!direction) return null;
  return {
    action: "nudge",
    direction,
    distance: input.shiftKey ? NUDGE_DISTANCE_LARGE : NUDGE_DISTANCE,
  };
}
