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
  assert.match(prompt, /const rowAssignment = stickerRowMap/);
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

test("互斥文字位置共用一套規則，全域第 17～40 格不重新計算", () => {
  const source = read("src/lib/stickerCharacterLock.ts");
  const segment = source.match(/export function stickerPlacement\(position: StickerTextPosition, globalIndex: number\): string \{[\s\S]*?\n\}/);
  assert.ok(segment);
  const javascript = ts.transpileModule(segment[0].replace("export function", "function"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const position = vm.runInNewContext(javascript + "\nstickerPlacement", {});
  for (let index = 0; index < 40; index += 1) {
    assert.match(position("mixed", index), index % 2 === 0 ? /文字只放左側/ : /文字只放右側/);
    assert.match(position("top", index), /文字只放正上方/);
    assert.match(position("bottom", index), /文字只放正下方/);
  }
  assert.doesNotMatch(read("src/pages/tools/StickerPromptGenerator.tsx"), /- 左右交錯時，奇數格文字在左、偶數格文字在右/);
});

test("第 2 步顯示全部已選設定，母圖提示詞逐格指定位置並支援平台及動靜態", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source, /stickerRowMap\(/);
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
  assert.match(source, /stickerMode,\s*stickerPlatform,\s*item.startIndex,\s*flowTexts,\s*promptProfile.characterLockText,/);
  assert.match(source, /motherSheetPlan,[\s\S]*?promptProfile.textPosition,\s*promptProfile.fontStyle,[\s\S]*?stickerMode,\s*stickerPlatform,\s*promptProfile.characterLockText/);
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
  assert.match(source, /promptProfile.role,\s*promptProfile.style,\s*item.grid,/);
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

test("8／16／24／32／40 張分頁精確，並支援未來 48 張同一規則", () => {
  const source = read("src/lib/lineStickerFlow.ts");
  const a = source.indexOf("const PRESET_MOTHER_SHEET_PAGES:");
  const b = source.indexOf("function makeProjectId()", a);
  assert.ok(a >= 0 && b > a);
  const code = ts.transpileModule(
    source.slice(a, b).replace("export function getMotherSheetPlan", "function getMotherSheetPlan"),
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  const plan = vm.runInNewContext(code + "\ngetMotherSheetPlan", {});
  for (const [count, grids] of [
    [8, ["4x2"]], [16, ["4x4"]], [24, ["4x4", "4x2"]],
    [32, ["4x4", "4x4"]], [40, ["4x5", "4x5"]],
    [48, ["4x4", "4x4", "4x4"]],
  ]) {
    const pages = plan(count);
    assert.deepEqual(Array.from(pages, p => p.grid), grids);
    assert.equal(pages[0].startIndex, 0);
    assert.equal(pages.at(-1).endIndex, count);
    assert.equal(pages.reduce((sum, page) => sum + page.count, 0), count);
    pages.forEach((page, index) => {
      assert.equal(page.endIndex - page.startIndex, page.count);
      if (index) assert.equal(page.startIndex, pages[index - 1].endIndex);
    });
  }
  assert.throws(() => plan(17), /8 的倍數/);
});

test("角色與文字鎖定每張使用同一設定，包含美甲師服裝、五官及文字樣式", () => {
  const source = read("src/lib/stickerCharacterLock.ts");
  function compile(name) {
    const expression = new RegExp("export function " + name + "[\\s\\S]*?\\n\\}");
    const section = source.match(expression)?.[0];
    assert.ok(section, "missing " + name);
    return ts.transpileModule(section.replace("export function", "function"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).outputText;
  }
  const funcs = compile("defaultCharacterLock") + compile("lockCharacterPrompt");
  const ctx = vm.runInNewContext(funcs + "\n({ defaultCharacterLock, lockCharacterPrompt })", {});
  const details = ctx.defaultCharacterLock("美甲師", "專業的美甲師");
  assert.match(details.clothing, /圍裙/);
  details.hair = "紫色雙馬尾";
  details.clothing = "湖水綠圍裙";
  details.accessory = "銀色髮夾";
  const style = "固定 Q 版粗線條與細緻高光";
  const typography = { font:"圓體", size:"大字", color:"粉字粗白邊", position:"文字正上方" };
  const sheetOne = ctx.lockCharacterPrompt(details, style, typography);
  const sheetTwo = ctx.lockCharacterPrompt(details, style, typography);
  assert.equal(sheetOne, sheetTwo);
  for (const token of ["紫色雙馬尾", "湖水綠圍裙", "銀色髮夾", "粉字粗白邊", "臉部", "頭身比例", "描邊"]) {
    assert.ok(sheetOne.includes(token), token);
  }
  assert.match(sheetOne, /不得自行重新設計角色/);
});

test("單一文字位置套用到每格，跨第 2 張母圖不反轉、不同位置互斥", () => {
  const source = read("src/lib/stickerCharacterLock.ts");
  function part(name) {
    const section = source.match(new RegExp("export function " + name + "[\\s\\S]*?\\n\\}"))?.[0];
    assert.ok(section);
    return ts.transpileModule(section.replace("export function", "function"), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  }
  const ctx = vm.runInNewContext(
    part("stickerPlacement") + part("stickerPlacementRule") + part("stickerRowMap") +
      "\n({ stickerPlacement, stickerPlacementRule, stickerRowMap })",
    {},
  );
  const texts = Array.from({length:40},(_,i)=>"短句" + (i + 1));
  const sheet = { grid: "4x5", startIndex:20, endIndex:40 };
  const mixed = ctx.stickerRowMap(sheet, texts, "mixed");
  assert.match(mixed, /整套第 21 張.*文字只放左側/);
  assert.match(mixed, /整套第 22 張.*文字只放右側/);
  assert.match(mixed, /整套第 40 張.*文字只放右側/);
  const top = ctx.stickerRowMap(sheet, texts, "top");
  assert.doesNotMatch(top, /文字只放左側|文字只放右側/);
  assert.match(top, /整套第 40 張.*文字只放正上方/);
  const bottom = ctx.stickerRowMap(sheet, texts, "bottom");
  assert.doesNotMatch(bottom, /文字只放正上方|文字只放左側/);
  assert.match(bottom, /文字只放正下方/);
  assert.doesNotMatch(ctx.stickerPlacementRule("top"), /交錯/);
  assert.doesNotMatch(ctx.stickerPlacementRule("bottom"), /交錯/);
});

test("第二張角色參考圖僅保留瀏覽器本機，選圖、清除與跨張數安全", () => {
  const prompt = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(prompt, /motherSheetPlan.length > 1/);
  assert.match(prompt, /第 3 步｜鎖定角色/);
  assert.match(prompt, /第 4 步｜生成第 2 張/);
  assert.match(prompt, /accept="image\/png,image\/jpeg,image\/webp"/);
  assert.match(prompt, /URL.createObjectURL\(file\)/);
  assert.match(prompt, /URL.revokeObjectURL\(characterReference.url\)/);
  assert.match(prompt, /characterReference\?\.scope === referenceScope/);
  assert.match(prompt, /clearCharacterReference\(\)/);
  assert.match(prompt, /已選擇：\{activeReference.name\}/);
  assert.match(prompt, /沒有附上參考圖也能複製本提示詞/);
  assert.match(prompt, /不會自動把圖片傳送給 ChatGPT/);
  assert.match(prompt, /第 1 張母圖/);
  assert.match(prompt, /const characterLockText = useMemo/);
  assert.match(prompt, /characterLockText,/);
  assert.match(prompt, /lockCharacterPrompt\(/);
});

test("複製第 1 張後自動鎖住整套角色、服裝與文字風格，第二張無法意外改設定", () => {
  const source = read("src/pages/tools/StickerPromptGenerator.tsx");
  assert.match(source, /const \[lockedProfile, setLockedProfile\] = useState/);
  assert.match(source, /if \(index === 0 && !activeProfile\) setLockedProfile\(currentProfile\)/);
  assert.match(source, /const promptProfile = activeProfile \?\? currentProfile/);
  assert.match(source, /promptProfile\.role/);
  assert.match(source, /promptProfile\.style/);
  assert.match(source, /promptProfile\.textColor/);
  assert.match(source, /promptProfile\.textPosition/);
  assert.match(source, /promptProfile\.characterLockText/);
  assert.match(source, /解鎖並重新製作第 1 張/);
  assert.match(source, /setLockedProfile\(null\)/);
  assert.match(source, /已在 RXV 選取參考圖/);
  assert.match(source, /本網站僅複製文字，不會自動附圖或上傳/);
  assert.match(source, /const referenceScope = JSON\.stringify/);
});
