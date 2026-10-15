import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("角色區分可選性別年齡性格與固定的獨特造型", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  for (const field of ["gender:", "age:", "personality:", "face:", "hair:", "outfit:", "signature:", "palette:", "proportions:"]) {
    assert.ok(source.includes(field), `missing character field: ${field}`);
  }
  assert.match(source, /主角專屬辨識配件/);
  assert.match(source, /所有格子與後續母圖固定同一髮型/);
  assert.match(source, /幫我隨機搭配不同角色/);
});

test("從第3步直接上傳也可選動畫或靜態、張數也配對規則", () => {
  const source = read("src/pages/tools/LineStickerTool.tsx");
  assert.match(source, /第 3 步開始也能選/);
  assert.match(source, /selectedStickerMode: LineStickerMode = flowProject\?\.mode \?\? directStickerMode/);
  assert.match(source, /getAllowedCounts\(selectedStickerMode\)/);
  assert.match(source, /selectedStickerMode === "animated" \? \(/);
  assert.match(source, /4×2（8 張）/);
  assert.match(source, /不必把橫圖硬切成 4×4/);
});

test("最後一頁必須提示 ZIP 打包，另外允許獨立上架靜態版", () => {
  const source = read("src/pages/tools/LineStickerTool.tsx");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  assert.match(source, /另存 LINE 靜態上架 ZIP（可獨立送審）/);
  assert.match(source, /最後一步｜產生並下載/);
  assert.match(source, /從第 1 步重做/);
  assert.match(source, /前往 LINE 官方上架後台/);
  assert.match(source, /openToolShare\("line"\)/);
  assert.match(animated, /最後一步｜產生並下載 LINE 動態 APNG 上架 ZIP/);
  assert.match(animated, /completedPlatform === exportPlatform/);
  assert.match(animated, /再做新的一組｜從第 1 步重做/);
  assert.match(animated, /分享的是 RXV 工具連結/);
});

test("正常產生 ZIP 成功後才顯示完成提示", () => {
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  assert.match(animated, /setCompletedPlatform\(null\)/);
  assert.match(animated, /setCompletedPlatform\("line"\)/);
  assert.match(animated, /setCompletedPlatform\("whatsapp"\)/);
  const indexDownload = animated.indexOf("downloadBlob(\n        zip,\n        `rxv-line-animated-sticker-upload-pack-");
  const indexComplete = animated.indexOf('setCompletedPlatform("line")');
  assert.ok(indexDownload >= 0 && indexComplete > indexDownload, "LINE animated completion must follow downloadable ZIP");
});

test("兩張不同格數母圖不被上一個全域 4×4 選項強制覆蓋", () => {
  const source = read("src/pages/tools/LineStickerTool.tsx");
  assert.match(source, /if \(detections\.length > 1\) setMotherSheetGrid\("auto"\)/);
  assert.match(source, /const useAutoPlan = Boolean\(flowProject\) \|\| motherSheetGrid === "auto" \|\| motherSheetDetections\.length > 1/);
  assert.match(source, /motherSheetDetections\.length === 1 \? motherSheetGrid : item\.grid/);
  assert.match(source, /多張母圖可能混用 4×4 \+ 4×2/);
  assert.match(source, /不會強迫橫圖變成正方形/);
});
