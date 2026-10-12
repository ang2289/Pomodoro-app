import test from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { AUTO_MOTION_PRESETS, getTransforms } from "../src/lib/animatedLineStickerAuto";
import { auditEncodedLineApngDistinctFrames } from "../src/lib/lineApngFileQuality";

test("every automatic motion preset describes at least five poses in eight frames", () => {
  for (const { value } of AUTO_MOTION_PRESETS) {
    const poses = Array.from({ length: 8 }, (_, index) => JSON.stringify(getTransforms(value, index)));
    const unique = new Set(poses);
    assert.ok(unique.size >= 5, `${value}: only ${unique.size} distinct parameter states`);
    assert.equal(poses[0], poses[7], `${value}: loop should end in its starting pose`);
  }
});

test("sparkle and breathe no longer have only four unique poses", () => {
  for (const preset of ["sparkle", "breathe"] as const) {
    const unique = new Set(Array.from({ length: 8 }, (_, index) => JSON.stringify(getTransforms(preset, index))));
    assert.ok(unique.size >= 6, `${preset}: expected 6 or more poses`);
  }
});

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const width = 320;
const height = 270;
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let n = i;
  for (let b = 0; b < 8; b++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  table[i] = n >>> 0;
}
function crc32(bytes: Buffer): number {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function u32(n: number): Buffer { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }
function u16(n: number): Buffer { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; }
function chunk(name: string, bytes = Buffer.alloc(0)): Buffer {
  const type = Buffer.from(name);
  return Buffer.concat([u32(bytes.byteLength), type, bytes, u32(crc32(Buffer.concat([type, bytes])))]);
}
function renderPngFrame(xShift: number): Buffer {
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    for (let x = 55 + xShift; x < 145 + xShift; x++) {
      if (y < 80 || y >= 185) continue;
      const p = y * (width * 4 + 1) + 1 + x * 4;
      scanlines[p] = 248; scanlines[p + 1] = 145;
      scanlines[p + 2] = 100; scanlines[p + 3] = 255;
    }
  }
  return deflateSync(scanlines);
}
function makeApng(shifts: number[]): Uint8Array {
  const ihdr = Buffer.concat([u32(width), u32(height), Buffer.from([8, 6, 0, 0, 0])]);
  const pieces = [signature, chunk("IHDR", ihdr), chunk("acTL", Buffer.concat([u32(shifts.length), u32(2)]))];
  let seq = 0;
  for (const [i, shift] of shifts.entries()) {
    const control = Buffer.concat([
      u32(seq++), u32(width), u32(height), u32(0), u32(0),
      u16(250), u16(1000), Buffer.from([0, 0]),
    ]);
    pieces.push(chunk("fcTL", control));
    const compressed = renderPngFrame(shift);
    pieces.push(i === 0 ? chunk("IDAT", compressed) : chunk("fdAT", Buffer.concat([u32(seq++), compressed])));
  }
  pieces.push(chunk("IEND"));
  return new Uint8Array(Buffer.concat(pieces));
}
test("decoding actual APNG pixels rejects 8 frames with only 4 visual poses", async () => {
  const bytes = makeApng([0, 2, 4, 6, 0, 2, 4, 0]);
  await assert.rejects(
    () => auditEncodedLineApngDistinctFrames(bytes, "06.png", width, height),
    /06.png.*4\/8/,
  );
});
test("decoding actual APNG pixels accepts at least 5 visual poses", async () => {
  const bytes = makeApng([0, 2, 4, 6, 8, 4, 2, 0]);
  const report = await auditEncodedLineApngDistinctFrames(bytes, "21.png", width, height);
  assert.equal(report.distinct, 5);
});
