import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { test } from "node:test";
import JSZip from "jszip";

const asset = (file) => `public/images/rxv-sticker-guide/${file}`;
const categories = ["baby","florist","dog","cat","couple","realtor","sales","manager","breakfast"];
const excelPath = "public/downloads/RXV_LINE_Sticker_Prompts_Free_100.xlsx";

test("release contains real free Excel and not premium ZIP in public", async () => {
  assert.ok(existsSync(excelPath), "Free 100 Excel missing in public/downloads");
  assert.ok(statSync(excelPath).size > 40_000, "Free Excel suspiciously small / blank");
  const zip = await JSZip.loadAsync(readFileSync(excelPath));
  assert.ok(zip.file("xl/workbook.xml"), "Not a real .xlsx workbook");
  assert.ok(zip.file("xl/worksheets/sheet3.xml"), "Missing 4x4 prompt sheet");
  const sheet = await zip.file("xl/worksheets/sheet3.xml").async("string");
  assert.match(sheet, /r="A101"/, "Expected 100 filled topic rows + heading");
  const forbidden = ["1330", "paid", "premium", "160", "商用實戰版"];
  const allNames = [
    ...categories.flatMap((id) => [asset(id+"-4x4.webp"),asset(id+"-4x2.webp")]),
    excelPath
  ];
  assert.equal(allNames.length,19);
  for (const name of allNames) assert.ok(existsSync(name), `Required public asset missing: ${name}`);
  // No paid ZIP is published under the free download location.
  assert.ok(!existsSync("public/downloads/RXV_LINE_Sticker_Prompts_Paid_1330.zip"));
});

test("all nine showcase images and seven? dynamic movies are actual binary files", () => {
  let videoCount=0;
  for (const id of categories) {
    for (const suffix of ["-4x4.webp","-4x2.webp"]) {
      const file=asset(id+suffix);
      const data=readFileSync(file);
      assert.ok(data.length > 3000, `blank or tiny picture: ${file}`);
      assert.equal(data.toString("ascii",0,4),"RIFF", `invalid WebP: ${file}`);
      assert.equal(data.toString("ascii",8,12),"WEBP", `invalid WebP: ${file}`);
    }
    if (id!=="cat") {
      const poster=asset(id+"-demo.webp");
      assert.ok(existsSync(poster), `missing poster ${poster}`);
      const video=asset(id+"-demo.mp4");
      assert.ok(existsSync(video), `missing video ${video}`);
      const v=readFileSync(video);
      assert.ok(v.length > 10_000, `empty video: ${video}`);
      assert.equal(v.toString("ascii",4,8),"ftyp",`invalid MP4: ${video}`);
      videoCount++;
    }
  }
  assert.equal(videoCount,8);
  assert.ok(existsSync(asset("cat-original.webp")));
});

test("Vercel ignores large MP4 by default, but explicitly includes only eight gallery demo clips", () => {
  const rules = readFileSync(".vercelignore", "utf8").split(/\r?\n/).map((line) => line.trim());
  assert.ok(rules.includes("*.mp4"), "Expected default ignore for unrelated large MP4 files");
  const ids = categories.filter((id) => id !== "cat");
  for (const id of ids) {
    assert.ok(
      rules.includes("!public/images/rxv-sticker-guide/" + id + "-demo.mp4"),
      `Vercel ignore missing explicit allow-list for ${id} demo MP4`
    );
  }
  // Do not accidentally allow unrelated large media or private sales ZIP files.
  assert.equal(rules.filter((line) => line.startsWith("!public/images/rxv-sticker-guide/") && line.endsWith(".mp4")).length, 8);
});
