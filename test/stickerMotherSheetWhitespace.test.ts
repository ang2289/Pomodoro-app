import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  MOTHER_SHEET_SAFE_MARGIN_PERCENT,
  motherSheetGeometry,
  buildMotherSheetWhitespaceRules,
  buildMotherSheetWhitespaceRetryPrompt,
} from "../src/lib/stickerMotherSheetWhitespace";

test("4x4 與 4x2 的列欄與版型保持正確", () => {
  assert.deepEqual(motherSheetGeometry("4x4"), {columns:4,rows:4,ratio:"1:1 正方形"});
  assert.deepEqual(motherSheetGeometry("4x2"), {columns:4,rows:2,ratio:"2:1 橫向"});
  assert.deepEqual(motherSheetGeometry("4x5"), {columns:4,rows:5,ratio:"4:5 直向"});
  assert.deepEqual(motherSheetGeometry("5x4"), {columns:5,rows:4,ratio:"5:4 橫向"});
});

test("每格四邊均為純白禁止繪製區，不能只加大整張母圖的白框", () => {
  assert.equal(MOTHER_SHEET_SAFE_MARGIN_PERCENT, 15);
  const rules = buildMotherSheetWhitespaceRules("4x4");
  for (const keyword of ["4 欄 × 4 列","1:1 正方形","15%","中央 70% 寬 × 70% 高","禁止繪製區","連續、乾淨","不要畫出格線","第一列的「文字頂端」"]) {
    assert.ok(rules.includes(keyword), keyword);
  }
  assert.match(rules, /文字也必須「放在中央 70% 安全內框內」/);
  assert.match(rules, /3 條縱向和 3 條橫向/);
});

test("動態母圖規則保留未來活動空間，且不變成動畫影格",()=>{
  const animated = buildMotherSheetWhitespaceRules("4x2", "animated");
  assert.match(animated, /2:1 橫向/);
  assert.match(animated, /三條縱向和 1 條橫向/);
  assert.match(animated, /額外避免把手指、頭髮、特效放在安全內框邊緣/);
  assert.match(animated, /不產生動畫影格或時間軸/);
});

test("留白重繪指令必須保留母圖的角色、文字、格數及每格重新排版",()=>{
  const redo = buildMotherSheetWhitespaceRetryPrompt("4x4", "static");
  assert.match(redo, /原本母圖/);
  assert.match(redo, /每一格內部的圖文佈局/);
  assert.match(redo, /不是只加大整張畫布的外邊/);
  assert.match(redo, /原有的繁體中文短句、人物身份/);
  assert.match(redo, /4 欄 × 4 列/);
  assert.match(redo, /整格尺寸 15% 的純白禁止繪製區/);
  assert.match(redo, /中央 70%/);
  const followup=buildMotherSheetWhitespaceRetryPrompt("4x2","animated");
  assert.match(followup,/第 1 張母圖/);
  assert.match(followup,/原始授權照片/);
});

test("生圖主提示詞、無文字版及第三步危險警示接上同一組白邊規則",()=>{
  const prompt=readFileSync("src/pages/tools/StickerPromptGenerator.tsx","utf8");
  const line=readFileSync("src/pages/tools/LineStickerTool.tsx","utf8");
  assert.match(prompt,/buildMotherSheetWhitespaceRules\(grid, stickerMode\)/);
  assert.match(prompt,/buildMotherSheetWhitespaceRules\(grid\)/);
  assert.match(prompt,/stickerMode: LineStickerMode = "static"/);
  assert.match(prompt,/startIndex,\s*mode,/);
  assert.match(line,/unsafeMotherSheets\.length \?/);
  assert.match(line,/buildMotherSheetWhitespaceRetryPrompt\(item\.grid, selectedStickerMode\)/);
  assert.match(line,/複製母圖/);
});
