import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const repoRoot = process.cwd();
const featureRef = 'origin/feat/small-image-pack-storefront';

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

function patchApp(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { text: original, hadCRLF } = normalize(raw);
  let next = original;

  if (!next.includes("import ImagePacksPage from './pages/ImagePacksPage'")) {
    const anchor = "import ImagesPage from './pages/images'";
    if (!next.includes(anchor)) throw new Error('App.tsx: 找不到 ImagesPage import。');
    next = next.replace(anchor, `${anchor}\nimport ImagePacksPage from './pages/ImagePacksPage'`);
  }

  if (!next.includes('path="image-packs"')) {
    const route = '            <Route path="images" element={<ImagesPage />} />';
    if (!next.includes(route)) throw new Error('App.tsx: 找不到 /images 路由。');
    next = next.replace(route, `${route}\n            <Route path="image-packs" element={<ImagePacksPage />} />`);
  }

  fs.writeFileSync(file, restoreEol(next, hadCRLF), 'utf8');
}

function patchImages(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { text: original, hadCRLF } = normalize(raw);
  let next = original;

  if (!next.includes('RXV_PRO_PACK_ENTRY')) {
    const anchor = '        {/* 分類篩選：手機版改成橫向滑動，避免按鈕全部擠在一起。 */}';
    if (!next.includes(anchor)) throw new Error('images/index.tsx: 找不到快速分類插入位置。');

    const block = `        {/* RXV_PRO_PACK_ENTRY */}\n        <section className="mb-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">\n          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">\n            <div>\n              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-800">專業職業主題包｜NT$99／包</span>\n              <h2 className="mt-3 text-2xl font-black text-slate-950">只買自己行業真正會用到的圖</h2>\n              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">房仲、美髮等職業情境另外整理成專業小包，檔名直接標示用途。專業小包為獨立商品，不包含在 NT$199 綜合素材庫方案內。</p>\n              <div className="mt-4 flex flex-wrap gap-2">\n                <span className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-800">房仲帶看宣傳圖片包｜83 張｜NT$99</span>\n                <span className="rounded-full border border-fuchsia-200 bg-white px-3 py-2 text-sm font-black text-fuchsia-800">美髮沙龍職業圖片包｜NT$99</span>\n              </div>\n            </div>\n            <Link\n              to="/image-packs"\n              className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700"\n              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}\n            >\n              查看 NT$99 專業圖片包\n            </Link>\n          </div>\n        </section>\n\n`;

    next = next.replace(anchor, `${block}${anchor}`);
  }

  fs.writeFileSync(file, restoreEol(next, hadCRLF), 'utf8');
}

