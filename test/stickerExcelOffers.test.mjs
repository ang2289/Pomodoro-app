import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");
const offers = read("src/components/StickerExcelOffers.tsx");
const gallery = read("src/pages/tools/LineStickerStarterPage.tsx");
const prompts = read("src/pages/tools/StickerPromptGenerator.tsx");
const cutter = read("src/pages/tools/LineStickerTool.tsx");
const nav = read("src/components/LineStickerFlowSteps.tsx");
const live = read("src/pages/tools/AnimatedLineStickerTool.tsx");
const paidFilePath = /href\s*=\s*["']\/?downloads\/[^"']*\.(?:zip|xlsx)/i;

test("free 100 Excel download uses a public file, not an API, registration or blank form", () => {
  assert.match(offers, /FREE_STICKER_EXCEL_PATH = "\/downloads\/RXV_LINE_Sticker_Prompts_Free_100\.xlsx"/);
  assert.match(offers, /href=\{FREE_STICKER_EXCEL_PATH\}/);
  assert.match(offers, /download="RXV_LINE_Sticker_Prompts_Free_100\.xlsx"/);
  assert.match(offers, /免費下載 Excel/);
  assert.match(offers, /4×4（16 格）/);
  assert.doesNotMatch(offers, /type="email"|type="password"|onSubmit=|fetch\(/);
});

test("NT$160 manual order has confirmed Facebook, URL-encoded prefilled mailto and copy address", () => {
  assert.match(offers, /STICKER_SALES_FACEBOOK = "https:\/\/www\.facebook\.com\/profile\.php\?id=61588964893446"/);
  assert.match(offers, /STICKER_SALES_EMAIL = "rxv0227@gmail\.com"/);
  assert.match(offers, /encodeURIComponent\(STICKER_SALES_SUBJECT\)/);
  assert.match(offers, /encodeURIComponent\(STICKER_SALES_BODY\)/);
  assert.match(offers, /STICKER_SALES_SUBJECT = "詢問購買 RXV 多職業 LINE 貼圖 AI 提示詞模板｜NT\$160"/);
  assert.match(offers, /STICKER_SALES_MAILTO/);
  assert.match(offers, /navigator\.clipboard\.writeText\(STICKER_SALES_EMAIL\)/);
  assert.match(offers, /document\.execCommand\("copy"\)/);
  assert.match(offers, /人工寄送完整 ZIP 商品檔案/);
  assert.match(offers, /非自動付款、非即時下載/);
  assert.doesNotMatch(offers, paidFilePath);
  const encoded = `mailto:rxv0227@gmail.com?subject=${encodeURIComponent("詢問購買 RXV 多職業 LINE 貼圖 AI 提示詞模板｜NT$160")}&body=${encodeURIComponent("您好，我想購買 RXV 多職業 LINE 貼圖 AI 提示詞模板商用實戰版。\n\n商品價格：NT$160\n\n請提供購買及匯款方式，謝謝。")}`;
  const url = new URL(encoded);
  assert.equal(url.searchParams.get("subject"), "詢問購買 RXV 多職業 LINE 貼圖 AI 提示詞模板｜NT$160");
  assert.match(url.searchParams.get("body"), /請提供購買及匯款方式/);
});

test("offers appear once in each page branch and do not interrupt artwork export", () => {
  assert.match(gallery, /<StickerExcelOffers \/>/);
  assert.ok(gallery.indexOf("<StickerExcelOffers />") > gallery.indexOf('aria-label="LINE 貼圖五步驟"'));
  assert.ok(gallery.indexOf("<StickerExcelOffers />") < gallery.indexOf('id="examples"'));
  assert.equal((gallery.match(/<StickerExcelOffers/g) || []).length, 1);
  assert.equal((prompts.match(/<StickerExcelOffers/g) || []).length, 1);
  assert.equal((cutter.match(/<StickerExcelOffers/g) || []).length, 2);
  assert.match(cutter, /if \(isFirstVisit\)/);
  assert.match(cutter, /exportWhatsAppAnimatedPack|continueToAnimated/);
  assert.match(prompts, /<LineStickerFlowSteps/);
  assert.match(nav, /grid grid-cols-5/);
  assert.match(live, /exportBatchUploadPack/);
});

test("nine user examples, dynamic clips and original cat picture stay intact", () => {
  for(const id of ["baby","florist","dog","cat","couple","realtor","sales","manager","breakfast"]) {
    assert.ok(gallery.includes(id + "-4x4.webp"), id + " 4x4");
    assert.ok(gallery.includes(id + "-4x2.webp"), id + " 4x2");
  }
  assert.match(gallery, /cat-original\.webp/);
  assert.match(gallery, /setSelectedId\(item\.id\)/);
});

test("paid Excel preview route provides functioning controlled selectors, layout and curated preview only", () => {
  const app = read("src/App.tsx");
  const offers = read("src/components/StickerExcelOffers.tsx");
  const preview = read("src/pages/tools/StickerExcelPreviewPage.tsx");

  assert.match(app, /path="tools\/sticker-excel-preview" element=\{<StickerExcelPreviewPage \/>\}/);
  assert.match(offers, /to="\/tools\/sticker-excel-preview"/);
  assert.match(offers, /先操作試看｜選職業與情境/);

  assert.match(preview, /useState<string>\("coffee"\)/);
  assert.match(preview, /useState<string>\("order"\)/);
  assert.match(preview, /useState<StickerSheet>\("4x4"\)/);
  assert.match(preview, /onChange=\{\(event\) => setCareerId\(event\.target\.value\)\}/);
  assert.match(preview, /onChange=\{\(event\) => setScenarioId\(event\.target\.value\)\}/);
  assert.match(preview, /onChange=\{\(\) => setSheet\(item\.id\)\}/);
  assert.match(preview, /const count = sheet === "4x4" \? 16 : 20/);
  assert.match(preview, /cols = sheet === "4x4" \? 4 : 5/);
  assert.match(preview, /Array\.from\(\{length: count\}/);
  assert.match(preview, /本頁僅使用 6 種職業、4 種情境/);
  assert.match(preview, /STICKER_SALES_FACEBOOK/);
  assert.match(preview, /STICKER_SALES_MAILTO/);
  assert.doesNotMatch(preview, /\\/downloads\\/[^"']*\\.zip/);
  assert.doesNotMatch(preview, /1330-records|allProfessions|secretPremiumData/);
  assert.match(preview, /不是免費開放全部 1,330 組資料/);
});
