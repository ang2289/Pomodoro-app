#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const BUILD = 'RXV_SHOPEE_V31_SUPABASE_COPY_LIBRARY';
console.log(`[BUILD] ${BUILD}`);

const cwd = process.cwd();
const inputCsv = process.argv[2] || '';
const limitArg = Number(process.argv[3] || 0) || 0;
const OUTPUT_DIR = process.env.RXV_OUTPUT_DIR || path.join(cwd, 'out_mp4');
const VIDEO_SERVER = process.env.RXV_VIDEO_SERVER || 'http://localhost:3006/render-from-images';
const FORCE_CSV_ONLY = process.env.RXV_FORCE_CSV_IMAGES_ONLY === '1';
const BGM_PATH = process.env.RXV_BGM_PATH || path.join(cwd, 'assets', 'bgm.mp3');

const VIDEO_SCRIPT_ENDPOINT =
  process.env.RXV_VIDEO_SCRIPT_ENDPOINT ||
  process.env.VIDEO_SCRIPT_ENDPOINT ||
  process.env.VIDEO_SCRIPT_URL ||
  '';

const VIDEO_SCRIPT_KEY =
  process.env.RXV_VIDEO_SCRIPT_KEY ||
  process.env.VIDEO_SCRIPT_AUTH ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const REQUIRE_AI = process.env.RXV_REQUIRE_AI === '1';

console.log(`[BGM] ${BGM_PATH}`);
console.log(`[MODE] RXV_FORCE_CSV_IMAGES_ONLY=${FORCE_CSV_ONLY ? '1' : '0'}`);
console.log(`[AI_ENDPOINT] ${VIDEO_SCRIPT_ENDPOINT ? 'OK' : 'MISSING'}`);

function sanitizeFileName(input) {
  return String(input || 'item')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'item';
}

function normalizeHeader(value) {
  return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (quoted && next === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (ch === ',' && !quoted) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((v) => v.trim());
}

function parseCsv(content) {
  const lines = String(content || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]);
  const normalized = headers.map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
      row[normalized[idx]] = cols[idx] || '';
    });
    return row;
  });
}

