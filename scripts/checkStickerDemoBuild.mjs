import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Post-build assertion: a passing Vite build is not enough when the MP4 source
// exists in Git but Vercel excludes it before copying public/ into dist/.
const root = process.env.RXV_BUILD_OUTPUT_DIR || "dist";
const galleryDir = join(root, "images", "rxv-sticker-guide");
const ids = ["baby", "florist", "dog", "couple", "realtor", "sales", "manager", "breakfast"];

for (const id of ids) {
  const file = join(galleryDir, id + "-demo.mp4");
  assert.ok(existsSync(file), `Deployment artifact missing: ${file}. Check .vercelignore and public/ copy.`);
  assert.ok(statSync(file).size > 10_000, `Video suspiciously small: ${file}`);
  assert.equal(readFileSync(file).toString("ascii", 4, 8), "ftyp", `Invalid MP4 container: ${file}`);
}
for (const id of ["baby", "florist", "dog", "cat", "couple", "realtor", "sales", "manager", "breakfast"]) {
  for (const layout of ["4x4", "4x2"]) {
    const file = join(galleryDir, id + "-" + layout + ".webp");
    assert.ok(existsSync(file), `Deployment artifact missing: ${file}`);
  }
}
const freeExcel = join(root, "downloads", "RXV_LINE_Sticker_Prompts_Free_100.xlsx");
assert.ok(existsSync(freeExcel), `Deployment artifact missing: ${freeExcel}`);
assert.ok(statSync(freeExcel).size > 40_000, `Missing free 100 Excel: ${freeExcel}`);
console.log("[RXV release] 8 MP4, 18 mother sheets and free Excel verified in " + root);
