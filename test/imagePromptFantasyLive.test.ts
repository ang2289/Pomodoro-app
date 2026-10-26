import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  FANTASY_OPTIONS, FANTASY_SERIES, FANTASY_THEMES, composeFantasyPrompt,
} from "../src/data/imagePromptFantasy";

test("新增六系列共 48 組，各主題 ID 不重複", () => {
  assert.equal(FANTASY_SERIES.length, 6);
  assert.equal(FANTASY_THEMES.length, 48);
  assert.equal(new Set(FANTASY_THEMES.map((theme) => theme.id)).size, 48);
  for (const series of FANTASY_SERIES) {
    assert.equal(FANTASY_THEMES.filter((theme) => theme.category === series.key).length, 8);
  }
});

test("每個系列的適用選項均有預設值，內容與主題同步", () => {
  for (const theme of FANTASY_THEMES) {
    const options = FANTASY_OPTIONS[theme.category];
    for (const field of ["person", "visualStyle", "clothing", "expression", "pose", "background", "palette"] as const) {
      assert.ok(options[field].includes(theme.defaults[field]), `${theme.title}: ${field}`);
    }
    const prompt = composeFantasyPrompt(theme, theme.defaults);
    assert.ok(prompt.includes(theme.title));
    assert.ok(prompt.includes("9:16"));
    assert.ok(prompt.includes(theme.defaults.background));
    assert.ok(theme.fullPrompt.includes(theme.title));
  }
});

test("人物、畫風、服裝、表情、動作、背景、色系、場景、比例及構圖切換均改變提示詞", () => {
  const theme = FANTASY_THEMES.find((theme) => theme.category === "miniFairyWorld")!;
  const base = composeFantasyPrompt(theme, theme.defaults);
  for (const field of ["person", "visualStyle", "clothing", "expression", "pose", "background", "palette"] as const) {
    const choice = FANTASY_OPTIONS[theme.category][field].find((value) => value !== theme.defaults[field]);
    assert.ok(choice, field);
    const selected = { ...theme.defaults, [field]: choice! };
    const prompt = composeFantasyPrompt(theme, selected);
    assert.notEqual(prompt, base, `切換 ${field} 必須改變提示詞`);
    assert.ok(prompt.includes(choice!), `提示詞應包含已選 ${field}`);
  }
  assert.notEqual(composeFantasyPrompt(theme, theme.defaults, "16:9"), base);
  assert.notEqual(composeFantasyPrompt({ ...theme, scene: "水晶樹屋中的迷你分身" }, theme.defaults), base);
  assert.notEqual(composeFantasyPrompt(theme, theme.defaults, "9:16", false, 1), base);
});

test("水下人物與 PVC 公仔使用不同材質規則", () => {
  const underwater = FANTASY_THEMES.find((t) => t.category === "underwaterPrincess")!;
  const toy = FANTASY_THEMES.find((t) => t.category === "bobblehead")!;
  const waterPrompt = composeFantasyPrompt(underwater, underwater.defaults);
  const toyPrompt = composeFantasyPrompt(toy, toy.defaults);
  assert.ok(waterPrompt.includes("真實焦散光線"));
  assert.ok(!waterPrompt.includes("金屬彈簧"));
  assert.ok(toyPrompt.includes("金屬彈簧"));
  assert.ok(toyPrompt.includes("模製塑膠"));
});

test("真人照片模式僅在開啟時要求上傳相片", () => {
  const theme = FANTASY_THEMES.find((t) => t.category === "photoBobblehead")!;
  const on = composeFantasyPrompt(theme, theme.defaults, "9:16", true);
  const off = composeFantasyPrompt(theme, theme.defaults, "9:16", false);
  assert.ok(on.includes("在 ChatGPT 一併上傳"));
  assert.ok(on.includes("保留人物可辨識"));
  assert.ok(!off.includes("在 ChatGPT 一併上傳"));
  assert.ok(!off.includes("保留人物可辨識"));
  assert.ok(off.includes("原創女性"));
  assert.ok(!off.includes("依照片服裝"));
});

test("UI 分類按鈕會套用主題，右側自動同步並自動撐高", () => {
  const source = readFileSync("src/pages/tools/ImagePromptGenerator.tsx", "utf8");
  assert.match(source, /onClick=\{\(\) => selectFantasySeries\(series\.key\)\}/);
  assert.match(source, /onClick=\{\(\) => applyPreset\(theme\.id as PresetKey\)\}/);
  assert.match(source, /scene: fantasyScene\.trim\(\)/);
  assert.match(source, /setFantasyOptions\(\(previous\)/);
  assert.match(source, /\{!fantasyTheme && \(/);
  assert.match(source, /Math\.max\(element\.scrollHeight/);
  assert.match(source, /rows=\{22\}/);
  assert.match(source, /w-full min-w-0 items-center justify-center/);
});
