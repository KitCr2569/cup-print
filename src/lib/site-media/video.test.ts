import assert from "node:assert/strict";import test from "node:test";import {hasValidVideoSignature} from "./video";
test("accepts MP4 and WebM signatures",()=>{assert.equal(hasValidVideoSignature("video/mp4",new Uint8Array([0,0,0,24,102,116,121,112])),true);assert.equal(hasValidVideoSignature("video/webm",new Uint8Array([26,69,223,163])),true)});
test("rejects spoofed video",()=>{assert.equal(hasValidVideoSignature("video/mp4",new Uint8Array([26,69,223,163])),false);assert.equal(hasValidVideoSignature("video/quicktime",new Uint8Array([0,0,0,24,102,116,121,112])),false)});
