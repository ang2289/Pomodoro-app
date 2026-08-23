import fs from "fs";
import path from "path";
import Papa from "papaparse";

function normalizeNumber(val) {
  if (val == null) return "";
  const s = String(val).replace(/[,$]/g, "").trim();
  return s;
}

function pickRowValue(row, keys) {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  return "";
}

const input = process.argv[2];
if (!input) {
  console.error("用法：node convert-shopee-csv-to-scripts.mjs <你的csv檔路徑>");
  process.exit(1);
}

const csvPath = path.resolve(process.cwd(), input);
if (!fs.existsSync(csvPath)) {
  console.error("找不到檔案：", csvPath);
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, "utf8");

// papaparse 支援含逗號/引號的 CSV（商品名常含逗號，不能用 split）
const parsed = Papa.parse(csvText, {
  header: true,
  skipEmptyLines: true,
});

if (parsed.errors?.length) {
  console.warn("CSV 解析警告：", parsed.errors.slice(0, 3));
}

const rows = parsed.data || [];

const scripts = rows
  .map((row) => {
    const productId = pickRowValue(row, ["商品編號", "商品ID", "itemid", "item_id"]);
    const title = pickRowValue(row, ["商品名稱", "商品标题", "title", "name"]);
    const price = normalizeNumber(pickRowValue(row, ["商品價格", "價格", "price"]));
    const sold = pickRowValue(row, ["銷售量", "销量", "sold"]);

    // 你已確認：分潤只能用推廣連結（最重要）
    const promoUrl = pickRowValue(row, ["推廣連結", "推广链接", "promo_url", "promotion_url"]);

    // 一般商品連結可留作備用（但不當作分潤）
    const productUrl = pickRowValue(row, ["商品連結", "商品链接", "product_url", "url"]);

    return {
      productId,
      title,
      price,
      sold,
      promoUrl,     // ✅ 分潤唯一來源
      productUrl,   // △ 備用
      // 影片產生器目前吃 image；蝦皮CSV通常沒有圖，先留空
      image: "",
      images: [],
      highlights: [],
      script: "",
    };
  })
  // 過濾掉沒有推廣連結或沒有名稱的列（避免垃圾資料）
  .filter((x) => x.title && x.promoUrl);

const outPath = path.resolve(process.cwd(), "scripts.json");
fs.writeFileSync(outPath, JSON.stringify(scripts, null, 2), "utf8");

console.log("✅ 已產生 scripts.json");
console.log("筆數：", scripts.length);
console.log("輸出位置：", outPath);
console.log("提醒：image/images 目前為空，需補上圖片後才能產片。");

