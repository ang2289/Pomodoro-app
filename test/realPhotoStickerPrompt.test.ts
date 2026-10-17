import assert from "node:assert/strict";
import { test } from "node:test";
import {
  REAL_PHOTO_SUBMODE_OPTIONS,
  REAL_PHOTO_VARIETY,
  buildExpressiveCellPlan,
  realPhotoPolicy,
} from "../src/lib/realPhotoStickerPrompts";

test("真人原貌與延伸多表情的規則互斥", () => {
  assert.equal(REAL_PHOTO_SUBMODE_OPTIONS.length, 2);
  const a = realPhotoPolicy("unchanged");
  const b = realPhotoPolicy("expressive");
  assert.match(a.role, /不得透過 AI 重新生成真人臉孔/);
  assert.match(a.identity, /不可變更原照片五官、表情/);
  assert.match(a.variation, /不可變更人物原照片的表情/);
  assert.doesNotMatch(a.role, /允許 AI 自然延伸/);
  assert.match(b.role, /允許 AI 自然延伸/);
  assert.match(b.role, /寫實攝影/);
  assert.match(b.role, /同一位真實人物/);
  assert.doesNotMatch(b.role, /不得透過 AI 重新生成真人臉孔/);
  assert.doesNotMatch(b.identity, /不生成新人物、不改臉、不重新繪畫/);
  assert.match(b.reminder, /可能產生與原照片不同的細節/);
  assert.match(b.reminder, /照片原貌模式/);
  assert.match(REAL_PHOTO_VARIETY, /開懷大笑/);
  assert.match(REAL_PHOTO_VARIETY, /抱玩偶/);
  assert.match(REAL_PHOTO_VARIETY, /嬰幼兒頭身比例/);
});

test("模式 B：16 格每格指定表情及動作，且對應語意", () => {
  const texts = [
    "早安", "哈哈太好笑了", "真的嗎", "有點委屈", "想睡覺", "好的", "嘿嘿", "請問",
    "抱抱", "謝謝你", "害羞了", "期待見面", "加油", "平安喜樂", "太厲害", "請稍等",
  ];
  const plan = buildExpressiveCellPlan(texts);
  const rows = plan.split("\n");
  assert.equal(rows.length, 16);
  assert.match(rows[0], /第 1 格「早安」：微笑＋揮手/);
  assert.match(rows[9], /第 10 格「謝謝你」：感謝＋雙手輕靠胸前/);
  assert.match(rows[12], /第 13 格「加油」：開心＋握拳加油/);
  for (const [i, row] of rows.entries()) {
    assert.match(row, new RegExp(`第 ${i+1} 格「`));
    assert.match(row, /頭部角度、眼神及手勢/);
  }
  assert.equal(new Set(rows.map(row => row.split("：")[1]?.split("；")[0])).size, 16);
});

test("24 張中 4x4 與 4x2 母圖的 24 組動作都不重複", () => {
  const first = buildExpressiveCellPlan(Array.from({length: 16}, () => "好的"), 0).split("\n");
  const second = buildExpressiveCellPlan(Array.from({length: 8}, () => "好的"), 16).split("\n");
  assert.equal(first.length, 16);
  assert.equal(second.length, 8);
  assert.match(second[0], /第 17 格/);
  assert.match(second[7], /第 24 格/);
  const sets = [...first, ...second].map(x => x.split("：")[1]?.split("；")[0]);
  assert.equal(new Set(sets).size, 24);
});

test("模式 B：第 2 張必須附原始真人照片＋第 1 張母圖", () => {
  for(const mode of ["unchanged","expressive"] as const){
    const second = realPhotoPolicy(mode).secondSheet;
    assert.match(second, /原始真人照片/);
    assert.match(second, /第 1 張已完成母圖/);
  }
  assert.match(realPhotoPolicy("expressive").secondSheet, /短句、表情、頭部角度與動作不得重複/);
  assert.match(realPhotoPolicy("unchanged").secondSheet, /不生成新表情或動作/);
});