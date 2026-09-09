import assert from "node:assert/strict";
import test from "node:test";
import { getAvailableProductById, getProductBySlug, printPixels, PRODUCT_CATALOG } from "./product-config";

test("catalog product identifiers are unique", () => {
  assert.equal(new Set(PRODUCT_CATALOG.map((product) => product.productId)).size, PRODUCT_CATALOG.length);
  assert.equal(new Set(PRODUCT_CATALOG.map((product) => product.slug)).size, PRODUCT_CATALOG.length);
});

test("only production-ready product resolves to an editor template", () => {
  assert.equal(getProductBySlug("ceramic-mug-11oz")?.status, "AVAILABLE");
  assert.equal(getProductBySlug("yeti-tumbler-20oz"), undefined);
  assert.equal(getAvailableProductById("classic-t-shirt"), undefined);
});

test("print dimensions use physical size and DPI", () => {
  assert.deepEqual(printPixels(getProductBySlug("ceramic-mug-11oz")!), { width: 2362, height: 1063 });
});
