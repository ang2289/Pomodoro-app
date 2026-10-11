import test from "node:test";
import assert from "node:assert/strict";
import {
  auditStickerFrames,
  requireDistinctLineFrames,
  type StickerFramePixels,
} from "../src/lib/animatedStickerFrameQuality";

function frame(shift = 0, empty = false): StickerFramePixels {
  const width = 320;
  const height = 270;
  const data = new Uint8ClampedArray(width * height * 4);
  if (!empty) {
    for (let y = 80; y < 185; y++) {
      for (let x = 55 + shift; x < 145 + shift; x++) {
        const k = (y * width + x) * 4;
        data[k] = 248; data[k + 1] = 145; data[k + 2] = 100;
        data[k + 3] = 255;
      }
    }
  }
  return { width, height, data };
}

test("rejects eight APNG frames that contain only four distinct images", () => {
  const shifts = [0, 2, 4, 6, 0, 2, 4, 0];
  const data = shifts.map((s) => frame(s));
  const result = auditStickerFrames(data);
  assert.equal(result.total, 8);
  assert.equal(result.distinct, 4);
  assert.deepEqual(result.duplicateIndices, [4, 5, 6, 7]);
  assert.throws(() => requireDistinctLineFrames(data, "06.png"), /06\.png.*4\/8/);
});

test("allows eight frames with five or more visibly different poses", () => {
  const data = [0, 2, 4, 6, 8, 4, 2, 0].map((s) => frame(s));
  assert.equal(requireDistinctLineFrames(data, "21.png").distinct, 5);
});

test("ignores random RGB differences in fully transparent pixels", () => {
  const a = frame();
  const b = frame();
  for (let index = 0; index < b.data.length; index += 4) {
    if (b.data[index + 3] === 0) b.data[index] = 200;
  }
  assert.equal(auditStickerFrames([a, b]).distinct, 1);
});

test("does not treat a single changed pixel as a meaningful new pose", () => {
  const a = frame();
  const b = frame();
  b.data[(10 * 320 + 10) * 4 + 3] = 255;
  assert.equal(auditStickerFrames([a, b]).distinct, 1);
});

test("all-transparent input never passes the motion gate", () => {
  assert.throws(() => requireDistinctLineFrames(
    Array.from({ length: 8 }, () => frame(0, true)), "empty.png",
  ), /只有 1\/8/);
});

test("rejects scattered opaque specks even when their count exceeds threshold", () => {
  const a = frame();
  const b = frame();
  // 30 far-apart specks with no connected area cannot represent a pose.
  for (let i = 0; i < 30; i++) {
    const x = 4 + (i % 10) * 28;
    const y = 4 + Math.floor(i / 10) * 24;
    const offset = (y * b.width + x) * 4;
    b.data[offset] = 255;
    b.data[offset + 3] = 255;
  }
  assert.equal(auditStickerFrames([a, b]).distinct, 1);
});

test("a visibly displaced coherent object is distinct", () => {
  assert.equal(auditStickerFrames([frame(0), frame(6)]).distinct, 2);
});
