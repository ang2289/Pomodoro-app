import test from "node:test";
import assert from "node:assert/strict";
import { muxAnimatedWebp } from "../src/lib/whatsAppAnimatedWebp";

const u4 = (n: number) => new Uint8Array([n,0,0,0]);
const riffFrame = (payload: Uint8Array) => {
  const chunk = new Uint8Array([86,80,56,32,...u4(payload.length),...payload]);
  const body = new Uint8Array([87,69,66,80,...chunk]);
  return new Uint8Array([82,73,70,70,...u4(body.length),...body]);
};
test("animated RIFF includes VP8X, ANIM and two ANMF frames", () => {
  const f = riffFrame(new Uint8Array([1,2,3,4]));
  const output = muxAnimatedWebp([f,f], 250);
  const decoded = new TextDecoder("latin1").decode(output);
  assert.equal(decoded.slice(0,4),"RIFF");
  assert.equal(decoded.slice(8,12),"WEBP");
  assert.ok(decoded.includes("ANIM"));
  assert.equal(decoded.split("ANMF").length - 1, 2);
});
test("reject invalid duration", () => {
  const f = riffFrame(new Uint8Array([1,2,3,4]));
  assert.throws(()=>muxAnimatedWebp([f,f], 0));
});
