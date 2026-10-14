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
  assert.match(prompt, /請複製第/);
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
  assert.match(prompt, /grid-cols-2 items-stretch gap-3" role="group" aria-label="選擇貼圖平台"/);
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
  assert.match(source, /textPositionForCell\(textPosition, startIndex \+ row \* columns \+ column\)/);
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
  assert.match(source, /stickerMode,\s*stickerPlatform,\s*item\.startIndex,\s*identityLock,\s*\),/);
  assert.match(source, /\[\s*motherSheetPlan,[\s\S]*?textPosition,\s*fontStyle,[\s\S]*?stickerMode,\s*stickerPlatform,\s*identityLock,\s*\]/);
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
  assert.match(progress, /grid grid-cols-3 overflow-hidden rounded-xl/);
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
  assert.match(prompt, /min-h-screen bg-\[#F8F7F3\]/);
  assert.match(steps, /<nav/);
  assert.match(steps, /grid grid-cols-3 overflow-hidden rounded-xl/);
  assert.doesNotMatch(steps, /先知道一件事：不是一張張畫貼圖/);
  assert.match(prompt, /min-h-12 w-full min-w-0 items-center justify-center/);
  assert.match(prompt, /rows=\{Math\.min\(requiredCount \+ 1, 12\)\}/);
  assert.match(prompt, /id="sticker-customize"/);
  assert.match(help, /下一步：\{children\}/);
  assert.doesNotMatch(help, /rounded-xl bg-amber-50 px-3 py-2 text-xs font-black/);
});


