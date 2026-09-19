import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import QRCode from 'qrcode';

const execFileAsync = promisify(execFile);
const HOST = '127.0.0.1';
const PORT = Number(process.env.RXV_PROMO_PORT || 3020);
const ROOT = process.cwd();
const TOOL_DIR = path.resolve(ROOT, 'tools', 'rxv-small-pack-video-promoter-v3-8');
const PROJECT_DRIVE_ROOT = path.parse(ROOT).root || ROOT;
const TEMP_ROOT = path.join(os.tmpdir(), 'rxv-small-pack-video-promoter-v3-8');
const UPLOAD_DIR = path.join(TEMP_ROOT, 'uploads');
const JOB_DIR = path.join(TEMP_ROOT, 'jobs');
const OUTPUT_DIR = process.env.RXV_PROMO_OUTPUT_DIR
  ? path.resolve(process.env.RXV_PROMO_OUTPUT_DIR)
  : path.join(PROJECT_DRIVE_ROOT, 'RXV-短影音輸出');

for (const dir of [TEMP_ROOT, UPLOAD_DIR, JOB_DIR, OUTPUT_DIR]) fs.mkdirSync(dir, { recursive: true });

const PRODUCTS = {
  realEstate: { short: '房仲', slug: 'real-estate', catalogKey: 'realEstate', name: 'RXV 房仲帶看宣傳圖片包', count: '83 張', price: 99, pain: '每天發房仲貼文，還在花時間找圖？', uses: ['帶看宣傳','賀成交','交屋紀錄','社區公設','生活機能','房仲社群貼文'], benefits: ['帶看宣傳更省時間','成交賀圖快速完成','交屋貼文直接套用','社區特色更好呈現','生活機能貼文不缺圖','社群經營每天都有素材'] },
  hair: { short: '美髮', slug: 'hair', catalogKey: 'hair', name: 'RXV 美髮沙龍職業圖片包', count: '133 張', price: 99, pain: '每天發美髮貼文，還在到處找圖片？', uses: ['剪髮','染燙','洗護','髮型諮詢','完成造型','預約宣傳','沙龍日常'], benefits: ['剪髮作品快速發文','染燙服務更有質感','洗護內容不用再找圖','諮詢情境直接套用','完成造型展示更方便','預約宣傳快速完成','沙龍日常持續有素材'] },
  manicure: { short: '美甲', slug: 'manicure', catalogKey: 'manicure', name: 'RXV 美甲職業圖片包', count: '133 張', price: 99, pain: '每天發美甲貼文，還在花時間找素材？', uses: ['凝膠美甲','手部保養','款式展示','色系提案','預約宣傳','美甲日常'], benefits: ['作品展示快速完成','手部保養內容更好發','款式靈感直接套用','色系提案不缺圖','預約宣傳更省時間','社群每天都有素材'] },
  spa: { short: '美容SPA', slug: 'beauty-spa', catalogKey: 'spa', name: 'RXV 美容SPA職業圖片包', count: '135 張', price: 99, pain: '美容 SPA 每天要發文，還在重新找圖？', uses: ['臉部保養','身體按摩','芳療','療程介紹','環境氛圍','預約宣傳'], benefits: ['保養服務更好呈現','按摩情境直接使用','芳療貼文快速完成','療程介紹不缺圖','質感環境更吸睛','預約宣傳更省時間'] },
  dental: { short: '牙醫', slug: 'dental', catalogKey: 'dental', name: 'RXV 牙醫職業圖片包', count: '104 張', price: 99, pain: '牙醫診所做衛教與宣傳，還在到處找圖片？', uses: ['看診情境','牙齒衛教','設備消毒','醫病溝通','診所環境','預約宣傳'], benefits: ['看診內容快速發文','衛教貼文更容易理解','專業設備情境可直接用','溝通情境更自然','診所形象更完整','預約宣傳更省時間'] },
};
const TEMPLATES = new Set(['pain', 'showcase', 'price']);
const DISPLAY_MODES = new Set(['auto', 'full', 'contain']);
const TARGET_RATIO = 1080 / 1920;
const AUTO_RATIO_TOLERANCE = 0.08;

