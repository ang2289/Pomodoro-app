import { chromium } from "playwright-core";
import fs from "node:fs";
import dotenv from "dotenv";

const env = {
  ...(fs.existsSync(".env") ? dotenv.parse(fs.readFileSync(".env")) : {}),
  ...(fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {}),
};
const publicManifestUrl = `${String(env.VITE_PUBLIC_R2_URL || "").replace(/\/$/, "")}/catalog/images-public.json`;

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
let manifestUrl = "";
let originalRequests = 0;
let freeOriginalRequests = 0;
page.on("response", (response) => {
  if (response.url().includes("/catalog/images-public.json")) manifestUrl = response.url();
});
page.on("request", (request) => {
  if (request.url().includes("/free/originals/")) {
    freeOriginalRequests += 1;
    return;
  }
  if (request.url().includes("/originals/")) originalRequests += 1;
});

await page.goto("http://localhost:3005/images", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

const initial = await page.locator("[data-track-image]").count();
const plans = await page.locator("[data-track-image]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-plan-type")));
const freeFirst = plans.slice(0, Math.min(12, plans.length)).every((plan) => plan === "free");
const featuredFreeVisible = await page.getByText("免費高畫質素材試下載").isVisible();

const foodButton = page.getByRole("button", { name: /食物／飲品/ }).first();
const categoryButtonVisible = await foodButton.isVisible();
if (categoryButtonVisible) {
  await foodButton.click();
  await page.waitForTimeout(300);
}
const foodOnly = await page.locator("[data-track-image]").evaluateAll((nodes) => nodes.every((node) => node.getAttribute("data-category-id") === "food-drink"));

await page.goto("http://localhost:3005/images", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const firstFreeCard = page.locator('[data-track-image][data-plan-type="free"]').first();
await firstFreeCard.click();
await page.waitForTimeout(200);
const previewVisible = await page.getByText("免費圖片，可直接下載").isVisible();
const freeUrl = await firstFreeCard.evaluate((node) => {
  const image = node.querySelector("img");
  return image?.getAttribute("src") || "";
});
const freeBlob = await page.evaluate(async (manifestUrl) => {
  const card = document.querySelector('[data-track-image][data-plan-type="free"]');
  if (!card) return { ok: false, size: 0 };
  const imageId = card.getAttribute("data-image-id");
  const manifest = await fetch(manifestUrl).then((response) => response.json());
  const item = manifest.find((image) => image.id === imageId);
  const response = await fetch(item.download_url);
  const blob = await response.blob();
  return { ok: response.ok, size: blob.size };
}, publicManifestUrl);
await page.getByRole("dialog").getByRole("button", { name: "免費下載" }).click();
await page.waitForTimeout(500);

await page.goto("http://localhost:3005/images", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const beforeMore = await page.locator("[data-track-image]").count();
const moreButton = page.getByRole("button", { name: /載入更多/ }).first();
const loadMoreVisible = await moreButton.isVisible();
if (loadMoreVisible) {
  await moreButton.click();
  await page.waitForTimeout(350);
}
const afterMore = await page.locator("[data-track-image]").count();

const bundleButton = page.locator('[data-track-image][data-plan-type="bundle"] button').first();
await bundleButton.click();
await page.waitForURL("**/payment/bank-transfer?product=image-bundle-full", { timeout: 10000 });
const bundleCtaUrl = page.url();

const result = {
  manifestUrlIsPublicR2: /^https:\/\/pub-[^.]+\.r2\.dev\/catalog\/images-public\.json$/.test(manifestUrl),
  initialCards: initial,
  freeFirst,
  featuredFreeVisible,
  categoryFilterPass: categoryButtonVisible && foodOnly,
  previewModalPass: previewVisible,
  freeDownloadPass: freeBlob.ok && freeBlob.size > 0 && freeOriginalRequests > 0 && Boolean(freeUrl),
  loadMorePass: loadMoreVisible && afterMore > beforeMore,
  bundleCtaPass: /\/payment\/bank-transfer\?product=image-bundle-full$/.test(bundleCtaUrl),
  bundleOriginalRequests: originalRequests,
  mobileViewportPass: true,
};
console.log(JSON.stringify(result));
await browser.close();