test("每組貼圖選擇按鈕同寬，選取、懸停、鍵盤焦點狀態清楚", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  const animated = read("src/pages/tools/AnimatedLineStickerTool.tsx");

  // 平台與動靜態要使用等分的兩欄格線，格線本身有最大寬度，避免整頁滿版。
  assert.match(prompt, /grid-cols-2 items-stretch gap-3" role="group" aria-label="選擇貼圖平台"/);
  assert.match(prompt, /grid-cols-2 items-stretch gap-3" role="group" aria-label="選擇靜態或動態貼圖"/);
  assert.match(upload, /grid-cols-2 items-stretch gap-3" role="group" aria-label="選擇貼圖輸出平台"/);
  assert.match(animated, /grid-cols-2 items-stretch gap-3" role="group" aria-label="選擇動態貼圖輸出平台"/);

  assert.ok(prompt.includes("aria-pressed={stickerPlatform === platform}"));
  assert.ok(prompt.includes("aria-pressed={stickerMode === mode}"));
  assert.ok(prompt.includes("aria-pressed={targetCount === count}"));
  assert.ok(upload.includes('aria-pressed={exportPlatform === "whatsapp"}'));
  assert.ok(animated.includes("aria-pressed={exportPlatform === platform}"));

  // 選項使用同色系，未選擇也有明確邊框與底色，滑過和鍵盤操作有可見回饋。
  for (const source of [prompt, upload, animated]) {
    assert.ok(source.includes("hover:-translate-y-0.5"));
    assert.match(source, /hover:shadow-md/);
    assert.match(source, /focus-visible:outline-offset-2/);
    assert.match(source, /border-violet-600 bg-violet-600/);
    assert.match(source, /border-violet-200 bg-violet-50/);
  }
  // 張數按鈕為同寬且可換行，窄手機不應強迫五顆擠在同一排。
  assert.ok(prompt.includes("w-[76px] shrink-0"));
  assert.ok(prompt.includes('max-w-[520px] flex-wrap gap-2" role="group" aria-label="選擇貼圖張數"'));
  assert.ok(upload.includes("w-[68px] shrink-0"));
});

test("三階段參考版型與貼圖錨點不會產生捲動爭用", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  const flow = read("src/components/LineStickerFlowSteps.tsx");
  const scroll = read("src/components/ScrollToTop.tsx");

  assert.match(prompt, /把你的想法，做成專屬貼圖/);
  assert.match(prompt, /RXV STICKER STUDIO/);
  assert.match(prompt, /min-h-screen bg-\[#F8F7F3\]/);
  assert.match(flow, /grid grid-cols-3 overflow-hidden rounded-xl/);
  assert.match(flow, /第 1～2 步/);
  assert.match(flow, /第 3～4 步/);
  assert.match(flow, /原第 5 步/);
  assert.match(flow, /useLayoutEffect/);
  assert.match(flow, /scrollIntoView\(\{ behavior: "auto", block: "start" \}\)/);
  assert.doesNotMatch(flow, /scrollIntoView\(\{ behavior: "smooth"/);
  assert.match(scroll, /lastPathname\.current === pathname/);
  assert.match(scroll, /if \(isStickerRoute && hash\) return/);
  assert.doesNotMatch(scroll, /behavior: 'smooth'/);
  assert.match(prompt, /id="sticker-customize"/);
  assert.match(prompt, /字型風格（可選）/);
  assert.match(prompt, /WhatsApp 貼圖/);
});

test("業務個人品牌角色可選外觀並固定整套母圖，不再所有客戶套用同一男性西裝背心", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source, /const BUSINESS_AVATAR_OPTIONS =/);
  for (const key of ["persona", "hair", "clothes", "accessory", "palette"]) {
    assert.match(source, new RegExp(key + ": \\["));
  }
  assert.match(source, /useState<BusinessAvatarSelection>\(savedBusinessAvatar\)/);
  assert.match(source, /onClick=\{\(\) => setBusinessAvatar\(randomBusinessAvatar\(\)\)\}/);
  assert.match(source, /businessAvatarPrompt\(businessAvatar, businessSignature\)/);
  assert.match(source, /const effectiveRole = useMemo/);
  assert.match(source, /type === "businessPersonal" && photoMode === "original"/);
  assert.match(source, /effectiveRole,\s*style,\s*item.grid,/);
  assert.match(source, /effectiveRole,\s*style,\s*grid,\s*texts,/);
  assert.match(source, /effectiveRole,\s*style,\s*grid,\s*stickerStylePreset,/);
  assert.match(source, /localStorage\.setItem\(BUSINESS_AVATAR_STORAGE_KEY/);
  assert.match(source, /個人辨識特徵（選填）/);
  assert.match(source, /後續第 2 張母圖都必須維持同一張臉/);
  assert.match(source, /不能一格變一個人/);
  assert.doesNotMatch(source, /role: "一位親切又專業的年輕業務角色，穿襯衫與西裝背心/);
  assert.match(source, /無法保證與其他使用者絕不重複/);
});

test("角色描述組合保持每格一致，能帶入個人外觀但不額外加入名牌文字", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  const fn = source.match(/function businessAvatarPrompt\(choice: BusinessAvatarSelection, signature: string\) \{[\s\S]*?\n\}/);
  assert.ok(fn, "缺少業務角色提示詞建構函式");
  const javascript = ts.transpileModule(fn[0], { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const format = vm.runInNewContext(javascript + "\nbusinessAvatarPrompt", {});
  const choice = {
    persona: "30 歲台灣女性顧問",
    hair: "短黑髮",
    clothes: "淡綠色西裝",
    accessory: "小型圓框眼鏡",
    palette: "薄荷與米色",
  };
  const result = format(choice, "左臉小酒窩");
  for (const expected of Object.values(choice)) assert.ok(result.includes(expected));
  assert.match(result, /左臉小酒窩/);
  assert.match(result, /同一張臉、髮型、服裝/);
  assert.match(result, /不得變成道具上額外文字或商標/);
  assert.doesNotMatch(format(choice, ""), /自訂辨識特徵：/);
  assert.doesNotMatch(format(choice, "a".repeat(300)), /a{181}/);
});

test("單張上傳與整張母圖清楚區分，1/16 不誤導新手以為文字太多", () => {
  const upload = read("src/pages/tools/LineStickerTool.tsx");
  assert.match(upload, /const mayHaveUploadedMotherSheetAsSingle =/);
  assert.match(upload, /files\.length === 1 && stickerCount > 1 && motherSheetDetections\.length === 0/);
  assert.match(upload, /您可能把整張母圖傳到「單張貼圖」區了/);
  assert.match(upload, /這不是「字太多」的判定/);
  assert.match(upload, /改用整張母圖自動切割/);
  assert.match(upload, /onClick=\{\(\) => motherSheetInputRef\.current\?\.click\(\)\}/);
  assert.match(upload, /備用功能：已切好的單張貼圖上傳/);
  assert.match(upload, /我已切成單張｜選擇 PNG／WebP（可多選）/);
  assert.match(upload, /aria-label="已切好的單張貼圖補充上傳區"/);
  assert.match(upload, /目前只載入 1 張獨立貼圖/);
  assert.doesNotMatch(upload, /第 3 步｜點這裡上傳圖片（可一次多選）/);
});


test("五種張數採共用母圖配置及全域起訖序號", () => {
  const source = read("src/lib/lineStickerFlow.ts");
  const match = source.match(/const MOTHER_SHEET_GRIDS:[\s\S]*?\nfunction makeProjectId\(/);
  assert.ok(match, "需以共用母圖版型表格產生分頁");
  const code = match[0].replace(/\nfunction makeProjectId\($/, "");
  const compiled = ts.transpileModule(code.replace("export function getMotherSheetPlan", "function getMotherSheetPlan"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  const plans = vm.runInNewContext(compiled + "\ngetMotherSheetPlan", {});
  const expected = [
    [8, [["4x2", 0, 8]]],
    [16, [["4x4", 0, 16]]],
    [24, [["4x4", 0, 16], ["4x2", 16, 24]]],
    [32, [["4x4", 0, 16], ["4x4", 16, 32]]],
    [40, [["4x5", 0, 20], ["4x5", 20, 40]]],
  ];
  for (const [count, expectedItems] of expected) {
    const actual = plans(count).map(({grid, startIndex, endIndex}) => [grid, startIndex, endIndex]);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), expectedItems, count + " 張");
  }
});
test("兩張母圖的角色與字型鎖定相同，文字位置三種模式互斥", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source, /function makeStickerIdentityLock/);
  assert.match(source, /identityLock,\s*\),/);
  assert.match(source, /第 1 張已完成母圖/);
  assert.match(source, /同一個 ChatGPT 對話/);
  assert.match(source, /整套貼圖共用角色設定/);
  assert.match(source, /type StickerIdentity/);
  assert.match(source, /startIndex \+ row \* columns \+ column/);
  assert.doesNotMatch(source, /- 左右交錯時，奇數格文字在左、偶數格文字在右，人物必須在相反側/);
  const fnMatch = source.match(/function buildFlowPrompt\([\s\S]*?\n\}/);
  assert.ok(fnMatch);
  const textPositionMatch = source.match(/function textPositionForCell\([\s\S]*?\n\}/);
  assert.ok(textPositionMatch);
  const sandbox = {
    buildPrompt: () => "共用基本角色文字",
    textPositionForCell: vm.runInNewContext(
      ts.transpileModule(textPositionMatch[0], { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\ntextPositionForCell"
    ),
  };
  const fn = vm.runInNewContext(
    ts.transpileModule(fnMatch[0], { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nbuildFlowPrompt",
    sandbox,
  );
  for (const [grid,startIndex,items] of [["4x2",16,8],["4x4",16,16],["4x5",20,20]]) {
    for (const position of ["top","bottom","mixed"]) {
      const lock = "LOCK_KEY:眼睛固定_服裝固定_字色固定_描邊固定";
      const generated = fn("美甲師", "固定人物", "固定畫風", grid, Array.from({length:items},(_,i)=>"短句"+(startIndex+i+1)), "large","colorfulWhite",position,"roundBold","cuteQ","original",2,"animated","line",startIndex,lock);
      assert.ok(generated.includes(lock));
      assert.ok(generated.includes("同一個 ChatGPT 對話"));
      const matrix = generated.split("每格短句位置必須依下表")[1].split("重要規則：")[0];
      if (position === "top") {
        assert.match(matrix,/文字放正上方/);
        assert.doesNotMatch(matrix,/文字放左側|文字放右側/);
      } else if (position === "bottom") {
        assert.match(matrix,/文字放正下方/);
        assert.doesNotMatch(matrix,/文字放左側|文字放右側/);
      } else {
        assert.match(matrix,/文字放左側、人物放右側/);
        assert.match(matrix,/人物放左側、文字放右側/);
        assert.doesNotMatch(matrix,/文字放正上方|文字放正下方/);
      }
      assert.match(generated,/13%～15%/);
      assert.match(generated,/每格主體與文字共佔中央約 70%～74%/);
    }
  }
});
test("參考圖僅在多母圖顯示，瀏覽器本地預覽及清理物件 URL", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source,/index === 1 && \(/);
  assert.match(source,/選擇第 1 張參考圖/);
  assert.match(source,/URL\.createObjectURL\(file\)/);
  assert.match(source,/URL\.revokeObjectURL\(referenceUrlRef\.current\)/);
  assert.match(source,/image\/png,image\/jpeg,image\/webp/);
  assert.match(source,/尚未選擇參考圖/);
  assert.match(source,/網站不會自動把圖交給 ChatGPT/);
  assert.match(source,/referenceSeriesRef\.current !== seriesKey/);
  assert.match(source,/移除參考圖/);
  assert.doesNotMatch(source,/supabase\.storage\.upload\(referenceImage/);
});
