import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_PROJECT_URL ||
  "";

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

if (!url || !serviceKey) {
  console.error("[FAIL] 找不到 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY。");
  console.error("請確認 D:\\Pomodoro-app\\.env.local 已有原本網站使用的 Supabase 連線設定。");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "images";
const PREFIX = "images";
const MAX_SAFE_FILES = 1600;

async function listAllFiles() {
  const all = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    for (const item of rows) {
      if (!item?.name) continue;
      // List at prefix returns names relative to the prefix.
      all.push(`${PREFIX}/${item.name}`);
    }
    if (rows.length < limit) break;
    offset += limit;
  }
  return all;
}

async function main() {
  console.log("RXV Supabase 舊圖片清理");
  console.log(`只允許刪除 bucket=${BUCKET}、prefix=${PREFIX}/`);
  console.log("不會碰 storefronts/、portfolio/、group-buy/ 或其他路徑。");
  console.log("");

  let files;
  try {
    files = await listAllFiles();
  } catch (e) {
    console.error("[FAIL] 無法列出 Storage 檔案：", e?.message || e);
    console.error("若顯示 402 / restricted，代表目前 Supabase 限制狀態不允許 Storage API 操作。");
    process.exit(2);
  }

  const unsafe = files.filter((p) => !p.startsWith(`${PREFIX}/`));
  if (unsafe.length) {
    console.error("[ABORT] 發現不符合安全前綴的路徑，已中止：", unsafe.slice(0, 10));
    process.exit(3);
  }

  console.log(`[CHECK] 待刪檔案：${files.length}`);
  if (files.length === 0) {
    console.log("[DONE] 沒有可刪除的舊 images/ 檔案。");
    return;
  }
  if (files.length > MAX_SAFE_FILES) {
    console.error(`[ABORT] 待刪數量 ${files.length} 超過安全上限 ${MAX_SAFE_FILES}，不執行。`);
    process.exit(4);
  }

  console.log("[CHECK] 前 10 個路徑：");
  files.slice(0, 10).forEach((p) => console.log("  ", p));
  console.log("");

  const confirm = process.argv.includes("--confirm-delete");
  if (!confirm) {
    console.log("[DRY RUN] 尚未刪除。");
    console.log("確認數量與路徑正確後，再執行：");
    console.log("npm exec tsx scripts/delete-old-supabase-images.ts -- --confirm-delete");
    return;
  }

  let deleted = 0;
  const batchSize = 100;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const { data, error } = await supabase.storage.from(BUCKET).remove(batch);
    if (error) {
      console.error(`[FAIL] 第 ${i + 1}-${i + batch.length} 筆刪除失敗：`, error.message || error);
      console.error(`[INFO] 已成功刪除約 ${deleted} 筆，請勿重建已刪檔案。再次執行會只刪剩餘檔案。`);
      process.exit(5);
    }
    deleted += Array.isArray(data) ? data.length : batch.length;
    console.log(`[DELETE] ${Math.min(i + batch.length, files.length)}/${files.length}`);
  }

  console.log("");
  console.log(`[PASS] 已刪除 ${deleted} 個 ${BUCKET}/${PREFIX}/ 舊檔案。`);
  console.log("請回 Supabase SQL Editor 再查 images/ 子資料夾剩餘數量與 Storage Usage。");
}

main().catch((e) => {
  console.error("[FAIL]", e?.stack || e?.message || e);
  process.exit(99);
});
