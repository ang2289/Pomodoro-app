import { test } from "node:test";
import assert from "node:assert/strict";
import { AI_IMAGE_100_GROUPS, AI_IMAGE_100_STYLES } from "../src/data/aiImage100Styles";
import { AI_IMAGE_100_PRESET_SETTINGS } from "../src/data/aiImage100PresetSettings";

test("100 組中文主題完整且每組都有獨立最佳化預設", () => {
  const ids = AI_IMAGE_100_STYLES.map((item) => item.id);
  assert.equal(AI_IMAGE_100_GROUPS.length, 10);
  assert.equal(ids.length, 100);
  assert.equal(new Set(ids).size, 100);
  assert.equal(Object.keys(AI_IMAGE_100_PRESET_SETTINGS).length, 100);
  assert.deepEqual(new Set(Object.keys(AI_IMAGE_100_PRESET_SETTINGS)), new Set(ids));
  for (const item of AI_IMAGE_100_STYLES) {
    const tune = AI_IMAGE_100_PRESET_SETTINGS[item.id];
    assert.ok(tune, `缺少 ${item.title} 的預設`);
    for (const field of ["purpose", "style", "mood", "composition", "ratio", "focus"] as const) {
      assert.ok(tune[field]?.trim(), `${item.title} 的 ${field} 不可空白`);
    }
    assert.ok(tune.enhancements.length >= 3, `${item.title} 缺少加強效果`);
    assert.ok(tune.avoids.length >= 4, `${item.title} 缺少排除項目`);
    assert.ok(new Set(tune.enhancements).size === tune.enhancements.length);
    assert.ok(new Set(tune.avoids).size === tune.avoids.length);
    assert.ok(["1:1", "4:5", "9:16", "16:9", "4:3"].includes(tune.ratio));
  }
});

test("常用風格依主題有不同構圖與品質選項", () => {
  const mini = AI_IMAGE_100_PRESET_SETTINGS.miniworkers;
  const ad = AI_IMAGE_100_PRESET_SETTINGS.surrealad;
  const chibi = AI_IMAGE_100_PRESET_SETTINGS.chibi;
  const rose = AI_IMAGE_100_PRESET_SETTINGS.rose;
  assert.equal(mini.ratio, "9:16");
  assert.equal(mini.composition, "主角＋迷你分身圍繞");
  assert.equal(ad.composition, "商品置中展示");
  assert.equal(chibi.style, "Q版可愛風");
  assert.equal(rose.composition, "特寫近景");
  assert.notEqual(mini.focus, ad.focus);
  assert.notDeepEqual(mini.enhancements, chibi.enhancements);
});
