import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("新手可以直接跳到第 3 步上傳母圖，不需做提示詞", () => {
  const starter = read("src/components/StickerBeginnerActions.tsx");
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const homepage = read("src/components/NewUserStickerGuide.tsx");
  assert.match(starter, /已經有貼圖大圖？不用再產生提示詞/);
  assert.match(starter, /\/tools\/line-sticker\?existing=1#mother-upload/);
  assert.match(prompt, /<StickerExistingMotherSheetShortcut \/>/);
  assert.match(homepage, /<StickerExistingMotherSheetShortcut compact \/>/);
});

test("每段新手流程明確同時提供 ChatGPT 與 Google Gemini，且保留既有母圖捷徑", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const progress = read("src/components/LineStickerFlowSteps.tsx");
  const starter = read("src/components/NewUserStickerGuide.tsx");
  const guide = read("src/pages/tools/LineStickerGuide.tsx");
  const buttons = read("src/components/StickerBeginnerActions.tsx");
  assert.match(buttons, /https:\/\/chatgpt\.com\//);
  assert.match(buttons, /https:\/\/gemini\.google\.com\/app/);
  assert.match(buttons, /開啟 ChatGPT 畫圖/);
  assert.match(buttons, /開啟 Google Gemini 畫圖/);
  assert.match(prompt, /<StickerAIProviderLinks \/>/);
  assert.match(prompt, /<StickerAIProviderLinks compact \/>/);
  assert.match(guide, /<StickerAIProviderLinks \/>/);
  assert.match(prompt, /請先按下方「複製第/);
  assert.match(prompt, /已從 ChatGPT 或 Gemini 下載完整大圖/);
  assert.match(prompt, /flow=1#mother-upload/);
  assert.match(progress, /ChatGPT／Gemini 畫圖/);
  assert.match(starter, /用 ChatGPT／Gemini 畫圖/);
  assert.match(starter, /下一步請按/);
});

test("已有母圖的上傳操作清楚，客製服務能私訊且不出現收費價目", () => {
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  const entry = read("src/components/StickerBeginnerActions.tsx");
  assert.match(upload, /第 3 步｜選擇整張母圖並辨識格數/);
  assert.match(upload, /下一步請按下方/);
  assert.match(entry, /https:\/\/www\.facebook\.com\/profile\.php\?id=61588964893446/);
  assert.match(entry, /https:\/\/line\.me\/ti\/p\/~angelchen2289/);
  assert.match(entry, /StickerCustomInquiry/);
  assert.doesNotMatch(entry, /NT\$|購買方案|月費|收費方案/);
});

test("最近的重要動畫和圖片流量修復仍保留", () => {
  const apng = read("src/lib/animatedLineStickerAuto.ts");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  const gallery = read("src/pages/tools/StickerShowcaseGallery.tsx");
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  assert.match(apng, /ensureVisibleMotion/);
  assert.match(animated, /const OUTPUT_SAFE_PADDING = 12/);
  assert.match(gallery, /loading="lazy"/);
  assert.match(upload, /WhatsAppMobileZipHandoff/);
});


test("貼圖工具主要按鈕依內容寬度排列，不再整列滿版", () => {
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const actions = read("src/components/StickerBeginnerActions.tsx");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  const whatsapp = read("src/components/WhatsAppMobileZipHandoff.tsx");
  const creator = read("src/components/LineStickerAuthorCard.tsx");
  const guide = read("src/pages/tools/LineStickerGuide.tsx");

  assert.match(upload, /w-fit max-w-full shrink-0 items-center justify-center rounded-full/);
  assert.match(upload, /w-\[calc\(100%-1rem\)\] max-w-3xl/);
  assert.match(upload, /inline-flex min-h-12 w-auto max-w-full shrink-0/);
  assert.doesNotMatch(upload, /h-12 min-h-12 flex-1 whitespace-nowrap/);
  assert.match(prompt, /mt-4 flex flex-wrap items-center gap-3/);
  assert.match(prompt, /w-fit max-w-full/);
  assert.match(actions, /flex flex-wrap items-center gap-2/);
  assert.match(actions, /開啟 ChatGPT 畫圖/);
  assert.match(actions, /開啟 Google Gemini 畫圖/);
  assert.match(animated, /mt-4 flex flex-wrap items-center gap-3/);
  assert.match(whatsapp, /min-h-12 w-fit max-w-full/);
  assert.match(creator, /flex flex-wrap items-start gap-3/);
  assert.match(guide, /min-w-\[200px\] max-w-\[265px\]/);

  // 全幅上傳預覽、圖片拖曳區和表單控件保留原樣。
  assert.match(upload, /aspect-\[520\/450\] w-full cursor-grab/);
  assert.match(animated, /min-h-\[230px\] w-full flex-col/);
  assert.match(prompt, /min-h-\[520px\] w-full resize-y/);
});

test("Gemini 4×4 橫幅與多餘英文需要專用指令，切圖前應阻擋異常長寬比", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  const steps = read("src/components/LineStickerFlowSteps.tsx");
  assert.match(prompt, /function buildGeminiStrictMotherSheetPrompt/);
  assert.match(prompt, /1:1 正方形畫布/);
  assert.match(prompt, /JUST MARRIED/);
  assert.match(prompt, /複製 Gemini 排版強化版/);
  assert.match(prompt, /copyFlowPrompt\(index, "chatgpt"\)/);
  assert.match(prompt, /copyFlowPrompt\(index, "gemini"\)/);
  assert.match(upload, /requiresSquare4x4/);
  assert.match(upload, /aspect < 0\.82 \|\| aspect > 1\.22/);
  assert.match(upload, /unsafeMotherSheets\.length > 0/);
  assert.match(steps, /ChatGPT 已有符合 4×4/);
  assert.match(prompt, /const rowAssignment = Array.from/);
  assert.match(prompt, /最終版型僅此一種/);
  assert.match(prompt, /每格短句位置必須依下表/);
  assert.doesNotMatch(prompt, /嚴格按照指定 4×2、4×4 或 4×5 格數/);
  assert.match(read("src/components/StickerBeginnerActions.tsx"), /實驗性選項/);
});

test("自訂文字和字型在新手頁預設顯示，並且設定實際寫入兩種 AI 生圖提示詞", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(prompt, /id="sticker-customize"/);
  assert.match(prompt, /前往自訂文字／字型設定/);
  assert.match(prompt, /自訂貼圖內容｜文字、字型、顏色、角色都可以選/);
  assert.match(prompt, /字型風格（可選）/);
  assert.match(prompt, /value=\{fontStyle\}/);
  assert.match(prompt, /onChange=\{\(e\) => setFontStyle/);
  assert.match(prompt, /fontStylePrompt = optionPrompt\(FONT_STYLE_OPTIONS, fontStyle\)/);
  assert.match(prompt, /字型風格為「\$\{fontStylePrompt\}」/);
  assert.match(prompt, /fontStyle,\s*stickerStylePreset,\s*photoMode,\s*index \+ 1,/);
  assert.match(prompt, /fontStyle,\s*stickerStyle,\s*photoMode,/);
  assert.doesNotMatch(prompt, /想換角色、修改文字或指定畫風？展開進階設定/);
  assert.match(prompt, /一行一句，可自行修改/);
  assert.match(prompt, /文字大小/);
  assert.match(prompt, /文字顏色/);
  assert.match(prompt, /文字位置/);
});