function splitPossibleUrls(value) {
  return String(value || '')
    .split(/\s*[\n,;|，；、]+\s*/)
    .map((v) => v.trim())
    .filter((v) => /^https?:\/\//i.test(v));
}

function pickRowValue(row, candidates) {
  for (const key of candidates) {
    if (row[key]) return String(row[key]).trim();
    const n = normalizeHeader(key);
    if (row[n]) return String(row[n]).trim();
  }
  return '';
}

function pickImagesFromRow(row) {
  const bucket = [];
  bucket.push(...splitPossibleUrls(pickRowValue(row, ['圖片網址', 'imageUrls', 'image_url', 'imageurl', 'images'])));
  bucket.push(...splitPossibleUrls(pickRowValue(row, ['圖片1', 'image1', '圖1'])));
  bucket.push(...splitPossibleUrls(pickRowValue(row, ['圖片2', 'image2', '圖2'])));
  bucket.push(...splitPossibleUrls(pickRowValue(row, ['圖片3', 'image3', '圖3'])));

  const dedup = [];
  const seen = new Set();
  for (const url of bucket) {
    if (seen.has(url)) continue;
    seen.add(url);
    dedup.push(url);
    if (dedup.length >= 3) break;
  }
  return dedup;
}

function pickTitle(row) {
  return pickRowValue(row, ['商品名稱', '商品標題', 'title', 'name', '標題']) || '未命名商品';
}

function pickProductUrl(row) {
  return pickRowValue(row, ['商品原網址', 'productUrl', 'product_url', '商品網址', '網址']);
}

function pickPromoUrl(row) {
  return pickRowValue(row, ['推廣連結', 'promoUrl', 'promo_url', '分潤連結', 'link']);
}

function pickAffiliateUrl(row) {
  return pickRowValue(row, ['affiliateUrl', 'affiliate_url', '推廣連結', 'promoUrl', 'promo_url', '分潤連結', 'link']);
}

function shortText(input, maxLen = 12) {
  const s = String(input || '').replace(/\s+/g, '').trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}


function buildFallbackScript(title) {
  const source = String(title || '');
  if (/耳機|藍牙|藍芽|降噪|無線|續航/i.test(source)) {
    return {
      source: 'fallback',
      pain: '耳機戴不住？',
      benefit: '降噪續航更穩',
      proof: '通勤追劇都更順',
      cta: '點連結看細節',
      sceneTitles: ['耳機戴不住？', '降噪續航更穩', '點連結看細節'],
      sceneSubtitles: ['一下就鬆真的很煩', '通勤追劇都更順', '先看評價細節'],
      voiceText: '如果你也受不了耳機一下就鬆、降噪又沒感，這款主打穩戴、清楚、續航更夠。通勤、追劇、講電話都比較順，想看細節直接點連結。',
      shortTitle: '耳機戴不住？這款差很多',
      keywords: '藍牙耳機,降噪耳機,無線耳機,運動藍牙耳機,通勤耳機,長續航耳機',
      titleWithKeywords: `耳機戴不住？這款差很多

藍牙耳機,降噪耳機,無線耳機,運動藍牙耳機,通勤耳機,長續航耳機`,
      shortDescription: '耳機戴不住又沒降噪嗎？這款主打穩戴、清楚、續航更夠，通勤追劇都更順。',
      fullPost: `耳機戴不住？這款差很多

耳機戴不住又沒降噪嗎？這款主打穩戴、清楚、續航更夠，通勤追劇都更順。

[affiliateUrl]`,
    };
  }
  if (/垃圾袋|廚餘|垃圾/i.test(source)) {
    return {
      source: 'fallback',
      pain: '垃圾袋一提就破？',
      benefit: '加厚防漏更安心',
      proof: '廚餘濕垃圾也能裝',
      cta: '點連結看細節',
      sceneTitles: ['垃圾袋一提就破？', '加厚防漏更安心', '點連結看細節'],
      sceneSubtitles: ['滴滿地真的很崩潰', '裝廚餘也更安心', '先看尺寸規格'],
      voiceText: '如果你也受夠垃圾袋一提就破、還整袋滴出來，這款主打加厚防漏，裝廚餘和濕垃圾都更安心。想看尺寸和細節，直接點連結。',
      shortTitle: '垃圾袋一提就破？這款加厚差很多',
      keywords: '垃圾袋,加厚垃圾袋,防漏垃圾袋,廚餘袋,不破垃圾袋,大容量垃圾袋',
      titleWithKeywords: `垃圾袋一提就破？這款加厚差很多

垃圾袋,加厚垃圾袋,防漏垃圾袋,廚餘袋,不破垃圾袋,大容量垃圾袋`,
      shortDescription: '垃圾袋總是破掉滴滿地嗎？這款加厚防漏設計，裝廚餘和濕垃圾更安心。',
      fullPost: `垃圾袋一提就破？這款加厚差很多

垃圾袋總是破掉滴滿地嗎？這款加厚防漏設計，裝廚餘和濕垃圾更安心。

[affiliateUrl]`,
    };
  }
  const base = shortText(title, 10) || '熱門好物';
  return {
    source: 'fallback',
    pain: '怕買到踩雷款？',
    benefit: '重點功能更到位',
    proof: '先看細節再決定',
    cta: '點連結看細節',
    sceneTitles: ['怕買到踩雷款？', '重點功能更到位', '點連結看細節'],
    sceneSubtitles: ['先看細節再決定', '日常使用更省心', '直接看規格評價'],
    voiceText: `${base} 最怕買回去一下就後悔，這款主打把重點功能做得更到位。想看規格和細節，直接點連結。`,
    shortTitle: '怕買到踩雷款？先看這款',
    keywords: `${base},商品評價,規格比較,日常用品,實拍開箱,現在看看`,
    titleWithKeywords: `怕買到踩雷款？先看這款

${base},商品評價,規格比較,日常用品,實拍開箱,現在看看`,
    shortDescription: `${base} 最怕買回去一下就後悔？這款把重點功能做得更到位，先看細節再決定。`,
    fullPost: `怕買到踩雷款？先看這款

${base} 最怕買回去一下就後悔？這款把重點功能做得更到位，先看細節再決定。

[affiliateUrl]`,
  };
}

function normalizeAiResponse(raw, title, affiliateUrl = '') {
  const obj = raw && typeof raw === 'object' ? raw : {};
  const fallback = buildFallbackScript(title);
  const badge0 = Array.isArray(obj.badges) && obj.badges[0] ? obj.badges[0] : '';
  const finalAffiliateUrl = affiliateUrl || obj.affiliateUrl || obj.promoUrl || '[affiliateUrl]';
  const shortTitle = String(obj.shortTitle || fallback.shortTitle || '').trim();
  const keywords = String(obj.keywords || fallback.keywords || '').trim();
  const shortDescription = String(obj.shortDescription || fallback.shortDescription || '').trim();
  const fullPost = String(obj.fullPost || fallback.fullPost || '').replace(/\[affiliateUrl\]/g, finalAffiliateUrl);

  return {
    source: obj.source || 'supabase',
    sceneTitles: [
      shortText(obj.pain || fallback.sceneTitles[0], 12),
      shortText(obj.benefit || fallback.sceneTitles[1], 12),
      shortText(obj.cta || fallback.sceneTitles[2], 12),
    ],
    sceneSubtitles: [
      shortText(obj.proof || fallback.sceneSubtitles[0], 18),
      shortText(badge0 || fallback.sceneSubtitles[1], 18),
      shortText(obj.cta || fallback.sceneSubtitles[2], 18),
    ],
    voiceText: String(obj.voice || fallback.voiceText).trim(),
    shortTitle,
    keywords,
    titleWithKeywords: String(obj.titleWithKeywords || (shortTitle && keywords ? `${shortTitle}

${keywords}` : '')).trim(),
    shortDescription,
    fullPost,
    affiliateUrl: finalAffiliateUrl,
    raw: obj,
  };
}

async function getAiScript(title, productUrl, promoUrl, affiliateUrl = '') {
  if (!VIDEO_SCRIPT_ENDPOINT) {
    if (REQUIRE_AI) {
      throw new Error('VIDEO_SCRIPT_ENDPOINT_NOT_SET');
    }
    return buildFallbackScript(title);
  }

  try {
    const response = await fetch(VIDEO_SCRIPT_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(VIDEO_SCRIPT_KEY ? { authorization: `Bearer ${VIDEO_SCRIPT_KEY}` } : {}),
      },
      body: JSON.stringify({
        title,
        content: [title, productUrl, promoUrl].filter(Boolean).join('\n'),
        affiliateUrl,
        productUrl,
        promoUrl,
        lang: 'zh-TW',
        style: 'shopee_short_video_3_scene',
      }),
    });
    const text = await response.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`AI_NOT_JSON: ${text.slice(0, 200)}`);
    }
    if (!response.ok || data?.ok === false) {
      throw new Error(data?.message || data?.error || `AI_HTTP_${response.status}`);
    }
    return normalizeAiResponse(data, title, affiliateUrl);
  } catch (error) {
    if (REQUIRE_AI) {
      throw error;
    }
    console.log(`[AI] fallback -> ${error.message}`);
    return buildFallbackScript(title);
  }
}


