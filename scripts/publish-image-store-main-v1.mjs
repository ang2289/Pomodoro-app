import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const repoRoot = process.cwd();
const repoName = 'D:/Pomodoro-app';

function run(command, args, cwd = repoRoot, options = {}) {
  return execFileSync(command, args, {
    cwd,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
    env: process.env,
  });
}

function capture(command, args, cwd = repoRoot) {
  return String(run(command, args, cwd, { capture: true }) || '').trim();
}

function normalize(raw) {
  return { text: raw.replace(/\r\n/g, '\n'), hadCRLF: raw.includes('\r\n') };
}

function restoreEol(text, hadCRLF) {
  return hadCRLF ? text.replace(/\n/g, '\r\n') : text;
}

function patchImages(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { text: original, hadCRLF } = normalize(raw);
  let next = original;

  // Only change the bundle phrase. Keep "原價 NT$399" intact.
  next = next.replaceAll('NT$399 完整素材庫', 'NT$199 完整素材庫');

  if (!next.includes('RXV_HIDE_PUBLIC_TEST_CATEGORY')) {
    const from = `        const categoryMap = new Map<string, ImageCategory>();\n\n        (manifest.categories || []).forEach((category) => {\n          if (category?.id) categoryMap.set(category.id, category);\n        });\n\n        const formatted: ImageAsset[] = sourceImages\n          .filter((img) => img?.id)`;

    const to = `        // RXV_HIDE_PUBLIC_TEST_CATEGORY\n        // Keep R2/catalog data untouched; hide internal test categories only on the public website.\n        const hiddenPublicCategoryNames = new Set(["\\u672c\\u6a5f WebP \\u6e2c\\u8a66"]);\n        const hiddenPublicCategoryIds = new Set(\n          (manifest.categories || [])\n            .filter((category) =>\n              hiddenPublicCategoryNames.has(String(category?.name || "").trim()),\n            )\n            .map((category) => String(category?.id || "").trim())\n            .filter(Boolean),\n        );\n\n        const categoryMap = new Map<string, ImageCategory>();\n\n        (manifest.categories || []).forEach((category) => {\n          const categoryId = String(category?.id || "").trim();\n          const categoryName = String(category?.name || "").trim();\n          if (\n            categoryId &&\n            !hiddenPublicCategoryIds.has(categoryId) &&\n            !hiddenPublicCategoryNames.has(categoryName)\n          ) {\n            categoryMap.set(categoryId, category);\n          }\n        });\n\n        const formatted: ImageAsset[] = sourceImages\n          .filter((img) => {\n            if (!img?.id) return false;\n            const categoryId = String(\n              img.category_id ||\n                img.category_slug ||\n                img.category_name ||\n                img.category ||\n                "",\n            ).trim();\n            const categoryName = String(img.category_name || img.category || "").trim();\n            return (\n              !hiddenPublicCategoryIds.has(categoryId) &&\n              !hiddenPublicCategoryNames.has(categoryId) &&\n              !hiddenPublicCategoryNames.has(categoryName)\n            );\n          })`;

    if (!next.includes(from)) {
      throw new Error('images/index.tsx: 找不到 manifest 分類區塊，已停止。');
    }
    next = next.replace(from, to);
  }

  // Explicit safety checks for customer-facing price strings.
  if (next.includes('完整版素材，可預覽；高畫質原圖包含於 NT$399 完整素材庫')) {
    throw new Error('images/index.tsx: 預覽價格仍為 NT$399，已停止。');
  }
  if (next.includes('取得 NT$399 完整素材庫')) {
    throw new Error('images/index.tsx: 按鈕價格仍為 NT$399，已停止。');
  }

  fs.writeFileSync(file, restoreEol(next, hadCRLF), 'utf8');
}

