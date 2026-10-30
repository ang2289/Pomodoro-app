import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertLineAnimatedZipManifest } from "../src/lib/lineAnimatedZipManifest";

const png = () => Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10,
  0, 0, 0, 13, 73, 72, 68, 82,
]);

function validEntries(count = 24) {
  return [
    ...Array.from({ length: count }, (_, i) => ({
      name: `${String(i + 1).padStart(2, "0")}.png`,
      data: png(),
    })),
    { name: "main.png", data: png() },
    { name: "tab.png", data: png() },
  ];
}

test("24 APNG + main + tab are allowed", () => {
  assert.doesNotThrow(() => assertLineAnimatedZipManifest(validEntries(24), 24));
});

test("LINE count 8 and 16 remain supported", () => {
  for (const count of [8, 16]) {
    assert.doesNotThrow(() => assertLineAnimatedZipManifest(validEntries(count), count));
  }
});

test("nested ZIP and unrelated source files must not enter upload ZIP", () => {
  const bad = validEntries();
  bad.push({ name: "old-static-pack.zip", data: Uint8Array.from([80, 75, 3, 4]) });
  assert.throws(() => assertLineAnimatedZipManifest(bad, 24));
  bad.pop();
  bad[0] = { name: "old-dynamic-pack.zip", data: png() };
  assert.throws(() => assertLineAnimatedZipManifest(bad, 24), /非 LINE 上架檔案/);
});

test("duplicate names, missing main and wrong signatures are rejected", () => {
  const duplicate = validEntries();
  duplicate[0] = { name: "02.png", data: png() };
  assert.throws(() => assertLineAnimatedZipManifest(duplicate, 24), /重複檔名/);
  const missing = validEntries().filter((entry) => entry.name !== "main.png");
  assert.throws(() => assertLineAnimatedZipManifest(missing, 24));
  const disguisedZip = validEntries();
  disguisedZip[0] = { name: "01.png", data: Uint8Array.from([80, 75, 3, 4]) };
  assert.throws(() => assertLineAnimatedZipManifest(disguisedZip, 24), /不是有效的 PNG/);
});

test("the batch ZIP exporter must call the guard before makeZip", () => {
  const source = readFileSync(new URL("../src/pages/tools/AnimatedLineStickerTool.tsx", import.meta.url), "utf8");
  assert.match(
    source,
    /assertLineAnimatedZipManifest\(files, batchSources\.length\);\s*const zip = makeZip\(files\)/,
  );
});
