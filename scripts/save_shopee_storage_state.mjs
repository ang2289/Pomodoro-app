import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const PROJECT_ROOT = process.cwd();
const PROFILE_DIR = path.join(PROJECT_ROOT, "playwright_shopee_profile");
const OUT_FILE = path.join(PROJECT_ROOT, "scripts", ".shopee_storage_state.json");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  ensureDir(path.dirname(OUT_FILE));
  ensureDir(PROFILE_DIR);

  console.log("[START] save_shopee_storage_state");
  console.log("[PROFILE_DIR]", PROFILE_DIR);
  console.log("[OUT_FILE]", OUT_FILE);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    noViewport: true,
    args: [
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = context.pages()[0] || await context.newPage();

  console.log("[OPEN] https://shopee.tw/");
  await page.goto("https://shopee.tw/", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });

  console.log("");
  console.log("========================================");
  console.log("請在彈出的瀏覽器中手動完成蝦皮登入。");
  console.log("如果驗證框太下面，請先：");
  console.log("1. 最大化視窗");
  console.log("2. 按 Ctrl + - 縮小到 80% 或 67%");
  console.log("3. 必要時按 F11 全螢幕");
  console.log("登入成功後，請回到這個黑窗按 Enter。");
  console.log("========================================");
  console.log("");

  process.stdin.resume();
  await new Promise((resolve) => process.stdin.once("data", resolve));

  await page.goto("https://shopee.tw/", {
    waitUntil: "networkidle",
    timeout: 120000,
  }).catch(() => {});

  await context.storageState({ path: OUT_FILE });

  console.log("[DONE] storageState saved:", OUT_FILE);

  if (fs.existsSync(OUT_FILE)) {
    const stat = fs.statSync(OUT_FILE);
    console.log("[FILE_SIZE]", stat.size, "bytes");
  }

  await context.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("[ERROR]", err?.message || err);
  process.exit(1);
});