const CATALOG_URL = process.env.RXV_PUBLIC_CATALOG_URL || 'https://pub-ebdb1fc3a20543dca4f4df036cedd868.r2.dev/catalog/images-public.json';
const CATALOG_CATEGORY_MAP = {
  realEstate: ['房仲／房地產','房仲/房地產'],
  hair: ['美髮／沙龍','美髮/沙龍'],
  manicure: ['美甲'],
  spa: ['美容SPA','美容 SPA','美容／SPA'],
  dental: ['牙醫'],
};
function rxvCatalogItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.images)) return payload.images;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}
async function getCatalogStats() {
  const joiner = CATALOG_URL.includes('?') ? '&' : '?';
  const response = await fetch(CATALOG_URL + joiner + 't=' + Date.now(), { cache: 'no-store' });
  if (!response.ok) throw new Error('CATALOG_HTTP_' + response.status);
  const items = rxvCatalogItems(await response.json());
  const counts = { realEstate:0, hair:0, manicure:0, spa:0, dental:0 };
  for (const item of items) {
    const category = String(item?.category_name || item?.category || '').trim();
    for (const [key, aliases] of Object.entries(CATALOG_CATEGORY_MAP)) {
      if (aliases.some((name) => name === category)) counts[key] += 1;
    }
  }
  return { ok:true, total:items.length, counts, checkedAt:new Date().toISOString() };
}


const upload = multer({
  dest: UPLOAD_DIR,
  limits: { files: 11, fileSize: 40 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.fieldname === 'images') {
      const ok = /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype || '');
      return cb(ok ? null : new Error('圖片只支援 JPG、PNG、WEBP'), ok);
    }
    if (file.fieldname === 'music') {
      const ok = /^(audio\/mpeg|audio\/mp3|audio\/x-mpeg|application\/octet-stream)$/i.test(file.mimetype || '') || /\.mp3$/i.test(file.originalname || '');
      return cb(ok ? null : new Error('背景音樂只支援 MP3'), ok);
    }
    cb(new Error('不支援的上傳欄位'), false);
  },
});

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
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
  const useIndex = Math.max(0, index - 1) % product.uses.length;
  const use = product.uses[useIndex];
  const benefit = product.benefits?.[useIndex % product.benefits.length] || '直接拿來做社群貼文與宣傳';
  if (index === 0) {
    if (template === 'price') return { top: `NT${product.price}`, bottom: `${product.name}｜一次整理好` };
    if (template === 'showcase') return { top: `${product.short}常用情境一次看`, bottom: `${product.count} 圖片包` };
    return { top: product.pain, bottom: '別再每天重新找素材' };
  }
  if (template === 'price') return { top: use, bottom: `${benefit}｜NT${product.price}` };
  if (template === 'showcase') return { top: use, bottom: benefit };
  return { top: use, bottom: benefit };
}

function orientedSize(meta) {
  let width = Number(meta.width || 0);
  let height = Number(meta.height || 0);
  if ([5, 6, 7, 8].includes(Number(meta.orientation || 0))) [width, height] = [height, width];
  return { width, height };
}

function chooseFrameMode(meta, requestedMode) {
  if (requestedMode === 'full' || requestedMode === 'contain') return requestedMode;
  const { width, height } = orientedSize(meta);
  if (!width || !height) return 'contain';
  const ratio = width / height;
  const relativeDiff = Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO;
  return relativeDiff <= AUTO_RATIO_TOLERANCE ? 'full' : 'contain';
}

function textOverlay(topText, bottomText) {
  const topLines = wrapText(topText, 13);
  const bottomLines = wrapText(bottomText, 16);
  return Buffer.from(`
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="55" width="990" height="245" rx="36" fill="#000000" fill-opacity="0.66"/>
      <rect x="45" y="1575" width="990" height="285" rx="36" fill="#000000" fill-opacity="0.70"/>
      ${renderTextLines(topLines, 145, 58, 70)}
      ${renderTextLines(bottomLines, 1680, 49, 62)}
      <text x="540" y="1825" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="34" font-weight="700" fill="#fef3c7">RXV 圖片包</text>
    </svg>
  `, 'utf8');
}

