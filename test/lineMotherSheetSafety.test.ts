import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMotherSheetSafety } from "../src/lib/lineMotherSheetSafety";

function makeSheet(
  width: number,
  height: number,
  paint: (data: Uint8ClampedArray, width: number, height: number) => void,
  transparent = false,
) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = 255;
    data[i * 4 + 1] = 255;
    data[i * 4 + 2] = 255;
    data[i * 4 + 3] = transparent ? 0 : 255;
  }
  paint(data, width, height);
  return data;
}

function paintRectangle(
  data: Uint8ClampedArray, width: number,
  x0: number, y0: number, x1: number, y1: number,
  color = 40,
) {
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const p = (y * width + x) * 4;
      data[p] = color;
      data[p + 1] = 90;
      data[p + 2] = 90;
      data[p + 3] = 255;
    }
  }
}

test("four-by-four sheet with genuine white gutters is safe", () => {
  const data = makeSheet(400, 400, (pixels, width) => {
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        paintRectangle(pixels, width, column * 100 + 15, row * 100 + 15, column * 100 + 85, row * 100 + 85);
      }
    }
  });
  const review = analyzeMotherSheetSafety(data, 400, 400, "4x4");
  assert.deepEqual(review.blocked, []);
  assert.equal(review.xCuts.length, 5);
  assert.equal(review.yCuts.length, 5);
  assert.equal(review.warnings.length, 0);
});

test("shift a crowded equal-split line toward a real nearby gap", () => {
  const data = makeSheet(400, 400, (pixels, width) => {
    for (let row = 0; row < 4; row += 1) {
      paintRectangle(pixels, width, 20, row * 100 + 15, 105, row * 100 + 80);
      for (let column = 1; column < 4; column += 1) {
        paintRectangle(pixels, width, column * 100 + 25, row * 100 + 15, column * 100 + 82, row * 100 + 80);
      }
    }
  });
  const review = analyzeMotherSheetSafety(data, 400, 400, "4x4");
  assert.deepEqual(review.blocked, []);
  assert.ok(review.xCuts[1] >= 108);
  assert.ok(review.warnings.some((item) => item.index === 1));
});

test("block a source that really merges objects across the whole separator search area", () => {
  const data = makeSheet(400, 400, (pixels, width) => {
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        paintRectangle(pixels, width, column * 100 + 20, row * 100 + 20, column * 100 + 80, row * 100 + 80);
      }
    }
    paintRectangle(pixels, width, 74, 30, 128, 370);
  });
  const review = analyzeMotherSheetSafety(data, 400, 400, "4x4");
  assert.ok(review.blocked.some((message) => message.includes("欄第 1 道")));
});

test("support transparent sheets with white sticker artwork", () => {
  const data = makeSheet(400, 200, (pixels, width) => {
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        paintRectangle(pixels, width, column * 100 + 20, row * 100 + 15, column * 100 + 80, row * 100 + 85, 255);
        for (let y = row * 100 + 15; y < row * 100 + 85; y += 1) {
          for (let x = column * 100 + 20; x < column * 100 + 80; x += 1) {
            pixels[(y * width + x) * 4 + 1] = 255;
            pixels[(y * width + x) * 4 + 2] = 255;
          }
        }
      }
    }
  }, true);
  const review = analyzeMotherSheetSafety(data, 400, 200, "4x2");
  assert.deepEqual(review.blocked, []);
  assert.equal(review.xCuts.length, 5);
  assert.equal(review.yCuts.length, 3);
});

test("report blank cells as blockers instead of silently exporting incomplete ZIPs", () => {
  const data = makeSheet(400, 400, (pixels, width) => {
    paintRectangle(pixels, width, 20, 20, 80, 80);
  });
  const review = analyzeMotherSheetSafety(data, 400, 400, "4x4");
  assert.ok(review.blocked.some((message) => message.includes("第 2 格未偵測")));
});
