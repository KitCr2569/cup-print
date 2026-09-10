import test from "node:test";import assert from "node:assert/strict";import {DEFAULT_MUG_TEMPLATE_SETTINGS,parseMugTemplateSettings} from "./product-template-input";
test("accepts valid mug template settings",()=>assert.deepEqual(parseMugTemplateSettings(DEFAULT_MUG_TEMPLATE_SETTINGS),DEFAULT_MUG_TEMPLATE_SETTINGS));
test("rejects unsafe mug dimensions",()=>assert.throws(()=>parseMugTemplateSettings({...DEFAULT_MUG_TEMPLATE_SETTINGS,diameterCm:0})));
test("rejects excessive DPI",()=>assert.throws(()=>parseMugTemplateSettings({...DEFAULT_MUG_TEMPLATE_SETTINGS,dpi:1200})));
