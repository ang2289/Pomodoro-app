import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (p) => readFileSync(p, "utf8");
const page = read("src/pages/tools/LineStickerStarterPage.tsx");
const app = read("src/App.tsx");
const nav = read("src/components/LineStickerFlowSteps.tsx");
const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
const cutter = read("src/pages/tools/LineStickerTool.tsx");
const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
const config = read("src/config/coupangAds.ts");

test("真正有導入獨立新手頁、展示使用者兩組 24 格與動態成果",()=>{
  assert.match(app, /import LineStickerStarterPage from/);
  assert.match(app, /path="tools\/line-sticker-start" element={<LineStickerStarterPage \/>/);
  for (const basename of ["baby-4x4.webp","baby-4x2.webp","baby-demo.mp4","florist-4x4.webp","florist-4x2.webp","florist-demo.mp4"]) {
    assert.ok(page.includes(basename), basename);
  }
  assert.match(page, /4×4（16）＋4×2（8）/);
  assert.match(page, /真人照片延伸多表情/);
  assert.match(page, /原創 Q 版職業角色/);
  assert.match(page, /to="\/tools\/sticker-prompt\?new=1#sticker-start"/);
  assert.match(page, /to="\/tools\/line-sticker\?existing=1#mother-upload"/);
  assert.match(page, /preload="none"/);
});

test("全程只有五個明確步驟，動畫是第五步內的操作 A/B/C",()=>{
  for(const n of [1,2,3,4,5]) assert.match(nav,new RegExp("step: "+n+" as const"));
  assert.match(nav,/grid grid-cols-5/);
  assert.match(nav,/activeStep/);
  assert.match(page,/不是再多一個第 6 步/);
  assert.match(animated,/第 5 步內操作 A｜選擇素材/);
  assert.match(animated,/第 5 步內操作 B｜選擇動作/);
  assert.match(animated,/第 5 步內操作 C｜產生動畫/);
  assert.match(animated,/第 5 步完成/);
  assert.match(prompt,/先看寶寶、花店成果與五步驟圖片教學/);
  assert.match(cutter,/先看兩套成果與五步驟教學/);
});

test("貼圖專頁不插入分潤廣告；其他網站廣告設定保留",()=>{
  assert.doesNotMatch(page,/CoupangDynamicAd|AdBanner|ToolAdSlot/);
  assert.doesNotMatch(prompt,/CoupangDynamicAd/);
  assert.doesNotMatch(cutter,/CoupangDynamicAd/);
  for (const path of ["/tools/line-sticker-start","/tools/line-sticker","/tools/sticker-prompt","/tools/animated-line-sticker"]) {
    assert.ok(config.includes('\"'+path+'\"'),path);
  }
  assert.match(config,/COUPANG_ADS/); // do not globally remove monetization
});

test("傳回上傳、靜態／動態、真人 A/B 等原功能不變",()=>{
  assert.match(prompt,/REAL_PHOTO_SUBMODE_OPTIONS/);
  assert.match(prompt,/realPhotoPolicy/);
  assert.match(cutter,/continueToAnimated/);
  assert.match(cutter,/buildMotherSheetWhitespaceRetryPrompt/);
  assert.match(animated,/exportBatchUploadPack/);
  assert.match(animated,/exportWhatsAppAnimatedPack/);
});
