import fs from 'fs';
import path from 'path';

const target = path.resolve('src/pages/payment/bank-transfer.tsx');
if (!fs.existsSync(target)) throw new Error(`找不到檔案：${target}`);

const original = fs.readFileSync(target, 'utf8');
const hadCrlf = original.includes('\r\n');
let next = original.replace(/\r\n/g, '\n');

const backupDir = path.resolve('backup/payment-contact-gmail-line-v2');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `bank-transfer.tsx.${stamp}.bak`);
fs.writeFileSync(backup, original, 'utf8');

let changed = 0;

// 1) 在 IMAGE_BUNDLE_PAYMENT 內加入 LINE ID。使用 regex，避免 CRLF / 空白差異造成找不到。
if (!/contactLineId\s*:\s*['"]ang22899['"]/.test(next)) {
  const contactEmailPattern = /(\s+contactEmail\s*:\s*['"]rxv0227@gmail\.com['"]\s*,)/;
  if (!contactEmailPattern.test(next)) {
    throw new Error('找不到 contactEmail: rxv0227@gmail.com，未修改。');
  }
  next = next.replace(contactEmailPattern, `$1\n  contactLineId: 'ang22899',`);
  changed += 1;
}

// 2) 將原本 mailto useMemo 區塊改成 Gmail + mailto + LINE。
if (!next.includes('const bundleGmailHref = useMemo')) {
  const oldMailBlock = /\n\s*const bundleMailtoHref = useMemo\(\(\) => \{[\s\S]*?\n\s*\}, \[bundleData\.contactEmail, bundleData\.product\.amountNtd, bundleData\.product\.displayName\]\)\n/;
  if (!oldMailBlock.test(next)) {
    throw new Error('找不到原本 bundleMailtoHref 區塊，未修改。');
  }

  const newMailBlock = `\n  const bundleReportSubject = \`RXV 圖片素材包 NT$\${bundleData.product.amountNtd} 匯款回報\`\n\n  const bundleReportBody = useMemo(() => [\n    \`商品：\${bundleData.product.displayName}\`,\n    \`金額：NT$\${bundleData.product.amountNtd}\`,\n    '',\n    '匯款日期：',\n    '匯款帳號末 5 碼：',\n    '姓名：',\n    '收件 Email：',\n  ].join('\\n'), [bundleData.product.amountNtd, bundleData.product.displayName])\n\n  const bundleGmailHref = useMemo(() => {\n    const params = new URLSearchParams({\n      view: 'cm',\n      fs: '1',\n      to: bundleData.contactEmail,\n      su: bundleReportSubject,\n      body: bundleReportBody,\n    })\n    return \`https://mail.google.com/mail/?\${params.toString()}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleMailtoHref = useMemo(() => {\n    return \`mailto:\${bundleData.contactEmail}?subject=\${encodeURIComponent(bundleReportSubject)}&body=\${encodeURIComponent(bundleReportBody)}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleLineHref = useMemo(() => {\n    return \`https://line.me/ti/p/~\${encodeURIComponent(bundleData.contactLineId)}\`\n  }, [bundleData.contactLineId])\n\n  const handleLineReport = async () => {\n    try {\n      await navigator.clipboard.writeText(bundleReportBody)\n    } catch {\n      // 若剪貼簿不可用，仍繼續開 LINE。\n    }\n    window.open(bundleLineHref, '_blank', 'noopener,noreferrer')\n  }\n`;

  next = next.replace(oldMailBlock, newMailBlock);
  changed += 1;
}

// 3) 修改頁面說明。
const oldHeader = "? '匯款完成後請寄 Email 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'";
const newHeader = "? '匯款完成後可用 Gmail 或 LINE 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'";
if (next.includes(oldHeader)) {
  next = next.replace(oldHeader, newHeader);
  changed += 1;
}

// 4) 將原本單一 Email 按鈕改成 Gmail / LINE / 其他 Email。
if (!next.includes('匯款完成，用 Gmail 回報')) {
  const oldButtonPattern = /<a\s+href=\{bundleMailtoHref\}[\s\S]*?>\s*匯款完成，寄 Email 回報\s*<\/a>/;
  const match = next.match(oldButtonPattern);
  if (!match) {
    throw new Error('找不到原本「匯款完成，寄 Email 回報」按鈕，未修改。');
  }

  const replacement = `<>\n                    <a\n                      href={bundleGmailHref}\n                      target="_blank"\n                      rel="noopener noreferrer"\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 Gmail 回報\n                    </a>\n                    <button\n                      type="button"\n                      onClick={handleLineReport}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#06C755] px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 LINE 回報\n                    </button>\n                    <a\n                      href={bundleMailtoHref}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"\n                    >\n                      其他 Email 軟體\n                    </a>\n                    <p className="basis-full text-sm font-bold text-slate-600">\n                      LINE ID：{bundleData.contactLineId}。點 LINE 回報時會先複製匯款回報格式，開啟 LINE 後貼上並補齊資料即可。\n                    </p>\n                  </>`;

  next = next.replace(oldButtonPattern, replacement);
  changed += 1;
}

if (changed === 0) {
  console.log('此版本已套用，未重複修改。');
  console.log(`備份：${backup}`);
  process.exit(0);
}

if (hadCrlf) next = next.replace(/\n/g, '\r\n');
fs.writeFileSync(target, next, 'utf8');

console.log('RXV 匯款回報聯絡方式 v2 已套用。');
console.log('1. Gmail 直接開啟撰寫頁並預帶收件人、主旨、商品、金額與回報欄位。');
console.log('2. 新增 LINE 回報：LINE ID ang22899。');
console.log('3. 點 LINE 回報會先複製回報格式，再開 LINE。');
console.log('4. 保留其他 Email 軟體作為備用。');
console.log(`備份：${backup}`);
console.log('未修改 R2、catalog、銀行帳號、付款金額或手機 APP。');
