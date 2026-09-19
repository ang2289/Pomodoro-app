import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const HOST = '127.0.0.1';
const PORT = Number(process.env.RXV_PROMO_PORT || 3020);
const ROOT = process.cwd();
const TOOL_DIR = path.resolve(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3');
const PROJECT_DRIVE_ROOT = path.parse(ROOT).root || ROOT;
const TEMP_ROOT = path.join(os.tmpdir(), 'rxv-small-pack-video-promoter-v3');
const UPLOAD_DIR = path.join(TEMP_ROOT, 'uploads');
const JOB_DIR = path.join(TEMP_ROOT, 'jobs');
const OUTPUT_DIR = process.env.RXV_PROMO_OUTPUT_DIR
  ? path.resolve(process.env.RXV_PROMO_OUTPUT_DIR)
  : path.join(PROJECT_DRIVE_ROOT, 'RXV-短影音輸出');

for (const dir of [TEMP_ROOT, UPLOAD_DIR, JOB_DIR, OUTPUT_DIR]) fs.mkdirSync(dir, { recursive: true });

const PRODUCTS = {
  realEstate: {
    short: '房仲',
    name: 'RXV 房仲帶看宣傳圖片包',
    count: '83 張',
    price: 99,
    pain: '每天發房仲貼文，還在花時間找圖？',
    uses: ['帶看宣傳', '賀成交', '交屋紀錄', '社區公設', '生活機能', '房仲社群貼文'],
  },
  hair: {
    short: '美髮',
    name: 'RXV 美髮沙龍職業圖片包',
    count: '多場景',
    price: 99,
    pain: '每天發美髮貼文，還在到處找圖片？',
    uses: ['剪髮', '染燙', '洗護', '髮型諮詢', '完成造型', '預約宣傳', '沙龍日常'],
  },
};

const TEMPLATES = new Set(['pain', 'showcase', 'price']);

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { files: 10, fileSize: 25 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ok = /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype || '');
    cb(ok ? null : new Error('只支援 JPG、PNG、WEBP'), ok);
  },
});

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 13) {
  const lines = [];
  for (const raw of String(text || '').split(/\r?\n/)) {
    const chars = Array.from(raw.trim());
    if (!chars.length) continue;
    for (let i = 0; i < chars.length; i += maxChars) lines.push(chars.slice(i, i + maxChars).join(''));
  }
  return lines.slice(0, 3);
}

function renderTextLines(lines, y, size, lineHeight) {
  return lines.map((line, index) =>
    `<text x="540" y="${y + index * lineHeight}" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="${size}" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`
  ).join('');
}

function getFrameCopy(product, template, index, total) {
  const last = index === total - 1;
  if (template === 'price') {
    if (index === 0) return { top: `NT$${product.price}`, bottom: `${product.name}｜一次整理好` };
    if (last) return { top: '不用每天重新找素材', bottom: `${product.count}｜NT$${product.price}｜RXV 圖片包` };
    return { top: product.uses[(index - 1) % product.uses.length], bottom: `${product.short}常用情境圖` };
  }
  if (template === 'showcase') {
    if (index === 0) return { top: `${product.short}常用情境一次看`, bottom: `${product.count} 圖片包` };
    if (last) return { top: `${product.name}`, bottom: `NT$${product.price}｜省下每天找圖時間` };
    return { top: product.uses[(index - 1) % product.uses.length], bottom: '直接拿來做社群貼文與宣傳' };
  }
  if (index === 0) return { top: product.pain, bottom: '別再每天重新找素材' };
  if (last) return { top: `${product.count} ${product.short}常用圖片`, bottom: `NT$${product.price}｜一次整理好` };
  return { top: product.uses[(index - 1) % product.uses.length], bottom: `${product.short}日常宣傳情境` };
}

async function makeVerticalFrame(inputPath, outputPath, topText, bottomText) {
  const source = sharp(inputPath).rotate();
  const background = await source.clone()
    .resize(1080, 1920, { fit: 'cover' })
    .blur(28)
    .modulate({ brightness: 0.58, saturation: 0.9 })
    .png()
    .toBuffer();

  const foregroundResult = await source.clone()
    .resize({ width: 980, height: 1160, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer({ resolveWithObject: true });

  const fgW = foregroundResult.info.width || 980;
  const fgH = foregroundResult.info.height || 1160;
  const left = Math.max(50, Math.round((1080 - fgW) / 2));
  const top = Math.round(350 + (1160 - fgH) / 2);
  const topLines = wrapText(topText, 13);
  const bottomLines = wrapText(bottomText, 16);
  const overlay = Buffer.from(`
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="55" width="990" height="245" rx="36" fill="#000000" fill-opacity="0.66"/>
      <rect x="45" y="1575" width="990" height="285" rx="36" fill="#000000" fill-opacity="0.70"/>
      ${renderTextLines(topLines, 145, 58, 70)}
      ${renderTextLines(bottomLines, 1680, 49, 62)}
      <text x="540" y="1825" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="34" font-weight="700" fill="#fef3c7">RXV 圖片包</text>
    </svg>
  `, 'utf8');

  await sharp(background)
    .composite([
      { input: foregroundResult.data, left, top },
      { input: overlay, left: 0, top: 0 },
    ])
    .png()
    .toFile(outputPath);
}

function ffmpegConcatPath(filePath) {
  return path.resolve(filePath).replace(/\\/g, '/').replace(/'/g, "'\\''");
}

async function findFfmpeg() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  try {
    const mod = await import('ffmpeg-static');
    if (mod?.default) candidates.push(mod.default);
  } catch {}
  candidates.push('ffmpeg');

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      await execFileAsync(candidate, ['-version'], { windowsHide: true, timeout: 8000 });
      return candidate;
    } catch {}
  }
  return '';
}

