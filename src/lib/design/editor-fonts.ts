export type EditorFont = {
  label: string;
  value: string;
  supportsThai: boolean;
};

/**
 * Canvas text needs a real font family name, so this list only contains
 * operating-system families. Everything here ships with Windows/macOS/Android,
 * which keeps Thai glyph coverage reliable without a network font fetch inside
 * the editor.
 */
export const EDITOR_FONTS: EditorFont[] = [
  { label: "Tahoma (ไทย)", value: "Tahoma", supportsThai: true },
  { label: "Leelawadee UI (ไทย)", value: "Leelawadee UI", supportsThai: true },
  { label: "Arial", value: "Arial", supportsThai: true },
  { label: "Verdana", value: "Verdana", supportsThai: true },
  { label: "Georgia", value: "Georgia", supportsThai: false },
  { label: "Times New Roman", value: "Times New Roman", supportsThai: false },
  { label: "Courier New", value: "Courier New", supportsThai: false },
];

export const DEFAULT_FONT_FAMILY = "Arial";
