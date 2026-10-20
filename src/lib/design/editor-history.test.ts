import test from "node:test";
import assert from "node:assert/strict";
import { EditorHistory } from "./editor-history";

test("undo returns previous snapshot and redo returns forward snapshot", () => {
  const history = new EditorHistory();
  history.push("a");
  history.push("b");
  history.push("c");
  assert.equal(history.undo(), "b");
  assert.equal(history.undo(), "a");
  assert.equal(history.undo(), null);
  assert.equal(history.redo(), "b");
  assert.equal(history.redo(), "c");
  assert.equal(history.redo(), null);
});

test("push after undo discards the redo branch", () => {
  const history = new EditorHistory();
  history.push("a");
  history.push("b");
  history.undo();
  history.push("c");
  assert.deepEqual(history.state(), { canUndo: true, canRedo: false });
  assert.equal(history.redo(), null);
});

test("repeated identical snapshots are ignored", () => {
  const history = new EditorHistory();
  history.push("a");
  history.push("a");
  assert.deepEqual(history.state(), { canUndo: false, canRedo: false });
});

test("snapshots pushed during a restore are ignored", () => {
  const history = new EditorHistory();
  history.push("a");
  history.push("b");
  history.beginRestore();
  history.push("restored");
  history.endRestore();
  assert.equal(history.undo(), "a");
});
