import test from "node:test";
import assert from "node:assert/strict";
import { fitStickerBoundsToCanvas } from "../src/lib/stickerOutputFit";

test("4x4 static sticker keeps full artwork while using less empty border", () => {
  const original = fitStickerBoundsToCanvas(200, 245, 370, 320, 29);
  const improved = fitStickerBoundsToCanvas(200, 245, 370, 320, 21);
  assert.ok(improved > original);
  assert.ok(245 * improved <= 320 - 42 + 0.001);
  assert.ok(200 * improved <= 370 - 42 + 0.001);
});

test("animated union fits within all-frame safety padding", () => {
  const scale = fitStickerBoundsToCanvas(308, 284, 320, 270, 11, 1.12);
  assert.ok(308 * scale <= 320 - 22 + 0.001);
  assert.ok(284 * scale <= 270 - 22 + 0.001);
});

test("tiny animated artwork can grow slightly without unbounded upscaling", () => {
  const improved = fitStickerBoundsToCanvas(200, 210, 320, 270, 11, 1.12);
  assert.ok(improved > 1);
  assert.ok(improved <= 1.12);
});

test("upright narrow stickers retain natural proportions", () => {
  const scale = fitStickerBoundsToCanvas(105, 260, 320, 270, 10);
  assert.ok(105 * scale <= 300 + 0.001);
  assert.ok(260 * scale <= 250 + 0.001);
});

test("rejects invalid bounds rather than silently clipping content", () => {
  assert.throws(() => fitStickerBoundsToCanvas(0, 150, 320, 270, 11));
  assert.throws(() => fitStickerBoundsToCanvas(320, 270, 320, 270, Number.NaN));
});
