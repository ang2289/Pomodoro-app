import assert from "node:assert/strict";
import test from "node:test";
import { removeStickerWhiteBackground } from "../src/lib/stickerWhiteBackground";

function pixels(width: number, height: number, fill: [number, number, number, number] = [255, 255, 255, 255]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) data.set(fill, i * 4);
  return data;
}
function paint(data: Uint8ClampedArray, w: number, x: number, y: number, color: [number, number, number, number]) {
  data.set(color, (y * w + x) * 4);
}
function alpha(data: Uint8ClampedArray, w: number, x: number, y: number) {
  return data[(y * w + x) * 4 + 3];
}

test("clears bright border white but keeps a pastel light face", () => {
  const w=40,h=40,data=pixels(w,h);
  for(let y=12;y<28;y++) for(let x=12;x<28;x++) paint(data,w,x,y,[249,224,207,255]);
  const out=removeStickerWhiteBackground(data,w,h,"protect");
  assert.ok(out.removedPixels>0);
  assert.equal(alpha(data,w,0,0),0);
  assert.equal(alpha(data,w,18,18),255);
});

test("leaves originally transparent PNG untouched including white clothing", () => {
  const w=20,h=20,data=pixels(w,h);
  for(let i=0;i<200;i++) data[i*4+3]=0;
  const original=new Uint8ClampedArray(data);
  assert.equal(removeStickerWhiteBackground(data,w,h,"protect").skippedExistingTransparency,true);
  assert.deepEqual(data,original);
});

test("protect mode retains bright white area close to colored strokes while removing remote background", () => {
  const w=40,h=40,data=pixels(w,h);
  for(let y=15;y<25;y++) paint(data,w,16,y,[84,67,67,255]);
  const out=removeStickerWhiteBackground(data,w,h,"protect");
  assert.ok(out.removedPixels>0);
  assert.equal(alpha(data,w,18,19),255);
  assert.equal(alpha(data,w,39,39),0);
});

test("off mode changes no pixels", () => {
  const w=12,h=12,data=pixels(w,h);
  const original=new Uint8ClampedArray(data);
  assert.equal(removeStickerWhiteBackground(data,w,h,"off").removedPixels,0);
  assert.deepEqual(data,original);
});