async function makeVerticalFrame(inputPath, outputPath, topText, bottomText, requestedMode) {
  const meta = await sharp(inputPath).metadata();
  const mode = chooseFrameMode(meta, requestedMode);
  const overlay = textOverlay(topText, bottomText);

  if (mode === 'full') {
    const full = await sharp(inputPath).rotate()
      .resize(1080, 1920, { fit: 'cover', position: 'centre' })
      .png().toBuffer();
    await sharp(full).composite([{ input: overlay, left: 0, top: 0 }]).png().toFile(outputPath);
  } else {
    const source = sharp(inputPath).rotate();
    const background = await source.clone()
      .resize(1080, 1920, { fit: 'cover' })
      .blur(28)
      .modulate({ brightness: 0.58, saturation: 0.9 })
      .png().toBuffer();
    const foregroundResult = await source.clone()
      .resize({ width: 980, height: 1500, fit: 'inside', withoutEnlargement: false })
      .png().toBuffer({ resolveWithObject: true });
    const fgW = foregroundResult.info.width || 980;
    const fgH = foregroundResult.info.height || 1500;
    const left = Math.round((1080 - fgW) / 2);
    const top = Math.round((1920 - fgH) / 2);
    await sharp(background).composite([
      { input: foregroundResult.data, left, top },
      { input: overlay, left: 0, top: 0 },
    ]).png().toFile(outputPath);
  }

  const { width, height } = orientedSize(meta);
  return { mode, width, height, ratio: width && height ? width / height : null };
}

function normalizeQrUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

async function makeCtaFrame(backgroundPath, outputPath, product, ctaUrl, lineId, qrOptions = {}) {
  const {
    enableQr = true,
    qrUrl = '',
    qrPosition = 'center',
    ctaText = '掃碼立即查看',
    qrSize = 340,
  } = qrOptions;

  const bg = await sharp(backgroundPath).rotate()
    .resize(1080, 1920, { fit: 'cover' })
    .blur(22)
    .modulate({ brightness: 0.38, saturation: 0.85 })
    .png().toBuffer();

  const finalQrUrl = normalizeQrUrl(qrUrl || ctaUrl || 'pomodoro-app-eight-rouge.vercel.app/images');
  const urlLines = wrapText(finalQrUrl.replace(/^https?:\/\//i, ''), 31);
  const lineLines = wrapText(`LINE：${lineId || 'ang22899'}`, 24);
  const qrPixelSize = Math.max(260, Math.min(420, Number(qrSize || 340)));
  const qrX = qrPosition === 'left'
    ? 120
    : qrPosition === 'right'
      ? 1080 - 120 - qrPixelSize
      : Math.round((1080 - qrPixelSize) / 2);
  const qrY = 1020;

  let qrBuffer = null;
  if (enableQr && finalQrUrl) {
    qrBuffer = await QRCode.toBuffer(finalQrUrl, {
      type: 'png',
      width: qrPixelSize,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    });
  }

  const qrPanel = qrBuffer
    ? `<rect x="${qrX - 18}" y="${qrY - 18}" width="${qrPixelSize + 36}" height="${qrPixelSize + 36}" rx="24" fill="#ffffff"/>`
    : '';

  const overlay = Buffer.from(`
  <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <rect x="70" y="190" width="940" height="1540" rx="64" fill="#000000" fill-opacity="0.74"/>
    <text x="540" y="430" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="68" font-weight="900" fill="#ffffff">${escapeXml(product.count)} ${escapeXml(product.short)}常用圖片</text>
    <text x="540" y="585" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="94" font-weight="900" fill="#fbbf24">NT$${product.price}</text>
    <text x="540" y="715" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="50" font-weight="800" fill="#ffffff">不用每天重新找圖</text>
    <rect x="205" y="790" width="670" height="135" rx="68" fill="#059669"/>
    <text x="540" y="877" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="48" font-weight="900" fill="#ffffff">${escapeXml(ctaText || '掃碼立即查看')}</text>
    ${qrPanel}
    ${enableQr ? renderTextLines(urlLines, 1415, 31, 44) : renderTextLines(urlLines, 1170, 36, 48)}
    ${renderTextLines(lineLines, 1560, 42, 56)}
    <text x="540" y="1660" text-anchor="middle" font-family="Microsoft JhengHei, Noto Sans TC, sans-serif" font-size="32" font-weight="700" fill="#fef3c7">RXV 圖片素材</text>
  </svg>`, 'utf8');

  const composites = [{ input: overlay, left: 0, top: 0 }];
  if (qrBuffer) composites.push({ input: qrBuffer, left: qrX, top: qrY });
  await sharp(bg).composite(composites).png().toFile(outputPath);

  return { finalQrUrl, qrPosition, hasQr: Boolean(qrBuffer) };
}

async function makeBlendFrame(firstPath, secondPath, outputPath, alpha) {
  const overlay = await sharp(secondPath)
    .removeAlpha()
    .ensureAlpha(Math.max(0, Math.min(1, alpha)))
    .png()
    .toBuffer();
  await sharp(firstPath)
    .composite([{ input: overlay, left: 0, top: 0, blend: 'over' }])
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
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`FFmpeg 失敗 (code ${code})\n${stderr.slice(-5000)}`)));
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
  res.json({ ok: true, ffmpeg: Boolean(ffmpegPath), outputDir: OUTPUT_DIR });
});

