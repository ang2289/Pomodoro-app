import fs from 'fs';
import path from 'path';

const target = path.resolve('src/pages/payment/bank-transfer.tsx');
if (!fs.existsSync(target)) throw new Error(`找不到檔案：${target}`);

const original = fs.readFileSync(target, 'utf8');
const backupDir = path.resolve('backup/payment-contact-gmail-line-v1');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `bank-transfer.tsx.${stamp}.bak`);
fs.writeFileSync(backup, original, 'utf8');

let next = original;
let changed = 0;

if (!next.includes("contactLineId: 'ang22899'")) {
  const from = "  contactEmail: 'rxv0227@gmail.com',\n} as const";
  const to = "  contactEmail: 'rxv0227@gmail.com',\n  contactLineId: 'ang22899',\n} as const";
  if (!next.includes(from)) throw new Error('找不到 IMAGE_BUNDLE_PAYMENT contactEmail 區塊，未修改。');
  next = next.replace(from, to);
  changed += 1;
}

const oldMailBlock = /  const bundleMailtoHref = useMemo\(\(\) => \{[\s\S]*?\n  \}, \[bundleData\.contactEmail, bundleData\.product\.amountNtd, bundleData\.product\.displayName\]\)\n/;
if (!next.includes('const bundleGmailHref = useMemo')) {
  if (!oldMailBlock.test(next)) throw new Error('找不到原本 Email 回報連結區塊，未修改。');
  const newMailBlock = `  const bundleReportSubject = \`RXV 圖片素材包 NT$\${bundleData.product.amountNtd} 匯款回報\`\n\n  const bundleReportBody = useMemo(() => [\n    \`商品：\${bundleData.product.displayName}\`,\n    \`金額：NT$\${bundleData.product.amountNtd}\`,\n    '',\n    '匯款日期：',\n    '匯款帳號末 5 碼：',\n    '姓名：',\n    '收件 Email：',\n  ].join('\\n'), [bundleData.product.amountNtd, bundleData.product.displayName])\n\n  const bundleGmailHref = useMemo(() => {\n    const params = new URLSearchParams({\n      view: 'cm',\n      fs: '1',\n      to: bundleData.contactEmail,\n      su: bundleReportSubject,\n      body: bundleReportBody,\n    })\n    return \`https://mail.google.com/mail/?\${params.toString()}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleMailtoHref = useMemo(() => {\n    return \`mailto:\${bundleData.contactEmail}?subject=\${encodeURIComponent(bundleReportSubject)}&body=\${encodeURIComponent(bundleReportBody)}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleLineHref = useMemo(() => {\n    return \`https://line.me/ti/p/~\${encodeURIComponent(bundleData.contactLineId)}\`\n  }, [bundleData.contactLineId])\n\n  const handleLineReport = () => {\n    try {\n      void navigator.clipboard.writeText(bundleReportBody)\n    } catch {\n      // 剪貼簿不可用時仍可繼續開啟 LINE。\n    }\n    window.open(bundleLineHref, '_blank', 'noopener,noreferrer')\n  }\n`;
  next = next.replace(oldMailBlock, newMailBlock);
  changed += 1;
}

const oldHeader = "? '匯款完成後請寄 Email 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'";
const newHeader = "? '匯款完成後可用 Gmail 或 LINE 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'";
if (next.includes(oldHeader)) {
  next = next.replace(oldHeader, newHeader);
  changed += 1;
}

const oldButton = `                  <a\n                    href={bundleMailtoHref}\n                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"\n                    style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                  >\n                    匯款完成，寄 Email 回報\n                  </a>`;

const newButton = `                  <>\n                    <a\n                      href={bundleGmailHref}\n                      target="_blank"\n                      rel="noopener noreferrer"\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 Gmail 回報\n                    </a>\n                    <button\n                      type="button"\n                      onClick={handleLineReport}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#06C755] px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 LINE 回報\n                    </button>\n                    <a\n                      href={bundleMailtoHref}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"\n                    >\n                      其他 Email 軟體\n                    </a>\n                    <p className="basis-full text-sm font-bold text-slate-600">\n                      LINE ID：{bundleData.contactLineId}。點 LINE 回報時會先複製匯款回報格式，開啟 LINE 後貼上並補齊資料即可。\n                    </p>\n                  </>`;

if (!next.includes('匯款完成，用 Gmail 回報')) {
  if (!next.includes(oldButton)) throw new Error('找不到原本「寄 Email 回報」按鈕，未修改。');
  next = next.replace(oldButton, newButton);
  changed += 1;
}

if (changed === 0) {
  console.log('此版本已套用，未重複修改。');
  console.log(`備份：${backup}`);
  process.exit(0);
}

fs.writeFileSync(target, next, 'utf8');

console.log('RXV 匯款回報聯絡方式 v1 已套用。');
console.log('已修改：');
console.log('1. Gmail 按鈕直接開啟 Gmail 撰寫頁，預帶收件人、主旨與匯款回報格式。');
console.log('2. 新增 LINE 回報按鈕，LINE ID：ang22899。');
console.log('3. 點 LINE 回報時先複製匯款回報格式，再開啟 LINE 好友頁。');
console.log('4. 保留「其他 Email 軟體」mailto 備用。');
console.log(`備份：${backup}`);
console.log('未修改 R2、catalog、付款金額、銀行資料或手機 APP。');
console.log('下一步：npm run dev，開啟付款頁測試 Gmail / LINE。');
