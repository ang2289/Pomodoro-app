import test from "node:test";
import assert from "node:assert/strict";
import { verifyLinePngBytes } from "../src/lib/lineApngFileQuality";

const u32 = (value: number) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, value); return b; };
const u16 = (value: number) => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, value); return b; };
const bytes = (...parts: Uint8Array[]) => {
  const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let position = 0;
  for (const p of parts) { all.set(p, position); position += p.length; }
  return all;
};
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data = new Uint8Array()) {
  const payload = bytes(new TextEncoder().encode(type), data);
  return bytes(u32(data.length), payload, u32(crc32(payload)));
}
function png({ width = 320, height = 270, frames = 8, loops = 2, delay = 250, animated = true, rgba = true } = {}) {
  const ihdr = bytes(u32(width), u32(height), new Uint8Array([8, rgba ? 6 : 2, 0, 0, 0]));
  const chunks = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr)];
  if (animated) chunks.push(chunk("acTL", bytes(u32(frames), u32(loops))));
  for (let i = 0; i < (animated ? frames : 1); i++) {
    if (animated) chunks.push(chunk("fcTL", bytes(
      u32(i * 2), u32(i ? 1 : width), u32(i ? 1 : height),
      u32(0), u32(0), u16(delay), u16(1000), new Uint8Array([0, 0]),
    )));
    // Metadata tests use a minimal payload; actual APNG pixel rendering
    // requires browser integration tests against canvas-generated archives.
    if (i === 0) chunks.push(chunk("IDAT", new Uint8Array([1, 2, 3])));
    else chunks.push(chunk("fdAT", bytes(u32(i * 2 + 1), new Uint8Array([1, 2, 3]))));
  }
  chunks.push(chunk("IEND"));
  return bytes(...chunks);
}

test("accepts a well-formed 8-frame metadata sequence, 2 seconds x 2 loops", () => {
  const audit = verifyLinePngBytes(png(), "01.png", 320, 270, true);
  assert.equal(audit.frames, 8);
  assert.equal(audit.loops, 2);
  assert.equal(audit.cycleSeconds, 2);
});
test("rejects a playback time that is not an integer second", () => {
  assert.throws(() => verifyLinePngBytes(png({delay: 240}), "01.png", 320, 270, true), /動畫時間或循環/);
});
test("rejects an animation longer than 4 seconds across loops", () => {
  assert.throws(() => verifyLinePngBytes(png({loops: 3}), "01.png", 320, 270, true), /動畫時間或循環/);
});
test("rejects zero loops (infinite animation)", () => {
  assert.throws(() => verifyLinePngBytes(png({loops: 0}), "01.png", 320, 270, true), /動畫時間或循環/);
});
test("rejects fewer than five frames", () => {
  assert.throws(() => verifyLinePngBytes(png({frames: 4}), "01.png", 320, 270, true), /5～20/);
});
test("rejects wrong sticker dimensions", () => {
  assert.throws(() => verifyLinePngBytes(png(), "01.png", 240, 240, true), /尺寸/);
});
test("rejects RGB output without an alpha channel", () => {
  assert.throws(() => verifyLinePngBytes(png({rgba: false}), "01.png", 320, 270, true), /RGBA/);
});
test("rejects a corrupted frame-control CRC", () => {
  const data = png();
  data[100] ^= 0x80;
  assert.throws(() => verifyLinePngBytes(data, "01.png", 320, 270, true), /校驗碼/);
});
test("accepts only static PNG as chat tab icon", () => {
  const data = png({width: 96, height: 74, animated: false});
  assert.equal(verifyLinePngBytes(data, "tab.png", 96, 74, false).animated, false);
  assert.throws(() => verifyLinePngBytes(png(), "tab.png", 320, 270, false), /靜態/);
});
