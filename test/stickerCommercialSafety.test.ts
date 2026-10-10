import assert from "node:assert/strict";
import test from "node:test";
import { stickerSaleTextRisks, suggestSaleFriendlyLines, suggestSaleFriendlyText } from "../src/lib/stickerCommercialSafety";

test("normal support and daily greetings pass the non-advertising text check", () => {
  assert.deepEqual(stickerSaleTextRisks(["歡迎訂花", "已收到訂單", "謝謝支持", "情人節快樂"]), []);
});

test("florist preorder and scarcity messages are flagged with safer daily phrases", () => {
  const risks = stickerSaleTextRisks(["情人節預購", "母親節預購", "限量花材"]);
  assert.equal(risks.length, 3);
  assert.deepEqual(risks.map((risk) => risk.replacement), ["情人節快樂", "母親節快樂", "花香滿滿"]);
});

test("direct purchase links and discounts are flagged", () => {
  assert.equal(stickerSaleTextRisks(["請掃碼下單", "折扣 200 元", "https://shop.example"]).length, 3);
});

test("safe suggestions leave ordinary captions unchanged", () => {
  assert.equal(suggestSaleFriendlyText("花束完成"), "花束完成");
  assert.deepEqual(suggestSaleFriendlyLines(["母親節預購", "卡片寫好了"]), ["母親節快樂", "卡片寫好了"]);
});