function runFfmpeg(ffmpegPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (buf) => {
      stderr += String(buf);
      if (stderr.length > 14000) stderr = stderr.slice(-14000);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg 失敗 (code ${code})\n${stderr.slice(-5000)}`));
    });
  });
}

async function cleanupFiles(files = []) {
  await Promise.allSettled(files.filter(Boolean).map((file) => fsp.rm(file, { force: true })));
}

const app = express();
app.use('/output', express.static(OUTPUT_DIR, { fallthrough: false }));
app.use(express.static(TOOL_DIR));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  const ffmpegPath = await findFfmpeg();
  res.json({ ok: true, ffmpeg: Boolean(ffmpegPath), ffmpegPath: ffmpegPath || null, outputDir: OUTPUT_DIR });
});

app.post('/api/render', upload.array('images', 10), async (req, res) => {
  const uploaded = Array.isArray(req.files) ? req.files : [];
  let jobPath = '';
  try {
    if (uploaded.length < 3 || uploaded.length > 10) throw new Error('請選 3～10 張圖片');
    const product = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;
    const template = TEMPLATES.has(String(req.body.template || '')) ? String(req.body.template) : 'pain';
    const totalSeconds = Math.max(6, Math.min(15, Number(req.body.duration || 10)));
    const ffmpegPath = await findFfmpeg();
    if (!ffmpegPath) throw new Error('找不到 FFmpeg。請確認 Windows 已安裝 ffmpeg，或專案 ffmpeg-static 可用。');

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    jobPath = path.join(JOB_DIR, jobId);
    await fsp.mkdir(jobPath, { recursive: true });

    const frameFiles = [];
    for (let i = 0; i < uploaded.length; i += 1) {
      const framePath = path.join(jobPath, `frame-${String(i + 1).padStart(2, '0')}.png`);
      const copy = getFrameCopy(product, template, i, uploaded.length);
      await makeVerticalFrame(uploaded[i].path, framePath, copy.top, copy.bottom);
      frameFiles.push(framePath);
    }

    const frameDuration = totalSeconds / frameFiles.length;
    const concatLines = [];
    for (const frame of frameFiles) {
      concatLines.push(`file '${ffmpegConcatPath(frame)}'`);
      concatLines.push(`duration ${frameDuration.toFixed(3)}`);
    }
    concatLines.push(`file '${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'`);
    const concatFile = path.join(jobPath, 'frames.txt');
    await fsp.writeFile(concatFile, concatLines.join('\n'), 'utf8');

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeProduct = product.short === '美髮' ? 'hair' : 'real-estate';
    const outputName = `RXV-${safeProduct}-${template}-${stamp}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await runFfmpeg(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'concat', '-safe', '0', '-i', concatFile,
      '-vf', 'fps=30,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
      '-movflags', '+faststart',
      outputPath,
    ]);

    const stat = await fsp.stat(outputPath);
    res.json({
      ok: true,
      fileName: outputName,
      videoUrl: `/output/${encodeURIComponent(outputName)}`,
      outputDir: OUTPUT_DIR,
      bytes: stat.size,
      duration: totalSeconds,
      imageCount: uploaded.length,
      product: product.short,
      template,
    });
  } catch (error) {
    console.error('[RXV promo v3 render]', error);
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    await cleanupFiles(uploaded.map((file) => file.path));
    if (jobPath) await fsp.rm(jobPath, { recursive: true, force: true }).catch(() => {});
  }
});

app.post('/api/open-output', (_req, res) => {
  try {
    if (process.platform === 'win32') {
      const child = spawn('explorer.exe', [OUTPUT_DIR], { detached: true, stdio: 'ignore', windowsHide: true });
      child.unref();
      return res.json({ ok: true });
    }
    res.status(400).json({ ok: false, error: '此按鈕目前只支援 Windows' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/', (_req, res) => res.sendFile(path.join(TOOL_DIR, 'index.html')));

app.use((error, _req, res, _next) => {
  console.error('[RXV promo v3]', error);
  res.status(500).json({ ok: false, error: error?.message || 'SERVER_ERROR' });
});

app.listen(PORT, HOST, async () => {
  const ffmpegPath = await findFfmpeg();
  const url = `http://${HOST}:${PORT}`;
  console.log('');
  console.log('RXV 小包短影音推廣器 v3');
  console.log(`網址：${url}`);
  console.log(`FFmpeg：${ffmpegPath || '找不到'}`);
  console.log(`輸出：${OUTPUT_DIR}`);
  console.log('');
  if (process.platform === 'win32' && process.env.RXV_PROMO_NO_BROWSER !== '1') {
    try {
      const child = spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true });
      child.unref();
    } catch {}
  }
});
