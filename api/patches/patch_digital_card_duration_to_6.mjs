import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.cwd(), "api", "main.ts");
if (!fs.existsSync(target)) {
  console.error(`找不到檔案：${target}`);
  process.exit(1);
}
let text = fs.readFileSync(target, "utf8");
const before = text;
text = text.replace("if (![3, 12].includes(durationMonths)) throw businessCardError('數位名片頁期限僅能選 3 或 12 個月。');", "if (![3, 6].includes(durationMonths)) throw businessCardError('數位名片頁期限僅能選 3 或 6 個月。');");
text = text.replace("if (![3, 12].includes(durationMonths)) throw businessCardError(\"數位名片頁期限僅能選 3 或 12 個月。\");", "if (![3, 6].includes(durationMonths)) throw businessCardError(\"數位名片頁期限僅能選 3 或 6 個月。\");");
if (text === before) {
  if (text.includes("[3, 6]")) {
    console.log("目前 api/main.ts 已是 3／6 個月，不需修改。");
    process.exit(0);
  }
  console.error("沒有找到預期的 3／12 個月設定，未修改任何檔案。");
  process.exit(1);
}
const backup = `${target}.before-digital-card-6-months.bak`;
fs.copyFileSync(target, backup);
fs.writeFileSync(target, text, "utf8");
console.log("已改為 3／6 個月，並建立備份：" + backup);
