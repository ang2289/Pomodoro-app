import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { REAL_PHOTO_VARIETY, buildExpressiveCellPlan, realPhotoPolicy } from "../src/lib/realPhotoStickerPrompts";
import { buildMotherSheetWhitespaceRules } from "../src/lib/stickerMotherSheetWhitespace";

/**
 * 直接編譯並執行目前 TSX 內的提示詞建構函式，驗證實際組裝字串。
 * 不載入 React 頁面，因此不需要瀏覽器、Supabase 或付費 AI API。
 */
const src = readFileSync("src/pages/tools/StickerPromptGenerator.tsx", "utf8");
const functions = [
  "textPositionForCell",
  "buildRolePrompt",
  "buildPhotoReminder",
  "buildPrompt",
  "buildStablePrompt",
  "buildFlowPrompt",
  "buildGeminiStrictMotherSheetPrompt",
].map(name => {
  const match = src.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`));
  assert.ok(match, `Missing ${name}`);
  return match[0];
});
const compiled = ts.transpileModule(functions.join("\n"), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const options = [{value:"original",prompt:"使用原創角色"},{value:"realPerson",prompt:"真人 Q 版"}];
const mock = {
  realPhotoPolicy,
  buildExpressiveCellPlan,
  REAL_PHOTO_VARIETY,
  buildMotherSheetWhitespaceRules,
  optionPrompt: (o: {value:string;prompt:string}[], v:string) => o.find(x=>x.value===v)?.prompt || "使用者指定格式",
  gridOptions: {
    "4x2": {count:8,layoutText:"4x2 排列，共 8 張貼圖"},
    "4x4": {count:16,layoutText:"4x4 排列，共 16 張貼圖"},
    "4x5": {count:20,layoutText:"4x5 排列，共 20 張貼圖"},
    "5x4": {count:20,layoutText:"5x4 排列，共 20 張貼圖"},
  },
  normalizeLines: (text:string,count:number) => text.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,count),
  PHOTO_MODE_OPTIONS: options,
  TEXT_SIZE_OPTIONS: options,
  TEXT_COLOR_OPTIONS: options,
  TEXT_POSITION_OPTIONS: options,
  FONT_STYLE_OPTIONS: options,
  STICKER_STYLE_OPTIONS: options,
};
const builder = vm.runInNewContext(
  compiled + "\n({buildFlowPrompt,buildStablePrompt,buildGeminiStrictMotherSheetPrompt})",
  mock,
) as {
  buildFlowPrompt: (...args:any[])=>string;
  buildStablePrompt: (...args:any[])=>string;
  buildGeminiStrictMotherSheetPrompt: (...args:any[])=>string;
};
const first = ["早安","哈哈","真的嗎","有點委屈","想睡覺","好的","嘿嘿","請問","抱抱","謝謝","害羞","期待","加油","平安","太厲害","稍等"];
const second = ["掰掰","陪我","禮物","恭喜","晚點聊","喜歡你","一起玩","吃飯"];
const make = (mode:"unchanged"|"expressive", batch:1|2 = 1, type:"static"|"animated"="animated") => builder.buildFlowPrompt(
  "寶寶日常","同一位寶寶","真人攝影風",batch===1?"4x4":"4x2",
  batch===1?first:second,"large","blackWhite","top","roundBold","friendly","realPhoto",mode,batch,type,"line",
  batch===1?0:16,realPhotoPolicy(mode).identity,
);

test("完整 4x4 主提示詞：A 不能改照片，B 能延伸 16 格", () => {
  const a=make("unchanged");
  const b=make("expressive");
  assert.match(a,/不得透過 AI 重新生成真人臉孔/);
  assert.match(a,/不可變更原照片五官、表情/);
  assert.doesNotMatch(a,/【逐格表情與動作設計/);
  assert.doesNotMatch(a,/允許 AI 自然延伸/);

  assert.match(b,/允許 AI 自然延伸/);
  assert.match(b,/【逐格表情與動作設計/);
  assert.match(b,/開懷大笑/);
  assert.match(b,/比讚/);
  assert.doesNotMatch(b,/不得透過 AI 重新生成真人臉孔/);
  assert.doesNotMatch(b,/不可變更原照片五官、表情/);
  assert.doesNotMatch(b,/不可以生成真人原照片中沒有的表情或動作/);
  assert.match(b,/4 欄 × 4 列/);
  assert.match(b,/1:1 正方形/);
  assert.match(b,/13%～15%/);
  assert.match(b,/多留移動空間/);
  assert.match(b,/文字放正上方/);
  assert.equal((b.match(/第 (?:[1-9]|1[0-6]) 格「[^」]+」：[^\n]+/g)||[]).length,16);
});

test("4x2 第二張必須同時附上原照片與第一張，不能重複或變角色", () => {
  const a=make("unchanged",2);
  const b=make("expressive",2);
  assert.match(a,/4 欄 × 2 列/);
  assert.match(a,/2:1 橫向/);
  assert.match(b,/4 欄 × 2 列/);
  assert.match(b,/2:1 橫向/);
  assert.match(a,/原始真人照片/);
  assert.match(a,/第 1 張已完成母圖/);
  assert.match(b,/原始真人照片/);
  assert.match(b,/第 1 張已完成母圖/);
  assert.match(b,/第 17 格「掰掰」/);
  assert.match(b,/第 24 格「吃飯」/);
  assert.match(b,/寫實攝影/);
  assert.doesNotMatch(b,/不得透過 AI 重新生成真人臉孔/);
});

test("無文字版與 Gemini 強化版也遵守 A/B 而非套用 Q 版限制", () => {
  for (const mode of ["unchanged","expressive"] as const) {
    const stable=builder.buildStablePrompt("寶寶","同一位寶寶","真人攝影","4x4","friendly","realPhoto",mode);
    const gemini=builder.buildGeminiStrictMotherSheetPrompt(make(mode),"4x4","realPhoto",mode);
    assert.match(stable,/13%～15%/);
    assert.match(gemini,/1:1 正方形畫布/);
    assert.doesNotMatch(gemini,/Q 版頭身比/);
    if (mode==="expressive") {
      assert.match(stable,/同一個人的五官與年齡/);
      assert.match(gemini,/不要每格固定相同表情與姿勢/);
      assert.doesNotMatch(stable,/不以動作清單要求 AI 產生新姿勢/);
    } else {
      assert.match(stable,/禁止重新繪畫或虛構動作/);
      assert.match(gemini,/禁止重新繪畫或虛構動作/);
      assert.doesNotMatch(stable,/允許 AI 自然延伸/);
    }
  }
});

test("原創角色既有生成仍包含母圖安全規範，不被照片子模式影響",()=>{
  const original=builder.buildFlowPrompt("早餐店","原創早餐店角色","Q 版插畫","4x4",first,
    "large","blackWhite","top","roundBold","friendly","original","unchanged",1,"static","whatsapp",0,"原創角色身份鎖定");
  assert.match(original,/原創角色身份鎖定/);
  assert.match(original,/使用原創角色/);
  assert.match(original,/4 欄 × 4 列/);
  assert.match(original,/13%～15%/);
  assert.match(original,/WhatsApp/);
  assert.doesNotMatch(original,/【逐格表情與動作設計/);
});