app.get('/api/catalog-stats', async (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await getCatalogStats());
  } catch (error) {
    res.status(502).json({ ok:false, error:error instanceof Error ? error.message : String(error) });
  }
});
app.post('/api/render', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'music', maxCount: 1 },
]), async (req, res) => {
  const imageFiles = Array.isArray(req.files?.images) ? req.files.images : [];
  const musicFile = Array.isArray(req.files?.music) ? req.files.music[0] : null;
  let jobPath = '';
  try {
    if (imageFiles.length < 3 || imageFiles.length > 10) throw new Error('請選 3～10 張圖片');
    const baseProduct = PRODUCTS[String(req.body.product || '')] || PRODUCTS.realEstate;
    let product = { ...baseProduct };
    try {
      const liveStats = await getCatalogStats();
      const liveCount = Number(liveStats.counts?.[baseProduct.catalogKey] || 0);
      if (liveCount > 0) product.count = String(liveCount) + ' 張';
    } catch (catalogError) {
      console.warn('[RXV v3.8 catalog stats]', catalogError?.message || catalogError);
    }
    const template = TEMPLATES.has(String(req.body.template || '')) ? String(req.body.template) : 'pain';
    const displayMode = DISPLAY_MODES.has(String(req.body.displayMode || '')) ? String(req.body.displayMode) : 'auto';
    const totalSeconds = Math.max(6, Math.min(15, Number(req.body.duration || 10)));
    const musicVolume = Math.max(0, Math.min(1, Number(req.body.musicVolume || 0.15)));
    const fadeMusic = String(req.body.fadeMusic || '1') !== '0';
    const enableCta = String(req.body.enableCta || '1') !== '0';
    const ctaUrl = String(req.body.ctaUrl || 'pomodoro-app-eight-rouge.vercel.app/images').trim();
    const lineId = String(req.body.lineId || 'ang22899').trim();
    const enableQr = String(req.body.enableQr || '1') !== '0';
    const qrUrl = String(req.body.qrUrl || ctaUrl || '').trim();
    const qrPosition = ['left', 'center', 'right'].includes(String(req.body.qrPosition || '')) ? String(req.body.qrPosition) : 'center';
    const ctaText = String(req.body.ctaText || '掃碼立即查看').trim().slice(0, 20);
    const qrSize = [300, 340, 380].includes(Number(req.body.qrSize)) ? Number(req.body.qrSize) : 340;
    const transition = String(req.body.transition || '1') !== '0';
    const requestedCtaSeconds = Math.max(2, Math.min(4, Number(req.body.ctaSeconds || 3)));
    const ctaSeconds = enableCta ? requestedCtaSeconds : 0;
    const ffmpegPath = await findFfmpeg();
    if (!ffmpegPath) throw new Error('找不到 FFmpeg。請確認 ffmpeg-static 或 Windows FFmpeg 可用。');

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    jobPath = path.join(JOB_DIR, jobId);
    await fsp.mkdir(jobPath, { recursive: true });

    const frameFiles = [];
    const frameInfo = [];
    for (let i = 0; i < imageFiles.length; i += 1) {
      const framePath = path.join(jobPath, `frame-${String(i + 1).padStart(2, '0')}.png`);
      const copy = getFrameCopy(product, template, i, imageFiles.length);
      const info = await makeVerticalFrame(imageFiles[i].path, framePath, copy.top, copy.bottom, displayMode);
      frameFiles.push(framePath);
      frameInfo.push(info);
    }

    let ctaFrame = '';
    if (enableCta) {
      ctaFrame = path.join(jobPath, 'frame-cta.png');
      const ctaResult = await makeCtaFrame(imageFiles[imageFiles.length - 1].path, ctaFrame, product, ctaUrl, lineId, { enableQr, qrUrl, qrPosition, ctaText, qrSize });
      req._rxvCtaResult = ctaResult;
    }

    const contentSeconds = Math.max(1, totalSeconds - ctaSeconds);
    const transitionSteps = transition ? 3 : 0;
    const transitionStepSeconds = transition ? 0.06 : 0;
    const transitionTotal = Math.max(0, frameFiles.length - 1) * transitionSteps * transitionStepSeconds;
    const frameDuration = Math.max(0.16, (contentSeconds - transitionTotal) / frameFiles.length);
    const concatLines = [];

    for (let i = 0; i < frameFiles.length; i += 1) {
      concatLines.push(`file '${ffmpegConcatPath(frameFiles[i])}'`);
      concatLines.push(`duration ${frameDuration.toFixed(3)}`);
      if (transition && i < frameFiles.length - 1) {
        for (let step = 1; step <= transitionSteps; step += 1) {
          const alpha = step / (transitionSteps + 1);
          const blendPath = path.join(jobPath, `blend-${String(i + 1).padStart(2, '0')}-${step}.png`);
          await makeBlendFrame(frameFiles[i], frameFiles[i + 1], blendPath, alpha);
          concatLines.push(`file '${ffmpegConcatPath(blendPath)}'`);
          concatLines.push(`duration ${transitionStepSeconds.toFixed(3)}`);
        }
      }
    }

    if (ctaFrame) {
      concatLines.push(`file '${ffmpegConcatPath(ctaFrame)}'`);
      concatLines.push(`duration ${ctaSeconds.toFixed(3)}`);
      concatLines.push(`file '${ffmpegConcatPath(ctaFrame)}'`);
    } else {
      concatLines.push(`file '${ffmpegConcatPath(frameFiles[frameFiles.length - 1])}'`);
    }
    const concatFile = path.join(jobPath, 'frames.txt');
    await fsp.writeFile(concatFile, concatLines.join('\n'), 'utf8');

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeProduct = product.slug || 'image-pack';
    const outputName = `RXV-${safeProduct}-${template}-${displayMode}-${stamp}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', concatFile];
    if (musicFile) {
      args.push('-stream_loop', '-1', '-i', musicFile.path);
      const fadeIn = 0.45;
      const fadeOut = 0.75;
      const fadeOutStart = Math.max(0, totalSeconds - fadeOut);
      const audioFilters = [`volume=${musicVolume.toFixed(3)}`];
      if (fadeMusic) {
        audioFilters.push(`afade=t=in:st=0:d=${fadeIn}`);
        audioFilters.push(`afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${fadeOut}`);
      }
      args.push(
        '-filter_complex', `[1:a]${audioFilters.join(',')}[a]`,
        '-map', '0:v:0', '-map', '[a]',
        '-vf', 'fps=30,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
        '-c:a', 'aac', '-b:a', '192k', '-t', String(totalSeconds), '-movflags', '+faststart', outputPath,
      );
    } else {
      args.push(
        '-vf', 'fps=30,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
        '-t', String(totalSeconds), '-movflags', '+faststart', outputPath,
      );
    }

    await runFfmpeg(ffmpegPath, args);
    const stat = await fsp.stat(outputPath);
    const fullCount = frameInfo.filter((x) => x.mode === 'full').length;
    const containCount = frameInfo.length - fullCount;
    res.json({
      ok: true, fileName: outputName, videoUrl: `/output/${encodeURIComponent(outputName)}`,
      outputDir: OUTPUT_DIR, bytes: stat.size, duration: totalSeconds, imageCount: imageFiles.length,
      displayMode, fullCount, containCount, enableCta, ctaUrl, lineId, ctaSeconds,
      enableQr, qrUrl: req._rxvCtaResult?.finalQrUrl || normalizeQrUrl(qrUrl), qrPosition, ctaText,
      qrSize, transition,
      music: Boolean(musicFile), musicName: musicFile?.originalname || '', musicVolume, fadeMusic,
      product: product.short, template,
    });
  } catch (error) {
    console.error('[RXV promo v3.8 render]', error);
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    await cleanupFiles(imageFiles.map((file) => file.path));
    if (musicFile?.path) await cleanupFiles([musicFile.path]);
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
  console.error('[RXV promo v3.8]', error);
  res.status(500).json({ ok: false, error: error?.message || 'SERVER_ERROR' });
});

app.listen(PORT, HOST, async () => {
  const ffmpegPath = await findFfmpeg();
  const url = `http://${HOST}:${PORT}`;
  console.log('');
  console.log('RXV 小包短影音推廣器 v3.8');
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