function patchPayment(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { text: original, hadCRLF } = normalize(raw);
  let next = original;

  if (!/contactLineId\s*:\s*['"]ang22899['"]/.test(next)) {
    const re = /(\s+contactEmail\s*:\s*['"]rxv0227@gmail\.com['"]\s*,)/;
    if (!re.test(next)) throw new Error('bank-transfer.tsx: 找不到 contactEmail。');
    next = next.replace(re, `$1\n  contactLineId: 'ang22899',`);
  }

  if (!next.includes('const bundleGmailHref = useMemo')) {
    const oldMail = /\n\s*const bundleMailtoHref = useMemo\(\(\) => \{[\s\S]*?\n\s*\}, \[bundleData\.contactEmail, bundleData\.product\.amountNtd, bundleData\.product\.displayName\]\)\n/;
    if (!oldMail.test(next)) throw new Error('bank-transfer.tsx: 找不到原本 Email 回報區塊。');

    const finalBlock = `\n  const bundleReportSubject = \`RXV 圖片素材包 NT$\${bundleData.product.amountNtd} 匯款回報\`\n\n  const bundleReportBody = useMemo(() => [\n    \`商品：\${bundleData.product.displayName}\`,\n    \`金額：NT$\${bundleData.product.amountNtd}\`,\n    '',\n    '匯款日期：',\n    '匯款帳號末 5 碼：',\n    '姓名：',\n    '收件 Email：',\n  ].join('\\n'), [bundleData.product.amountNtd, bundleData.product.displayName])\n\n  const bundleGmailHref = useMemo(() => {\n    const params = new URLSearchParams({\n      view: 'cm',\n      fs: '1',\n      to: bundleData.contactEmail,\n      su: bundleReportSubject,\n      body: bundleReportBody,\n    })\n    return \`https://mail.google.com/mail/?\${params.toString()}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleMailtoHref = useMemo(() => {\n    return \`mailto:\${bundleData.contactEmail}?subject=\${encodeURIComponent(bundleReportSubject)}&body=\${encodeURIComponent(bundleReportBody)}\`\n  }, [bundleData.contactEmail, bundleReportBody, bundleReportSubject])\n\n  const bundleLineShareHref = useMemo(() => {\n    return \`https://line.me/R/share?text=\${encodeURIComponent(bundleReportBody)}\`\n  }, [bundleReportBody])\n\n  const bundleLineAddFriendHref = useMemo(() => {\n    return \`https://line.me/ti/p/~\${encodeURIComponent(bundleData.contactLineId)}\`\n  }, [bundleData.contactLineId])\n\n  const handleLineReport = () => {\n    try {\n      void navigator.clipboard.writeText(bundleReportBody).catch(() => undefined)\n    } catch {\n      // Clipboard backup is optional.\n    }\n    window.open(bundleLineShareHref, '_blank', 'noopener,noreferrer')\n  }\n`;

    next = next.replace(oldMail, finalBlock);
  }

  next = next.replace(
    "? '匯款完成後請寄 Email 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'",
    "? '匯款完成後可用 Gmail 或 LINE 回覆付款資料；確認入帳後會回覆圖片素材包下載方式。'",
  );

  if (!next.includes('匯款完成，用 Gmail 回報')) {
    const oldButton = /<a\s+href=\{bundleMailtoHref\}[\s\S]*?>\s*匯款完成，寄 Email 回報\s*<\/a>/;
    if (!oldButton.test(next)) throw new Error('bank-transfer.tsx: 找不到原本 Email 回報按鈕。');

    const replacement = `<>\n                    <a\n                      href={bundleGmailHref}\n                      target="_blank"\n                      rel="noopener noreferrer"\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 Gmail 回報\n                    </a>\n                    <button\n                      type="button"\n                      onClick={handleLineReport}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#06C755] px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg"\n                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n                    >\n                      匯款完成，用 LINE 回報（預帶資料）\n                    </button>\n                    <a\n                      href={bundleMailtoHref}\n                      className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"\n                    >\n                      其他 Email 軟體\n                    </a>\n                    <p className="basis-full text-sm font-bold text-slate-600">\n                      LINE ID：{bundleData.contactLineId}。LINE 回報會預帶商品、金額與回報欄位；若尚未加好友，可先加入後再回來使用。\n                      <a\n                        href={bundleLineAddFriendHref}\n                        target="_blank"\n                        rel="noopener noreferrer"\n                        className="ml-2 font-black text-emerald-700 underline hover:text-emerald-800"\n                      >\n                        先加 LINE 好友\n                      </a>\n                    </p>\n                  </>`;

    next = next.replace(oldButton, replacement);
  }

  if (!next.includes('匯款完成，用 Gmail 回報') || !next.includes('匯款完成，用 LINE 回報（預帶資料）')) {
    throw new Error('bank-transfer.tsx: Gmail / LINE 最終按鈕檢查失敗。');
  }

  fs.writeFileSync(file, restoreEol(next, hadCRLF), 'utf8');
}

function safeRemoveWorktree(releaseDir, branchName) {
  try {
    const junction = path.join(releaseDir, 'node_modules');
    if (fs.existsSync(junction)) {
      try { execFileSync('cmd.exe', ['/c', 'rmdir', junction], { stdio: 'ignore' }); } catch {}
    }
    run('git', ['worktree', 'remove', '--force', releaseDir], repoRoot);
  } catch {}
  try { run('git', ['branch', '-D', branchName], repoRoot); } catch {}
}

let releaseDir = '';
let branchName = '';
let pushed = false;

try {
  if (!fs.existsSync(path.join(repoRoot, '.git')) && !fs.existsSync(path.join(repoRoot, 'package.json'))) {
    throw new Error('請在 D:\\Pomodoro-app 專案根目錄執行。');
  }

  console.log('1/8 取得最新正式 main...');
  run('git', ['fetch', 'origin', 'main'], repoRoot);
  const baseSha = capture('git', ['rev-parse', 'origin/main'], repoRoot);

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  branchName = `release/image-store-${stamp}`;
  releaseDir = path.join(path.dirname(repoRoot), `Pomodoro-release-image-store-${stamp}`);
  if (fs.existsSync(releaseDir)) throw new Error(`暫存資料夾已存在：${releaseDir}`);

  console.log('2/8 建立乾淨正式版暫存工作區...');
  run('git', ['worktree', 'add', '-b', branchName, releaseDir, 'origin/main'], repoRoot);

  const sourceNodeModules = path.join(repoRoot, 'node_modules');
  const releaseNodeModules = path.join(releaseDir, 'node_modules');
  if (!fs.existsSync(sourceNodeModules)) throw new Error('目前專案沒有 node_modules，無法共用本機套件做 Build。');
  fs.symlinkSync(sourceNodeModules, releaseNodeModules, 'junction');

  console.log('3/8 只套用圖片商店正式站修改...');
  patchImages(path.join(releaseDir, 'src/pages/images/index.tsx'));
  patchPayment(path.join(releaseDir, 'src/pages/payment/bank-transfer.tsx'));

  console.log('4/8 執行正式 Build...');
  run('npm.cmd', ['run', 'build'], releaseDir);

  console.log('5/8 只暫存兩個正式網站檔案...');
  run('git', ['add', 'src/pages/images/index.tsx', 'src/pages/payment/bank-transfer.tsx'], releaseDir);
  const staged = capture('git', ['diff', '--cached', '--name-only'], releaseDir)
    .split(/\r?\n/).filter(Boolean).sort();
  const expected = ['src/pages/images/index.tsx', 'src/pages/payment/bank-transfer.tsx'].sort();
  if (JSON.stringify(staged) !== JSON.stringify(expected)) {
    throw new Error(`安全檢查失敗：暫存檔案不是預期兩個檔案。\n${staged.join('\n')}`);
  }
  run('git', ['diff', '--cached', '--check'], releaseDir);

  console.log('6/8 建立正式版 commit...');
  run('git', ['commit', '-m', 'fix: publish image store price contact and hide test category'], releaseDir);
  const commitSha = capture('git', ['rev-parse', 'HEAD'], releaseDir);

  console.log('7/8 再確認 main 沒有被其他更新插隊...');
  run('git', ['fetch', 'origin', 'main'], releaseDir);
  const latestMain = capture('git', ['rev-parse', 'origin/main'], releaseDir);
  if (latestMain !== baseSha) {
    throw new Error('origin/main 在處理期間有新更新，為避免覆蓋已自動停止，尚未 push。');
  }

  console.log('8/8 推送到正式 main...');
  run('git', ['push', 'origin', 'HEAD:main'], releaseDir);
  pushed = true;

  console.log('');
  console.log('SUCCESS: 正式 main 已更新。');
  console.log(`Commit: ${commitSha}`);
  console.log('已包含：NT$199 顯示、隱藏本機 WebP 測試、Gmail 回報、LINE 預帶匯款資料。');
  console.log('未加入目前 sync/latest-20260912 的其他 untracked 檔案。');
} catch (error) {
  console.error('');
  console.error('STOPPED:', error?.message || error);
  if (releaseDir) console.error(`暫存工作區：${releaseDir}`);
  process.exitCode = 1;
} finally {
  if (pushed && releaseDir && branchName) safeRemoveWorktree(releaseDir, branchName);
}
