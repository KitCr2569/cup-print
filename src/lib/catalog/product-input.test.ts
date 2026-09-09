import assert from "node:assert/strict";
import test from "node:test";
import { parseProductInput } from "./product-input";
const valid={id:"new-mug",slug:"new-mug",name:"แก้วใหม่",description:"รายละเอียด",priceSatang:29900,categoryId:"123e4567-e89b-12d3-a456-426614174000",status:"COMING_SOON",sortOrder:10,editorType:"MUG_3D",accent:"#dce8d5",badge:"เร็ว ๆ นี้"};
test("accepts valid product",()=>assert.equal(parseProductInput(valid).id,"new-mug"));
test("rejects unsafe slug",()=>assert.throws(()=>parseProductInput({...valid,slug:"../admin"})));
test("rejects invalid price and color",()=>{assert.throws(()=>parseProductInput({...valid,priceSatang:-1}));assert.throws(()=>parseProductInput({...valid,accent:"red"}))});
test("rejects unknown status",()=>assert.throws(()=>parseProductInput({...valid,status:"PUBLIC"})));