function preparePackPage(source) {
  let next = source.replace(/\r\n/g, '\n');

  next = next.replace("category: '美容／時尚'", "category: '美髮／沙龍'");
  next = next.replace('網站另有 1,591 張綜合圖片素材庫完整版，限時 NT$199。', '網站另有綜合圖片素材庫完整版，限時 NT$199。');
  next = next.replace('查看 1,591 張綜合素材庫', '查看綜合素材庫');
  next = next.replace('目前採銀行匯款＋Email 人工確認。確認入帳後，以 Email 回覆私人 ZIP 下載連結。', '目前採銀行匯款＋Gmail／LINE 人工回報。確認入帳後，以 Email 回覆私人 ZIP 下載連結。');
  next = next.replace('按「匯款完成，寄 Email 回報」，填入匯款日期、帳號末 5 碼、姓名與收件 Email。', '按 Gmail 或 LINE 回報，填入匯款日期、帳號末 5 碼、姓名與收件 Email。');

  if (!next.includes("const LINE_ID = 'ang22899'")) {
    next = next.replace("const CONTACT_EMAIL = 'rxv0227@gmail.com'", "const CONTACT_EMAIL = 'rxv0227@gmail.com'\nconst LINE_ID = 'ang22899'");
  }

  const oldReportBlock = /  const reportByEmail = \(\) => \{[\s\S]*?\n  \}\n\n  return \(/;
  if (!next.includes('const reportByGmail = () =>')) {
    if (!oldReportBlock.test(next)) throw new Error('ImagePacksPage.tsx: 找不到原本 Email 回報函式。');
    const newReportBlock = `  const getReportData = () => {\n    if (!selectedPack) {\n      window.alert('請先選擇要購買的專業圖片小包。')\n      document.getElementById('pack-products')?.scrollIntoView({ behavior: 'smooth' })\n      return null\n    }\n\n    const subject = \`RXV 圖片小包匯款回報｜\${selectedPack.name}\`\n    const body = [\n      \`商品：\${selectedPack.name}\`,\n      \`金額：NT$\${selectedPack.amount}\`,\n      '',\n      '匯款日期：',\n      '匯款帳號末 5 碼：',\n      '姓名：',\n      '收件 Email：',\n      '',\n      '備註：',\n    ].join('\\n')\n\n    return { subject, body }\n  }\n\n  const reportByGmail = () => {\n    const report = getReportData()\n    if (!report) return\n    const params = new URLSearchParams({\n      view: 'cm',\n      fs: '1',\n      to: CONTACT_EMAIL,\n      su: report.subject,\n      body: report.body,\n    })\n    window.open(\`https://mail.google.com/mail/?\${params.toString()}\`, '_blank', 'noopener,noreferrer')\n  }\n\n  const reportByLine = async () => {\n    const report = getReportData()\n    if (!report) return\n    try {\n      await navigator.clipboard.writeText(report.body)\n    } catch {\n      // 剪貼簿不可用時仍可繼續開 LINE。\n    }\n    window.open(\`https://line.me/R/share?text=\${encodeURIComponent(report.body)}\`, '_blank', 'noopener,noreferrer')\n  }\n\n  const reportByEmail = () => {\n    const report = getReportData()\n    if (!report) return\n    window.location.href = \`mailto:\${CONTACT_EMAIL}?subject=\${encodeURIComponent(report.subject)}&body=\${encodeURIComponent(report.body)}\`\n  }\n\n  return (`;
    next = next.replace(oldReportBlock, newReportBlock);
  }

  const oldButtons = /            <div className="mt-6 flex flex-col gap-3 sm:flex-row">[\s\S]*?            <\/div>\n\n            <div className="mt-5 rounded-2xl border border-amber-200/;
  if (!next.includes('用 Gmail 回報')) {
    if (!oldButtons.test(next)) throw new Error('ImagePacksPage.tsx: 找不到付款按鈕區塊。');
    const buttons = `            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">\n              <button type="button" onClick={copyBankInfo} className="min-h-[46px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:bg-slate-50">\n                {copied ? '已複製匯款資料' : '複製匯款資料'}\n              </button>\n              <button type="button" onClick={reportByGmail} className="min-h-[46px] rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white hover:bg-emerald-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>\n                用 Gmail 回報\n              </button>\n              <button type="button" onClick={reportByLine} className="min-h-[46px] rounded-xl bg-[#06C755] px-5 py-3 font-black !text-white hover:brightness-95" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>\n                用 LINE 回報\n              </button>\n              <button type="button" onClick={reportByEmail} className="min-h-[46px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:bg-slate-50">\n                其他 Email 軟體\n              </button>\n            </div>\n            <p className="mt-3 text-sm font-bold text-slate-600">\n              LINE ID：{LINE_ID}。LINE 回報會預帶商品、金額與回報欄位；若尚未加好友，可先加入。\n              <a href={\`https://line.me/ti/p/~\${LINE_ID}\`} target="_blank" rel="noopener noreferrer" className="ml-2 font-black text-emerald-700 underline">先加 LINE 好友</a>\n            </p>\n\n            <div className="mt-5 rounded-2xl border border-amber-200`;
    next = next.replace(oldButtons, buttons);
  }

  return next.endsWith('\n') ? next : `${next}\n`;
}

function cleanup(releaseDir, branchName) {
  try {
    const junction = path.join(releaseDir, 'node_modules');
    if (fs.existsSync(junction)) {
      try { execFileSync('cmd.exe', ['/d', '/s', '/c', `rmdir "${junction}"`], { stdio: 'ignore' }); } catch {}
    }
    run('git', ['worktree', 'remove', '--force', releaseDir], repoRoot);
  } catch {}
  try { run('git', ['branch', '-D', branchName], repoRoot); } catch {}
}

let releaseDir = '';
let branchName = '';
let pushed = false;

try {
  console.log('1/9 取得最新正式 main 與專業小包來源...');
  run('git', ['fetch', 'origin', 'main'], repoRoot);
  run('git', ['fetch', 'origin', 'feat/small-image-pack-storefront'], repoRoot);
  const baseSha = capture('git', ['rev-parse', 'origin/main'], repoRoot);

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  branchName = `release/small-packs-${stamp}`;
  releaseDir = path.join(path.dirname(repoRoot), `Pomodoro-release-small-packs-${stamp}`);

  console.log('2/9 建立乾淨正式版暫存工作區...');
  run('git', ['worktree', 'add', '-b', branchName, releaseDir, 'origin/main'], repoRoot);

  const sourceNodeModules = path.join(repoRoot, 'node_modules');
  const releaseNodeModules = path.join(releaseDir, 'node_modules');
  if (!fs.existsSync(sourceNodeModules)) throw new Error('目前專案沒有 node_modules。');
  fs.symlinkSync(sourceNodeModules, releaseNodeModules, 'junction');

  console.log('3/9 加入 NT$99 專業圖片包頁面...');
  const packSource = capture('git', ['show', `${featureRef}:src/pages/ImagePacksPage.tsx`], repoRoot);
  fs.writeFileSync(path.join(releaseDir, 'src/pages/ImagePacksPage.tsx'), preparePackPage(packSource), 'utf8');

  console.log('4/9 加入 /image-packs 路由與 /images 入口...');
  patchApp(path.join(releaseDir, 'src/App.tsx'));
  patchImages(path.join(releaseDir, 'src/pages/images/index.tsx'));

  console.log('5/9 執行正式 Build...');
  run('cmd.exe', ['/d', '/s', '/c', 'npm run build'], releaseDir);

  console.log('6/9 只暫存 3 個正式網站檔案...');
  run('git', ['add', 'src/App.tsx', 'src/pages/images/index.tsx', 'src/pages/ImagePacksPage.tsx'], releaseDir);
  const staged = capture('git', ['diff', '--cached', '--name-only'], releaseDir).split(/\r?\n/).filter(Boolean).sort();
  const expected = ['src/App.tsx', 'src/pages/ImagePacksPage.tsx', 'src/pages/images/index.tsx'].sort();
  if (JSON.stringify(staged) !== JSON.stringify(expected)) {
    throw new Error(`安全檢查失敗：暫存檔案不是預期 3 個檔案。\n${staged.join('\n')}`);
  }
  run('git', ['diff', '--cached', '--check'], releaseDir);

  console.log('7/9 建立正式版 commit...');
  run('git', ['commit', '-m', 'feat: publish NT$99 professional image packs'], releaseDir);
  const commitSha = capture('git', ['rev-parse', 'HEAD'], releaseDir);

  console.log('8/9 再確認 main 沒有新更新插隊...');
  run('git', ['fetch', 'origin', 'main'], releaseDir);
  const latestMain = capture('git', ['rev-parse', 'origin/main'], releaseDir);
  if (latestMain !== baseSha) throw new Error('origin/main 處理期間有新更新，已停止，尚未 push。');

  console.log('9/9 推送到正式 main...');
  run('git', ['push', 'origin', 'HEAD:main'], releaseDir);
  pushed = true;

  console.log('');
  console.log('SUCCESS: NT$99 專業圖片包已推送正式 main。');
  console.log(`Commit: ${commitSha}`);
  console.log('包含：房仲 NT$99、美髮 NT$99、/image-packs、Gmail/LINE 匯款回報。');
  console.log('未修改 R2、catalog、圖片後台或手機 APP。');
} catch (error) {
  console.error('');
  console.error(`STOPPED: ${error instanceof Error ? error.message : String(error)}`);
  if (releaseDir) console.error(`暫存工作區：${releaseDir}`);
  process.exitCode = 1;
} finally {
  if (pushed && releaseDir && branchName) cleanup(releaseDir, branchName);
}
