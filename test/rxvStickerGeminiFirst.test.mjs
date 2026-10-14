import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("新手可以直接跳到第 3 步上傳母圖，不需做提示詞", () => {
  const starter = read("src/components/StickerBeginnerActions.tsx");
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const homepage = read("src/components/NewUserStickerGuide.tsx");
  assert.match(starter, /已經有貼圖大圖？不用再產生提示詞/);
  assert.match(starter, /\/tools\/line-sticker\?existing=1#mother-upload/);
  assert.match(prompt, /<StickerExistingMotherSheetShortcut compact \/>/);
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
  assert.match(progress, /ChatGPT（推薦）/);
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
  assert.match(upload, /mt-6 max-w-3xl rounded-2xl/);
  assert.doesNotMatch(upload, /className="fixed bottom-2 left-1\/2/);
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
  assert.match(prompt, /min-h-\[200px\] max-h-\[440px\] w-full resize-y/);
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
  assert.match(steps, /ChatGPT（推薦）/);
  assert.match(prompt, /const rowAssignment = Array.from/);
  assert.match(prompt, /最終版型僅此一種/);
  assert.match(prompt, /每格短句位置必須依下表/);
  assert.doesNotMatch(prompt, /嚴格按照指定 4×2、4×4 或 4×5 格數/);
  assert.match(read("src/components/StickerBeginnerActions.tsx"), /實驗性選項/);
});

test("自訂文字和字型在新手頁預設顯示，並且設定實際寫入兩種 AI 生圖提示詞", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(prompt, /id="sticker-customize"/);
  assert.match(prompt, /直接調整文字、字型/);
  assert.match(prompt, /自訂文字、字型與角色（可直接修改）/);
  assert.match(prompt, /字型風格（可選）/);
  assert.match(prompt, /value=\{fontStyle\}/);
  assert.match(prompt, /onChange=\{\(e\) => setFontStyle/);
  assert.match(prompt, /fontStylePrompt = optionPrompt\(FONT_STYLE_OPTIONS, fontStyle\)/);
  assert.match(prompt, /字型造型遵守「\$\{fontStylePrompt\}」/);
  assert.match(prompt, /fontStyle,\s*stickerStylePreset,\s*photoMode,\s*index \+ 1,/);
  assert.match(prompt, /fontStyle,\s*stickerStyle,\s*photoMode,/);
  assert.doesNotMatch(prompt, /想換角色、修改文字或指定畫風？展開進階設定/);
  assert.match(prompt, /一行一句，可自行修改/);
  assert.match(prompt, /文字大小/);
  assert.match(prompt, /文字顏色/);
  assert.match(prompt, /文字位置/);
});

test("左右交錯一定要左右排列，三種文字位置的實際規則都依照選項", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  const matched = source.match(/function textPositionForCell\(textPosition: TextPosition, index: number\) \{[\s\S]*?\n\}/);
  assert.ok(matched, "應存在可驗證的逐格位置規則");
  const javascript = ts.transpileModule(matched[0], {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const position = vm.runInNewContext(javascript + "\ntextPositionForCell", {});
  for (let index = 0; index < 16; index += 1) {
    const mixed = position("mixed", index);
    if (index % 2 === 0) {
      assert.match(mixed, /文字放左側、人物放右側/);
    } else {
      assert.match(mixed, /人物放左側、文字放右側/);
    }
    assert.match(position("top", index), /文字放正上方/);
    assert.match(position("bottom", index), /文字放正下方/);
  }
  assert.doesNotMatch(source, /文字可依角色動作在上方、下方或左右交錯安排/);
});

test("第 2 步顯示全部已選設定，母圖提示詞逐格指定位置並支援平台及動靜態", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source, /textPositionForCell\(textPosition, row \* columns \+ column\)/);
  assert.match(source, /文字所在區域必須嚴格遵守/);
  assert.match(source, /即將複製的貼圖設定/);
  assert.match(source, /optionLabel\(TEXT_POSITION_OPTIONS, textPosition\)/);
  assert.match(source, /optionLabel\(FONT_STYLE_OPTIONS, fontStyle\)/);
  assert.match(source, /optionLabel\(TEXT_SIZE_OPTIONS, textSize\)/);
  assert.match(source, /optionLabel\(TEXT_COLOR_OPTIONS, textColor\)/);
  assert.match(source, /optionLabel\(STICKER_STYLE_OPTIONS, stickerStylePreset\)/);
  assert.match(source, /optionLabel\(PHOTO_MODE_OPTIONS, photoMode\)/);
  assert.match(source, /modeInstructions = mode === "animated"/);
  assert.match(source, /platform === "whatsapp" \? "WhatsApp" : "LINE"/);
  assert.match(source, /stickerMode,\s*stickerPlatform,\s*\),/);
  assert.match(source, /\[\s*motherSheetPlan,[\s\S]*?textPosition,\s*fontStyle,[\s\S]*?stickerMode,\s*stickerPlatform,\s*\]/);
  assert.doesNotMatch(source, /人物從第一格到最後一格保持完全同一組新郎新娘/);
});


