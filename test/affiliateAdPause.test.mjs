import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const visibility = read("src/config/affiliateAdVisibility.ts");

test("聯盟分潤廣告開關預設關閉、保留恢復能力", () => {
  assert.match(visibility, /export const SHOW_AFFILIATE_ADS:\s*boolean\s*=\s*false/);
});

test("Coupang 動態與舊版廣告均由總開關阻止 iframe 掛載", () => {
  for (const path of ["src/components/CoupangDynamicAd.tsx", "src/components/CoupangAd.tsx"]) {
    const source = read(path);
    assert.match(source, /import \{ SHOW_AFFILIATE_ADS \}/, path);
    assert.match(source, /if \(!SHOW_AFFILIATE_ADS/, path);
  }
});

test("Fotor / PhotoRoom 推廣區暫停，既有內容不刪除", () => {
  const files = [
    ["src/pages/tools/ai-summary.tsx", "FotorAffiliateBlock"],
    ["src/pages/tools/ImageToVideo.tsx", "FotorAffiliateBlock"],
    ["src/pages/tools/homework-helper.tsx", "FotorAffiliateBlock"],
    ["src/pages/tools/ImageConvert.tsx", "PhotoRoomAffiliateBlock"],
    ["src/pages/tools/ImageCropPage.tsx", "PhotoRoomAffiliateBlock"],
    ["src/pages/tools/ImageCompress.tsx", "PhotoRoomAffiliateBlock"],
    ["src/pages/tools/QrCodeTool.tsx", "PhotoRoomAffiliateBlock"],
    ["src/pages/tools/ImageResize.tsx", "PhotoRoomAffiliateBlock"],
  ];
  for (const [path, name] of files) {
    const source = read(path);
    assert.match(source, /import \{ SHOW_AFFILIATE_ADS \}/, path);
    assert.ok(source.includes('function ' + name + '() {\n  if (!SHOW_AFFILIATE_ADS) return null;'), path);
    assert.ok(source.includes("<" + name + " />"), path);
  }
});

test("首頁、工具首頁及圖片庫推薦區以總開關條件顯示", () => {
  for (const path of ["src/pages/index.tsx", "src/pages/tools/index.tsx", "src/pages/images/index.tsx"]) {
    const source = read(path);
    assert.match(source, /import \{ SHOW_AFFILIATE_ADS \}/, path);
    assert.match(source, /\{SHOW_AFFILIATE_ADS && \(/, path);
  }
  const image = read("src/pages/images/index.tsx");
  assert.ok(image.includes("覺得這頁有用，也可以分享給朋友"), "圖片庫分享按鈕不可移除");
  assert.ok(image.includes("CoupangDynamicAd"), "保留原始嵌入以便未來重啟");
});

test("分潤廣告開關不得關閉網站付費、圖片下載及自家推廣", () => {
  const app = read("src/App.tsx");
  assert.ok(app.includes("MainLayout"));
  const banner = read("src/components/CoupangDynamicAd.tsx");
  assert.ok(banner.includes("ads-partners.tw.coupang.com"), "暫停為隱藏而非刪除設定");
  assert.ok(!visibility.includes("APP_ADS_ENABLED"));
});
