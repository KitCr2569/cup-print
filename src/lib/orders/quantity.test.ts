import assert from "node:assert/strict";
import test from "node:test";
import { parseQuantity } from "./quantity";

test("parseQuantity preserves valid integers", () => {
  assert.equal(parseQuantity(1), 1);
  assert.equal(parseQuantity("24"), 24);
  assert.equal(parseQuantity(100), 100);
});

test("parseQuantity clamps integers to order limits", () => {
  assert.equal(parseQuantity(-5), 1);
  assert.equal(parseQuantity(0), 1);
  assert.equal(parseQuantity(101), 100);
});

test("parseQuantity defaults invalid values", () => {
  assert.equal(parseQuantity("abc"), 1);
  assert.equal(parseQuantity(2.5), 1);
  assert.equal(parseQuantity(null), 1);
});