test("第一次進貼圖工具從第 1 步開始，只有明確選擇已有圖片才進第 3 步", () => {
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const progress = read("src/components/LineStickerFlowSteps.tsx");
  const guide = read("src/components/NewUserStickerGuide.tsx");

  assert.match(upload, /if \(isFirstVisit\) \{/);
  assert.match(upload, /<LineStickerFlowSteps activeStep=\{1\} \/>/);
  assert.match(upload, /我還沒有母圖，從零開始/);
  assert.match(upload, /line-sticker\?existing=1#mother-upload/);
  assert.match(upload, /!new URLSearchParams\(location.search\)\.has\("existing"\)/);
  assert.match(upload, /!location\.hash/);
  assert.match(prompt, /mt-6 flex flex-col gap-6/);
  assert.doesNotMatch(prompt, /xl:grid-cols-\[0\.82fr_1\.18fr\]/);
  assert.match(prompt, /前往第 2 步｜複製畫圖指令 ↓/);
  assert.match(prompt, /to="\/tools\/line-sticker\?flow=1#mother-upload"/);
  assert.match(progress, /<ol className="flex flex-wrap items-center gap-2" aria-label="貼圖操作流程"/);
  assert.match(guide, /mt-4 flex flex-col gap-2/);
  assert.doesNotMatch(guide, /lg:grid-cols-5/);
  assert.doesNotMatch(upload, /className="fixed bottom-2 left-1\/2/);
});

test("24 張高清動態展示每張約兩秒且畫面卡頓會阻止下載", () => {
  const code = read("src/pages/tools/AnimatedLineStickerTool.tsx");
  const start = code.indexOf("async function createBatchShowcaseVideo(");
  const end = code.indexOf("const AnimatedLineStickerTool:", start);
  assert.ok(start >= 0 && end > start);
  const renderer = code.slice(start, end);
  assert.match(renderer, /const clipDurationMs = 2000/);
  assert.match(renderer, /const maxAllowedLagMs = 800/);
  assert.match(renderer, /frame < current\.length/);
  assert.match(renderer, /drawShowcaseFrame\(current\[frame\], index\)/);
  assert.doesNotMatch(renderer, /frame < 60/);
  assert.match(renderer, /actualCaptureMs > idealCaptureMs \+ maxAllowedLagMs/);
  assert.match(renderer, /避免產生前段長時間靜止的影片/);
  assert.match(code, /只有影格變化時才重畫/);
});

test("新手頁面保持窄版與極簡進度列，不再用滿版彩色卡片堆疊", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const steps = read("src/components/LineStickerFlowSteps.tsx");
  const help = read("src/components/StickerBeginnerActions.tsx");
  assert.match(prompt, /mx-auto w-full max-w-3xl/);
  assert.doesNotMatch(prompt, /max-w-\[1480px\]/);
  assert.match(prompt, /min-h-screen bg-slate-50/);
  assert.match(steps, /<nav/);
  assert.match(steps, /<ol className="flex flex-wrap items-center gap-2"/);
  assert.doesNotMatch(steps, /先知道一件事：不是一張張畫貼圖/);
  assert.match(prompt, /w-fit max-w-full flex-none items-center/);
  assert.match(prompt, /rows=\{Math\.min\(requiredCount \+ 1, 12\)\}/);
  assert.match(prompt, /id="sticker-customize"/);
  assert.match(help, /下一步：\{children\}/);
  assert.doesNotMatch(help, /rounded-xl bg-amber-50 px-3 py-2 text-xs font-black/);
});
