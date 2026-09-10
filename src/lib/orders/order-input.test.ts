import assert from "node:assert/strict";import test from "node:test";import {parseOrderInput} from "./order-input";
const valid={designId:"123e4567-e89b-12d3-a456-426614174000",quantity:2,customerName:"สมชาย ใจดี",email:"a@b.com",phone:"081-234-5678",address:{line1:"1 ถนนสุขุมวิท",district:"คลองเตย",province:"กรุงเทพฯ",postalCode:"10110"}};
test("normalizes valid order",()=>assert.equal(parseOrderInput(valid).phone,"0812345678"));test("rejects invalid order",()=>assert.throws(()=>parseOrderInput({...valid,quantity:0})));