function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  return { url, key };
}

async function saveShopeeVideoPostToSupabase(payload, no = '') {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    console.log(`[${no}] SKIP Supabase：缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY`);
    return { ok: false, skipped: true };
  }

  const response = await fetch(`${url}/rest/v1/shopee_video_posts`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SUPABASE_INSERT_FAILED_${response.status}: ${text.slice(0, 500)}`);
  }

  return { ok: true };
}

async function callRender(item) {
  const response = await fetch(VIDEO_SERVER, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ item }),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`SERVER_NOT_JSON: ${text.slice(0, 300)}`);
  }
  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || data?.error || `HTTP_${response.status}`);
  }
  return data;
}

async function main() {
  if (!inputCsv) {
    console.error('請提供 CSV 路徑，例如: node scripts/shopee_batch_mp4.mjs "批量商品連結-8.csv" 1');
    process.exit(1);
  }

  const fullCsv = path.isAbsolute(inputCsv) ? inputCsv : path.join(cwd, inputCsv);
  if (!fs.existsSync(fullCsv)) {
    console.error(`找不到 CSV：${fullCsv}`);
    process.exit(1);
  }

  await fsp.mkdir(OUTPUT_DIR, { recursive: true });

  const csvText = await fsp.readFile(fullCsv, 'utf8');
  const rows = parseCsv(csvText);
  const targetRows = limitArg > 0 ? rows.slice(0, limitArg) : rows;

  console.log(`輸入解析到 ${rows.length} 筆，先做 ${targetRows.length} 筆`);
  console.log('建議流程：先以 limit=1 驗證，再改跑 5 筆，最後才放大到 20 筆以上。');

  const results = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < targetRows.length; i++) {
    const row = targetRows[i];
    const no = String(i + 1).padStart(3, '0');
    const title = pickTitle(row);
    const productUrl = pickProductUrl(row);
    const promoUrl = pickPromoUrl(row);
    const affiliateUrl = pickAffiliateUrl(row);
    const imageUrls = pickImagesFromRow(row);

    console.log(`[${no}] csv_image_urls=${imageUrls.length} source=CSV skip_scrape=${FORCE_CSV_ONLY}`);

    if (imageUrls.length < 3) {
      const message = `CSV 圖片不足 3 張，目前 ${imageUrls.length} 張`;
      console.log(`[${no}] FAIL ${message}`);
      failed++;
      results.push({ no, ok: false, title, message, build: BUILD });
      continue;
    }

    console.log(`[${no}] using_csv_images_only picked=${imageUrls.length}`);
    console.log(`[${no}] hero_images_ready=3`);

    const expectedOutput = path.join(
      OUTPUT_DIR,
      `${no}_${sanitizeFileName(title)}_${crypto.randomUUID().slice(0, 12)}.mp4`
    );

    try {
      const ai = await getAiScript(title, productUrl, promoUrl, affiliateUrl);
      console.log(`[${no}] ai_source=${ai.source}`);
      console.log(`[${no}] scene_titles=${ai.sceneTitles.join(' | ')}`);
      console.log(`[${no}] scene_subtitles=${ai.sceneSubtitles.join(' | ')}`);
      console.log(`[${no}] voice_text=${ai.voiceText}`);

      const data = await callRender({
        title,
        productUrl,
        promoUrl,
        affiliateUrl,
        imageUrls: imageUrls.slice(0, 3),
        sceneTitles: ai.sceneTitles,
        sceneSubtitles: ai.sceneSubtitles,
        voiceText: ai.voiceText,
        expectedOutput,
        bgmPath: BGM_PATH,
      });

      success++;
      console.log(`[${no}] OK -> ${data.output}`);
      const supabasePayload = {
        title,
        short_title: ai.shortTitle || '',
        full_post: ai.fullPost || '',
        affiliate_url: ai.affiliateUrl || affiliateUrl || promoUrl || '',
        video_url: data.publicVideoUrl || data.videoUrl || '',
        public_page_url: data.publicPageUrl || '',
        product_slug: data.slug || '',
        status: 'ready',
      };

      try {
        await saveShopeeVideoPostToSupabase(supabasePayload, no);
        console.log(`[${no}] ✅ 已寫入 Supabase 文案庫`);
      } catch (insertError) {
        console.log(`[${no}] ❌ Supabase 文案庫寫入失敗：${insertError.message}`);
      }

      results.push({
        no,
        ok: true,
        title,
        output: data.output,
        publicVideoUrl: data.publicVideoUrl || data.videoUrl || '',
        publicPageUrl: data.publicPageUrl || '',
        slug: data.slug || '',
        build: BUILD,
        aiSource: ai.source,
        usedImages: data.usedImages || [],
        sceneTitles: ai.sceneTitles,
        sceneSubtitles: ai.sceneSubtitles,
        shortTitle: ai.shortTitle || '',
        keywords: ai.keywords || '',
        titleWithKeywords: ai.titleWithKeywords || '',
        shortDescription: ai.shortDescription || '',
        fullPost: ai.fullPost || '',
        affiliateUrl: ai.affiliateUrl || affiliateUrl || promoUrl || '',
      });
    } catch (error) {
      failed++;
      console.log(`[${no}] FAIL ${error.message}`);
      results.push({ no, ok: false, title, message: error.message, build: BUILD });
    }
  }

  const resultFile = path.join(
    OUTPUT_DIR,
    `shopee_batch_result_${new Date().toISOString().replace(/[.:]/g, '-')}.json`
  );
  await fsp.writeFile(resultFile, JSON.stringify({ build: BUILD, success, failed, results }, null, 2), 'utf8');
  console.log(`完成：成功 ${success} / 失敗 ${failed}`);
  console.log(`結果檔：${resultFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

