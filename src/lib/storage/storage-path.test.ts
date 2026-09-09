import assert from "node:assert/strict";
import test from "node:test";
import { createObjectKey, validateObjectKey } from "./storage-path";

test("createObjectKey creates a normalized key", () => {
  assert.equal(
    createObjectKey("designs/design-123", "file-456", "PNG"),
    "designs/design-123/file-456.png",
  );
});

test("createObjectKey rejects unsafe folders", () => {
  assert.throws(
    () => createObjectKey("designs/../private", "file", "png"),
    /Invalid storage folder/,
  );
});

test("createObjectKey rejects unsafe extensions", () => {
  assert.throws(
    () => createObjectKey("designs/id", "file", "png.exe/"),
    /Invalid storage extension/,
  );
});

test("validateObjectKey accepts stored object keys", () => {
  assert.equal(
    validateObjectKey("payments/order-123/slip.jpg"),
    "payments/order-123/slip.jpg",
  );
});

test("validateObjectKey rejects traversal", () => {
  assert.throws(
    () => validateObjectKey("designs/../secret.png"),
    /Invalid storage path/,
  );
  assert.throws(
    () => validateObjectKey("/designs/secret.png"),
    /Invalid storage path/,
  );
});
