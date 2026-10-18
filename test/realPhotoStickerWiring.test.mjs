import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const path = "src/pages/tools/StickerPromptGenerator.tsx";
const source = readFileSync(path, "utf8");

test("所有母圖提示詞遵照子模式：主提示詞、無文字版、角色鎖定、Gemini", () => {
  assert.match(source, /const \[realPhotoSubMode, setRealPhotoSubMode\]/);
  assert.match(source, /buildRolePrompt\(role, photoMode, subMode\)/);
  assert.match(source, /buildPhotoReminder\(photoMode, subMode\)/);
  assert.match(source, /const photoPerformance = photoMode === "realPhoto"/);
  assert.match(source, /buildExpressiveCellPlan\(lines, startIndex\)/);
  assert.match(source, /realPhotoPolicy\(subMode\)\.stable/);
  assert.match(source, /realPhotoPolicy\(subMode\)\.secondSheet/);
  assert.match(source, /realPhotoPolicy\(realPhotoSubMode\)\.identity/);
  assert.match(source, /buildGeminiStrictMotherSheetPrompt\(item\.prompt, item\.grid, photoMode, realPhotoSubMode\)/);
});

test("母圖格式、文字位置、安全留白及動態製作仍存在", () => {
  assert.match(source, /const columns = 4;/);
  assert.match(source, /grid === "4x2" \? 2 : grid === "4x4" \? 4 : 5/);
  assert.match(source, /"2:1 橫向"/);
  assert.match(source, /"1:1 正方形"/);
  assert.match(source, /13%～15%/);
  assert.match(source, /文字放正上方、人物放下方/);
  assert.match(source, /本次選擇「動態貼圖」/);
  assert.match(source, /多留移動空間/);
  assert.match(source, /REAL_PHOTO_SUBMODE_OPTIONS\.map/);
  assert.match(source, /setTextPosition\("top"\)/);
});

test("原有原創／Q 版、張數、LINE／WhatsApp 功能仍在", () => {
  assert.match(source, /value: "original"/);
  assert.match(source, /value: "realPerson"/);
  assert.match(source, /value: "realPersonPureQ"/);
  assert.match(source, /value: "petPhoto"/);
  assert.match(source, /getMotherSheetPlan\(targetCount\)/);
  assert.match(source, /saveLineStickerProject/);
  assert.match(source, /"whatsapp"/);
  assert.match(source, /"line"/);
  assert.match(source, /ILLUSTRATION_STYLE_OPTIONS\.map/);
  assert.match(source, /buildFlowPrompt\(/);
});
test("第一次使用者優先進入設定，完整母圖捷徑為摺疊進階選項", () => {
  assert.match(source, /第一次製作貼圖？從這裡繼續/);
  assert.match(source, /href="#sticker-theme"/);
  assert.match(source, /id="sticker-theme"/);
  assert.match(source, /只有寶寶、真人或寵物的單張照片/);
  assert.match(source, /不是只有一張寶寶或真人照片/);
  assert.match(source, /<details className="group rounded-xl/);
  assert.match(source, /已製作完成整張貼圖母圖/);
  assert.match(source, /to="\/tools\/line-sticker\?flow=1#mother-upload"/);
  assert.match(source, /onClick=\{\(\) => persistFlowProject\(3\)\}/);
  assert.match(source, /動態貼圖仍需於第 5 步製作動畫/);
});

test("第 2 步先呈現兩張母圖的複製操作，不再直接開啟空白 ChatGPT", () => {
  const step2 = source.slice(source.indexOf('id="sticker-copy"'));
  const copyButton = step2.indexOf('onClick={() => copyFlowPrompt(index, "chatgpt")}');
  const firstChatLink = step2.indexOf('href="https://chatgpt.com/"');
  const secondReference = step2.indexOf('可選｜在 RXV 預覽第 1 張母圖');
  assert.ok(copyButton >= 0 && firstChatLink > copyButton);
  assert.ok(secondReference > firstChatLink);
  assert.match(step2, /flowPrompts\.map\(\(item, index\) =>/);
  assert.match(step2, /母圖 \{index \+ 1\}/);
  assert.match(step2, /複製第 \$\{index \+ 1\} 張指令（ChatGPT）/);
  assert.doesNotMatch(step2, /<StickerAIProviderLinks/);
  assert.match(step2, /查看這次貼圖設定與安全留白說明（可展開）/);
});

test("複製成功才讓新手開啟 AI；第 2 張沿用同一對話，並保留 Gemini 與照片參考功能", () => {
  assert.match(source, /await navigator\.clipboard\.writeText\(instruction\)/);
  assert.match(source, /setPreparedFlowPrompt\(\(previous\) =>/);
  assert.match(source, /preparedFlowPrompt\[\`chatgpt-\$\{index\}\`\] === item\.prompt/);
  assert.match(source, /preparedFlowPrompt\[\`gemini-\$\{index\}\`\] === item\.prompt/);
  assert.match(source, /已複製第 \{index \+ 1\} 張指令/);
  assert.match(source, /請不要另開新對話/);
  assert.match(source, /改用 Google Gemini（進階／實驗性）/);
  assert.match(source, /可選｜在 RXV 預覽第 1 張母圖/);
  assert.match(source, /第 3 步｜已下載整張大圖，回 RXV 上傳/);
});
