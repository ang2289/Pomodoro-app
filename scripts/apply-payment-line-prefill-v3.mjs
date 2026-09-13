import fs from 'fs';
import path from 'path';

const target = path.resolve('src/pages/payment/bank-transfer.tsx');
if (!fs.existsSync(target)) throw new Error(`找不到檔案：${target}`);

const originalRaw = fs.readFileSync(target, 'utf8');
const hadCRLF = originalRaw.includes('\r\n');
let original = originalRaw.replace(/\r\n/g, '\n');

const backupDir = path.resolve('backup/payment-line-prefill-v3');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `bank-transfer.tsx.${stamp}.bak`);
fs.writeFileSync(backup, originalRaw, 'utf8');

let next = original;
let changed = 0;

// v2 expected structure: replace add-friend LINE target with LINE share link that preloads the report text.
const oldLineHrefBlock = /  const bundleLineHref = useMemo\(\(\) => \{\n    return `https:\/\/line\.me\/ti\/p\/~\$\{encodeURIComponent\(bundleData\.contactLineId\)\}`\n  \}, \[bundleData\.contactLineId\]\)\n/;
const newLineHrefBlock = `  const bundleLineShareHref = useMemo(() => {\n    return \`https://line.me/R/share?text=\${encodeURIComponent(bundleReportBody)}\`\n  }, [bundleReportBody])\n\n  const bundleLineAddFriendHref = useMemo(() => {\n    return \`https://line.me/ti/p/~\${encodeURIComponent(bundleData.contactLineId)}\`\n  }, [bundleData.contactLineId])\n`;

if (next.includes('const bundleLineShareHref = useMemo')) {
  // already applied
} else if (oldLineHrefBlock.test(next)) {
  next = next.replace(oldLineHrefBlock, newLineHrefBlock);
  changed += 1;
} else {
  throw new Error('找不到 v2 的 LINE 連結區塊，未修改。請先確認 v2 已套用。');
}

const oldHandle = /  const handleLineReport = \(\) => \{\n    try \{\n      void navigator\.clipboard\.writeText\(bundleReportBody\)\n    \} catch \{\n      \/\/ 剪貼簿不可用時仍可繼續開啟 LINE。\n    \}\n    window\.open\(bundleLineHref, '_blank', 'noopener,noreferrer'\)\n  \}\n/;
const newHandle = `  const handleLineReport = () => {\n    try {\n      void navigator.clipboard.writeText(bundleReportBody)\n    } catch {\n      // 剪貼簿不可用時仍可繼續開啟 LINE。\n    }\n    window.open(bundleLineShareHref, '_blank', 'noopener,noreferrer')\n  }\n`;

if (next.includes("window.open(bundleLineShareHref, '_blank', 'noopener,noreferrer')")) {
  // already applied
} else if (oldHandle.test(next)) {
  next = next.replace(oldHandle, newHandle);
  changed += 1;
} else {
  throw new Error('找不到 v2 的 handleLineReport 區塊，未修改。');
}

const oldLabel = '匯款完成，用 LINE 回報';
const newLabel = '匯款完成，用 LINE 回報（預帶資料）';
if (next.includes(oldLabel) && !next.includes(newLabel)) {
  next = next.replace(oldLabel, newLabel);
  changed += 1;
}

const oldHelp = 'LINE ID：{bundleData.contactLineId}。點 LINE 回報時會先複製匯款回報格式，開啟 LINE 後貼上並補齊資料即可。';
const newHelp = `LINE ID：{bundleData.contactLineId}。LINE 回報會預帶商品、金額與回報欄位；若尚未加好友，可先加入後再回來使用。\n                      <a\n                        href={bundleLineAddFriendHref}\n                        target="_blank"\n                        rel="noopener noreferrer"\n                        className="ml-2 font-black text-emerald-700 underline hover:text-emerald-800"\n                      >\n                        先加 LINE 好友\n                      </a>`;
if (next.includes(oldHelp)) {
  next = next.replace(oldHelp, newHelp);
  changed += 1;
}

if (changed === 0) {
  console.log('LINE 預帶資料版已存在，未重複修改。');
  console.log(`備份：${backup}`);
  process.exit(0);
}

const output = hadCRLF ? next.replace(/\n/g, '\r\n') : next;
fs.writeFileSync(target, output, 'utf8');

console.log('RXV LINE 匯款回報預帶資料 v3 已套用。');
console.log('已修改：');
console.log('1. LINE 回報改用 LINE share 連結，預帶匯款回報文字。');
console.log('2. 仍先複製回報內容到剪貼簿，做為桌機/瀏覽器相容備援。');
console.log('3. 保留「先加 LINE 好友」連結，LINE ID：ang22899。');
console.log(`備份：${backup}`);
console.log('未修改付款金額、銀行資料、R2、catalog 或手機 APP。');
console.log('下一步：npm run dev，開啟付款頁測試 LINE。');
