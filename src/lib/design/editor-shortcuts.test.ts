import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveEditorShortcut,
  shortcutRequiresSelection,
  type EditorShortcutInput,
} from "./editor-shortcuts";

function input(overrides: Partial<EditorShortcutInput> = {}): EditorShortcutInput {
  return {
    key: "",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    isTextEditing: false,
    isEditableTarget: false,
    ...overrides,
  };
}

test("undo and redo shortcuts", () => {
  assert.deepEqual(resolveEditorShortcut(input({ key: "z", ctrlKey: true })), { action: "undo" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "z", ctrlKey: true, shiftKey: true })), {
    action: "redo",
  });
  assert.deepEqual(resolveEditorShortcut(input({ key: "y", ctrlKey: true })), { action: "redo" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "z", metaKey: true })), { action: "undo" });
});

test("export shortcut uses Ctrl+S because Chrome captures Ctrl+E", () => {
  assert.deepEqual(resolveEditorShortcut(input({ key: "s", ctrlKey: true })), {
    action: "exportPrint",
  });
  assert.equal(resolveEditorShortcut(input({ key: "e", ctrlKey: true })), null);
});

test("plain keys add objects, delete selection and deselect", () => {
  assert.deepEqual(resolveEditorShortcut(input({ key: "t" })), { action: "addText" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "R" })), { action: "addShape" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "Delete" })), { action: "delete" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "Backspace" })), { action: "delete" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "Escape" })), { action: "deselect" });
  assert.deepEqual(resolveEditorShortcut(input({ key: "d", ctrlKey: true })), {
    action: "duplicate",
  });
});

test("layer order shortcuts use brackets", () => {
  assert.deepEqual(resolveEditorShortcut(input({ key: "]", ctrlKey: true })), {
    action: "bringForward",
  });
  assert.deepEqual(resolveEditorShortcut(input({ key: "[", ctrlKey: true })), {
    action: "sendBackward",
  });
  assert.deepEqual(resolveEditorShortcut(input({ key: "]", ctrlKey: true, shiftKey: true })), {
    action: "bringToFront",
  });
  assert.deepEqual(resolveEditorShortcut(input({ key: "[", ctrlKey: true, shiftKey: true })), {
    action: "sendToBack",
  });
});

test("nudge uses shift for larger steps", () => {
  assert.deepEqual(resolveEditorShortcut(input({ key: "ArrowUp" })), {
    action: "nudge",
    direction: "up",
    distance: 1,
  });
  assert.deepEqual(resolveEditorShortcut(input({ key: "ArrowLeft", shiftKey: true })), {
    action: "nudge",
    direction: "left",
    distance: 10,
  });
});

test("typing contexts never trigger shortcuts", () => {
  assert.equal(resolveEditorShortcut(input({ key: "Delete", isEditableTarget: true })), null);
  assert.equal(resolveEditorShortcut(input({ key: "t", isTextEditing: true })), null);
  assert.equal(
    resolveEditorShortcut(input({ key: "z", ctrlKey: true, isEditableTarget: true })),
    null,
  );
});

test("alt combinations are left for the browser or OS", () => {
  assert.equal(resolveEditorShortcut(input({ key: "t", altKey: true })), null);
  assert.equal(resolveEditorShortcut(input({ key: "z", ctrlKey: true, altKey: true })), null);
});

test("shift only plain keys do not add objects", () => {
  assert.equal(resolveEditorShortcut(input({ key: "T", shiftKey: true })), null);
  assert.equal(resolveEditorShortcut(input({ key: "r", shiftKey: true })), null);
});

test("selection dependent actions are flagged", () => {
  assert.equal(shortcutRequiresSelection("delete"), true);
  assert.equal(shortcutRequiresSelection("nudge"), true);
  assert.equal(shortcutRequiresSelection("undo"), false);
  assert.equal(shortcutRequiresSelection("addText"), false);
});
