// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const GEMINI_MODELS = [
  Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash-lite",
  Deno.env.get("GEMINI_FALLBACK_MODEL") || "gemini-2.5-flash",
].filter((model, index, arr): model is string => Boolean(model) && arr.indexOf(model) === index);

function normalizeScriptMode(value: any) {
  const mode = String(value || "").trim().toLowerCase();
  if (["ai", "ai-lite", "lite"].includes(mode)) return "ai-lite";
  if (["ai-premium", "premium"].includes(mode)) return "ai-premium";
  return "template";
}

function pickModelsByMode(mode: string) {
  if (mode === "ai-premium") return ["gemini-2.5-flash"];
  if (mode === "ai-lite") return GEMINI_MODELS;
  return [];
}

function buildTemplateCopy(title: string, content: string, affiliateUrl: string, lang = "zh-TW") {
  const fallback = rxvV70CategoryCopy(title, content, affiliateUrl) || buildBetterFallback(title, content, lang);
  const pain = fallback.pain || "先看需求再買";
  const benefit = fallback.benefit || "日常使用更順手";
  const cta = fallback.cta || "先看價格再決定";
  const keywords = fallback.keywords || extractProductKeywords(title, "好物推薦");
  const shortTitle = fallback.shortTitle || `${pain}${benefit}`.slice(0, 20);
  const shortDescription = fallback.shortDescription || `${content || title || "這款商品"}，適合日常使用，先看規格、評價與價格再決定。`.slice(0, 80);
  return {
    ...fallback,
    pain,
    benefit,
    proof: fallback.proof || "日常情境都用得到",
    cta,
    voice: fallback.voice || `${pain} ${benefit}，先看規格、評價與價格，確認適合再下手。`,
    badges: normalizeBadges(fallback.badges, lang),
    hook: fallback.hook || pain,
    bullets: Array.isArray(fallback.bullets) && fallback.bullets.length
      ? fallback.bullets.slice(0, 3)
      : [pain, benefit, fallback.proof || "日常情境都用得到"].slice(0, 3),
    shortTitle,
    keywords,
    titleWithKeywords: fallback.titleWithKeywords || `${shortTitle}\n\n${keywords}`,
    shortDescription,
    fullPost: String(fallback.fullPost || `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]`).replace(/\[affiliateUrl\]/g, affiliateUrl),
  };
}

const VIDEO_PROMPT = `
You are a high-converting short-form ecommerce video copywriter for Traditional Chinese (Taiwan).

Goal:
Create high-converting Shopee affiliate short-video copy.
The output must feel like a real buyer complaint first, then show the product as the simple fix.
Every result should sound suitable for posting directly to Shopee short video, Threads, LINE, or product share pages.
Do NOT write neutral catalog copy. Do NOT sound like an official product manual.
Pain must sound like a real person complaining in daily life.
The copy should create a clear "I have this problem too" feeling within the first 2 seconds. Every benefit must be concrete and visual, not abstract.

Hard requirements:
1. Language must be Traditional Chinese used in Taiwan.
2. Do not use simplified Chinese.
3. Do not use empty hype, vague praise, or generic filler.
4. Do not repeat the product title mechanically.
5. Every line must be short, easy to read on a phone screen, and conversion-oriented.
6. Emphasize real buyer concerns such as: too thin, easy to break, leaking, hard to carry, messy cleanup, wasted time, storage inconvenience, shipping speed, daily household use.
7. Avoid medical, illegal, or impossible claims.
8. CTA must be direct and action-oriented.
9. Use stronger emotional buyer pain words such as：很煩、崩潰、後悔、洗到懷疑人生、每天找不到、掉到很煩、租屋不敢打洞、嘴饞又怕踩雷、用一次就懂。
10. Do not make pain too rational. It should feel like a real person complaining while shopping.
11. Avoid fake claims such as exact sales numbers, guaranteed cure, guaranteed result, or exaggerated medical effect.
12. For food/snacks, focus on：追劇嘴饞、聚會不夠吃、口味選擇、大份量、怕踩雷。
13. For skincare, focus on：乾裂、脫皮、嘴唇乾、手肘乾、家裡常備；avoid medical claims.
14. For home storage, focus on：凌亂、租屋不敢打洞、衣服一直掉、清潔麻煩。
15. shortTitle: Create a compelling short video title (pain point + benefit style)
16. Add a concrete daily scene in shortDescription, such as：追劇到一半、朋友突然來、下班回家、半夜嘴饞、家裡快沒了、要用時找不到。
17. Avoid weak phrases like：很好用、很方便、值得買、推薦給你 unless supported by a scene.
18. CTA should imply action now, such as：先看口味、先看評價、先看規格、趁現在看價格.
21. Never use empty benefit lines such as：用過就懂差在哪、真的差很多、很值得、超方便 unless followed by a concrete scene.
22. benefit must describe a visible result, e.g. 省時間少麻煩、整理更順手、清潔更省力、吃起來更剛好. Do not use bucket/barrel/table phrases unless the product title clearly says it is bucket-sized, large-pack snacks, or refill pack.
19. For snack products, prioritize: 吃光、嘴饞、聚會不夠分、辦公室下午茶、囤零食.
20. For skincare products, prioritize: 嘴唇裂、手肘粗、腳跟乾、臨時要用找不到、家裡常備.
10. keywords: Generate 6-10 specific search keywords that Shopee users actually search for, separated by commas
11. titleWithKeywords: Combine shortTitle + line break + keywords
12. shortDescription: Write a natural 30-60 character description for video posting
13. fullPost: Combine shortTitle + double line breaks + shortDescription + double line breaks + affiliateUrl

Return STRICT JSON only with this schema:
{
  "pain": "<=12 Chinese characters, the strongest buyer pain point headline",
  "benefit": "<=12 Chinese characters, the clearest benefit headline",
  "proof": "<=18 Chinese characters, concrete support / use case / reassurance",
  "cta": "<=12 Chinese characters, direct CTA",
  "voice": "60-90 Chinese characters, natural spoken sales script",
  "badges": ["<=8 Chinese characters", "<=8 Chinese characters", "<=8 Chinese characters"],
  "hook": "<=14 Chinese characters",
  "bullets": ["<=14 Chinese characters", "<=14 Chinese characters", "<=14 Chinese characters"],
  "shortTitle": "<=20 Chinese characters, short video title optimized for Shopee",
  "keywords": "6-10 search keywords separated by commas, no spaces around commas",
  "titleWithKeywords": "shortTitle + '\\n\\n' + keywords",
  "shortDescription": "30-60 Chinese characters, short video description for posting",
  "fullPost": "shortTitle + '\\n\\n' + shortDescription + '\\n\\n' + affiliateUrl"
}

Writing formula:
- pain: say what problem the buyer wants to avoid right now, using complaint tone
- benefit: say what this product fixes or improves. It must match the product category and must not be a fixed universal phrase.
- proof: give concrete reassurance or daily use scenario
- cta: push immediate click action without sounding spammy
- voice: natural spoken line, not robotic
- shortTitle: pain point + benefit in one line
- keywords: actual search terms like "垃圾袋加厚","廚餘袋大容量","不漏水垃圾袋"
- shortDescription: natural posting text
- fullPost: ready-to-post format

Example tone for trash bags:
- pain: 容易破又滴漏
- benefit: 加厚耐裝更安心
- proof: 廚餘打包也不怕髒
- cta: 立即點擊查看
- shortTitle: 垃圾袋總是破？加厚款解決一切煩惱
- keywords: 垃圾袋,廚餘袋,加厚垃圾袋,不漏水垃圾袋,大容量垃圾袋,居家垃圾袋
- shortDescription: 厭倦垃圾袋總是破掉滴漏嗎？這款加厚垃圾袋讓你打包廚餘更安心，居家必備好物！
- fullPost: 垃圾袋總是破？加厚款解決一切煩惱\n\n厭倦垃圾袋總是破掉滴漏嗎？這款加厚垃圾袋讓你打包廚餘更安心，居家必備好物！\n\n[affiliateUrl]

Product info:
{{PRODUCT_CONTEXT}}
`;


function buildProductContext(title: string, content: string, affiliateUrl: string) {
  return [
    `Product Title: ${title || "(empty)"}`,
    `Product Details: ${content || "(empty)"}`,
    `affiliateUrl: ${affiliateUrl || "[affiliateUrl]"}`,
  ].join("\n");
}

function buildPromptText(
  detectedLanguage: string,
  title: string,
  content: string,
  affiliateUrl: string,
) {
  const productContext = buildProductContext(title, content, affiliateUrl);
  return VIDEO_PROMPT.replace("{{PRODUCT_CONTEXT}}", productContext) +
    `\n\nInput language: ${detectedLanguage}\n\n` +
    `Important:\n` +
    `- Write subtitle-friendly copy for ecommerce short video.\n` +
    `- First line must be a pain-point style line.\n` +
    `- Keep each main field concise.\n` +
    `- Use the provided affiliateUrl in fullPost.\n` +
    `- Return JSON only without markdown fences or extra explanation.\n`;
}

function summarizeGeminiErrorText(text: string, maxLen = 500) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen)}...` : cleaned;
}

function pickGeminiKey(): string | null {
  return (
    Deno.env.get("GEMINI_API_KEY") ||
    Deno.env.get("GEMINI_API_KEY_SUMMARY") ||
    null
  );
}

async function callGemini(model: string, apiKey: string, payload: any) {
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { res, status: res.status, text, json };
}

function safeParseJson(text: string) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  try {
    let cleaned = String(text || "").trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7).trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3).trim();
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3).trim();
    }

    return JSON.parse(cleaned);
  } catch {}

  try {
    const raw = String(text || "");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) return null;

    const cleaned = raw.slice(start, end + 1).trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}


function detectLanguage(input: string) {
  const text = (input || "").trim();

  if (/[\u4e00-\u9fff]/.test(text)) return "zh-TW";
  if (/[ぁ-んァ-ヶ]/.test(text)) return "ja";
  return "en";
}

function cleanText(value: any) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[「」]/g, "")
    .trim();
}

function clampText(value: any, maxLen = 22) {
  const text = cleanText(value);
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function containsChinese(input: string) {
  return /[\u4e00-\u9fff]/.test(input || "");
}

function englishHeavy(input: string) {
  const s = String(input || "");
  const en = (s.match(/[A-Za-z]/g) || []).length;
  const zh = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  return en > zh;
}

function normalizeZhTw(value: any) {
  return String(value || "")
    .replace(/视频/g, "影片")
    .replace(/点击/g, "點擊")
    .replace(/优惠/g, "優惠")
    .replace(/购买/g, "購買")
    .replace(/价格/g, "價格")
    .replace(/评价/g, "評價")
    .replace(/查看更多/g, "看更多")
    .replace(/立即查看/g, "立即看看")
    .trim();
}

function normalizeProductTitle(title: string): string {
  return String(title || "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/[\u200D\uFE0F]/g, " ")
    .replace(/[《》「」【】\[\]()（）]/g, " ")
    .replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFoodPainFallback(title: string) {
  const normalized = normalizeProductTitle(title);
  const coreKeyword = extractCoreProductName(title);
  const keywordString = extractProductKeywords(title, "食品");
  const hasSGS = /SGS|無毒/.test(normalized);
  const hasOrigin = /水林|台農57號|現挖/.test(normalized);
  const isIce = /冰烤地瓜|冰烤蕃薯|冷凍地瓜|拆封即食/.test(normalized);
  const isDry = /地瓜乾|水果乾|蜜地瓜|真空/.test(normalized);

  if (isIce) {
    return {
      pain: "退冰軟爛難吃？",
      benefit: "冰烤綿密又香甜",
      proof: hasOrigin ? "台農57號拆封即食" : "冰冰甜甜更順口",
      cta: "點進去看細節",
      voice: `是不是很怕冰地瓜退冰後變得軟爛沒口感？這款${coreKeyword}主打綿密香甜、拆封就能吃，嘴饞或下午茶都很方便，想吃好吃地瓜先點進去看。`,
      badges: ["拆封即食", "綿密香甜", hasOrigin ? "台農57號" : "嘴饞必備"],
      shortTitle: `${coreKeyword}綿密香甜，拆封即食`,
      keywords: keywordString,
      titleWithKeywords: `${coreKeyword}綿密香甜，拆封即食\n\n${keywordString}`,
      shortDescription: `是不是很怕冰地瓜退冰後變得軟爛？這款${coreKeyword}綿密香甜，拆封即食，嘴饞時冰冰吃超剛好！`,
      fullPost: `${coreKeyword}綿密香甜，拆封即食\n\n是不是很怕冰地瓜退冰後變得軟爛？這款${coreKeyword}綿密香甜，拆封即食，嘴饞時冰冰吃超剛好！\n\n[affiliateUrl]`,
    };
  }

  if (isDry) {
    return {
      pain: "嘴饞又怕踩雷？",
      benefit: "越嚼越香更涮嘴",
      proof: /真空/.test(normalized) ? "真空包裝更好保存" : "當點心剛剛好",
      cta: "點進去看細節",
      voice: `是不是常常嘴饞想吃點東西，又怕買到太乾太硬不好吃？這款${coreKeyword}主打越嚼越香，當下午茶或追劇點心都很適合，想看口味細節先點進去看看。`,
      badges: ["越嚼越香", /真空/.test(normalized) ? "真空包裝" : "點心必備", /伴手禮|素食/.test(normalized) ? "送禮也行" : "涮嘴順口"],
      shortTitle: `${coreKeyword}越嚼越香，嘴饞必囤`,
      keywords: keywordString,
      titleWithKeywords: `${coreKeyword}越嚼越香，嘴饞必囤\n\n${keywordString}`,
      shortDescription: `是不是常常嘴饞又怕買到不好吃的點心？這款${coreKeyword}越嚼越香，當下午茶或追劇零食都很剛好！`,
      fullPost: `${coreKeyword}越嚼越香，嘴饞必囤\n\n是不是常常嘴饞又怕買到不好吃的點心？這款${coreKeyword}越嚼越香，當下午茶或追劇零食都很剛好！\n\n[affiliateUrl]`,
    };
  }

  return {
    pain: "之前買到雷地瓜？",
    benefit: "這款香甜又安心",
    proof: hasSGS ? "台農57號加SGS認證" : hasOrigin ? "產地直送更安心" : "香甜鬆軟更順口",
    cta: "點進去看細節",
    voice: `是不是之前也買過不甜又乾的地瓜，吃了超失望？這款${coreKeyword}主打香甜鬆軟，${hasSGS ? "還有SGS認證，" : "吃起來更安心，"}${hasOrigin ? "產地直送更新鮮，" : "日常嘴饞也很適合，"}想找不容易踩雷的地瓜可以先點進去看。`,
    badges: [hasOrigin ? "產地直送" : "香甜鬆軟", hasSGS ? "SGS認證" : "安心選擇", /現挖/.test(normalized) ? "現挖更新鮮" : "地瓜控必看"],
    shortTitle: hasSGS ? `${coreKeyword}超好吃！SGS認證` : `${coreKeyword}香甜鬆軟不踩雷`,
    keywords: keywordString,
    titleWithKeywords: `${hasSGS ? `${coreKeyword}超好吃！SGS認證` : `${coreKeyword}香甜鬆軟不踩雷`}\n\n${keywordString}`,
    shortDescription: hasSGS
      ? `是不是也怕買到不好吃的地瓜？這款${coreKeyword}香甜鬆軟，還有SGS認證，安心吃更放心！`
      : `是不是也怕買到不好吃的地瓜？這款${coreKeyword}香甜鬆軟、不乾不柴，想吃好吃地瓜先看這款！`,
    fullPost: hasSGS
      ? `${coreKeyword}超好吃！SGS認證\n\n是不是也怕買到不好吃的地瓜？這款${coreKeyword}香甜鬆軟，還有SGS認證，安心吃更放心！\n\n[affiliateUrl]`
      : `${coreKeyword}香甜鬆軟不踩雷\n\n是不是也怕買到不好吃的地瓜？這款${coreKeyword}香甜鬆軟、不乾不柴，想吃好吃地瓜先看這款！\n\n[affiliateUrl]`,
  };
}

function buildBetterFallback(title: string, content: string, lang = "zh-TW") {
  const base = buildFallback(title, content, lang);
  if (lang !== "zh-TW") return base;
  const source = `${title} ${content}`;
  if (/地瓜|蕃薯|番薯|甘藷|蕉|香蕉|芋頭|馬鈴薯|洋芋|青菜|蔬菜|水果|果品/i.test(source)) {
    return buildFoodPainFallback(title);
  }
  if (/除濕|潮濕|清淨|除湿/i.test(source)) {
    return {
      pain: "房間總是濕悶？",
      benefit: "除濕清淨更省事",
      proof: "小空間也好放",
      cta: "先看評價再決定",
      voice:
        "如果房間總是濕悶、衣服不好乾，這類除濕清淨機會更實用。小空間也好放，先看規格、評價和實拍，再決定更安心。",
      badges: ["除濕清淨", "小空間", "先看評價"],
      shortTitle: "房間濕悶好難受？除濕神器來幫忙",
      keywords: "除濕機,除濕器,清淨機,除濕清淨機,家用除濕,潮濕除濕",
      titleWithKeywords:
        "房間濕悶好難受？除濕神器來幫忙\n\n除濕機,除濕器,清淨機,除濕清淨機,家用除濕,潮濕除濕",
      shortDescription:
        "房間總是濕悶衣服不好乾嗎？這款除濕清淨機讓你輕鬆解決潮濕問題，小空間也能放！",
      fullPost:
        "房間濕悶好難受？除濕神器來幫忙\n\n房間總是濕悶衣服不好乾嗎？這款除濕清淨機讓你輕鬆解決潮濕問題，小空間也能放！\n\n[affiliateUrl]",
    };
  }
  return base;
}

function normalizeBadges(value: any, lang = "zh-TW") {
  const arr = Array.isArray(value) ? value : [];
  const cleaned = arr
    .map((v) => clampText(v, 12))
    .filter(Boolean)
    .slice(0, 3);

  if (cleaned.length > 0) return cleaned;

  if (lang === "zh-TW") return ["重點推薦", "快速了解", "立即看看"];
  if (lang === "ja") return ["注目", "使いやすい", "チェック"];
  return ["Hot pick", "Easy use", "Check now"];
}

function normalizeKeywordString(
  value: any,
  title = "",
  content = "",
  lang = "zh-TW",
) {
  const raw = String(value || "")
    .replace(/，/g, ",")
    .replace(/\s+/g, "")
    .trim();

  const generic =
    /^(商品|好物|推薦|日常好物|實用商品)(,(商品|好物|推薦|日常好物|實用商品))*$/;
  if (!raw || generic.test(raw)) {
    const source = `${title} ${content}`;
    if (/垃圾袋|廚餘|垃圾/i.test(source))
      return "垃圾袋,加厚垃圾袋,廚餘袋,不漏水垃圾袋,大容量垃圾袋,家用垃圾袋";
    if (/氣炸|air fryer|炸鍋/i.test(source))
      return "氣炸鍋,大容量氣炸鍋,少油料理,家用氣炸鍋,懶人料理,廚房家電";
    if (/收納|整理|storage/i.test(source))
      return "收納盒,收納整理,家用收納,衣櫃收納,桌面整理,省空間收納";
    if (/清潔|除污|clean/i.test(source))
      return "清潔用品,除污清潔,家用清潔,浴室清潔,廚房清潔,省力清潔";
    if (/地瓜|蕃薯|番薯|甘藷|蕉|香蕉|芋頭|馬鈴薯|洋芋|青菜|蔬菜|水果|果品/i.test(source))
      return extractProductKeywords(title, "農產品");
  }

  const parts = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const uniq: string[] = [];
  for (const p of parts) {
    if (!uniq.includes(p)) uniq.push(p);
  }

  if (uniq.length >= 4) return uniq.slice(0, 10).join(",");
  return raw;
}

function extractProductKeywords(title: string, category: string): string {
  const clean = normalizeProductTitle(title);
  if (!clean) return "商品,購物,開箱,熱賣,人氣商品";

  const keywords: string[] = [];
  const add = (value: string) => {
    const v = String(value || "").trim();
    if (v && !keywords.includes(v)) keywords.push(v);
  };

  if (/冰烤地瓜|冰烤蕃薯/.test(clean)) add("冰烤地瓜");
  if (/地瓜乾|水果乾/.test(clean)) add("地瓜乾");
  if (/蜜地瓜/.test(clean)) add("蜜地瓜");
  if (/水林/.test(clean) && /地瓜/.test(clean)) add("水林地瓜");
  if (/台農57號/.test(clean)) add("台農57號");
  if (/SGS/.test(clean)) add("SGS認證");
  if (/無毒/.test(clean)) add("無毒地瓜");
  if (/現挖/.test(clean)) add("現挖地瓜");
  if (/真空/.test(clean)) add("真空包裝");
  if (/黃地瓜/.test(clean)) add("黃地瓜");
  if (/紫地瓜/.test(clean)) add("紫地瓜");
  if (/素食/.test(clean)) add("素食點心");
  if (/伴手禮/.test(clean)) add("伴手禮");
  if (/拆封即食/.test(clean)) add("拆封即食");
  if (/地瓜春/.test(clean)) add("地瓜春");

  if (/地瓜|蕃薯|番薯|甘藷/.test(clean)) add("地瓜");
  if (/烤地瓜/.test(clean) || /冰烤/.test(clean)) add("烤地瓜");
  if (/冷凍/.test(clean)) add("冷凍地瓜");
  if (/即食/.test(clean)) add("即食地瓜");
  if (/點心/.test(clean)) add("地瓜點心");

  if (keywords.length < 5) {
    const parts = clean
      .replace(/\d+kg|\d+g|kg|g/gi, " ")
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (part.length >= 2 && part.length <= 12) add(part);
      if (keywords.length >= 8) break;
    }
  }

  if (keywords.length === 0) {
    return "商品,購物,開箱,熱賣,人氣商品";
  }

  return keywords.slice(0, 8).join(",");
}

function extractCoreProductName(title: string): string {
  const clean = normalizeProductTitle(title);
  if (!clean) return "商品";

  if (/水林/.test(clean) && /台農57號/.test(clean) && /地瓜/.test(clean)) return "水林台農57號地瓜";
  if (/冰烤地瓜|冰烤蕃薯/.test(clean)) return "冰烤地瓜";
  if (/地瓜乾/.test(clean) && /蜜地瓜/.test(clean)) return "蜜地瓜乾";
  if (/水果乾/.test(clean) && /蜜地瓜/.test(clean)) return "蜜地瓜乾";
  if (/蜜地瓜/.test(clean)) return "蜜地瓜";
  if (/水林/.test(clean) && /地瓜/.test(clean)) return "水林地瓜";
  if (/台農57號/.test(clean) && /地瓜/.test(clean)) return "台農57號地瓜";
  if (/地瓜/.test(clean)) return "地瓜";

  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join("") || "商品";
}

function buildFallback(title: string, content: string, lang = "zh-TW") {
  const source = `${title} ${content}`.toLowerCase();

  if (lang === "zh-TW") {
    if (
      source.includes("地瓜") ||
      source.includes("蕃薯") ||
      source.includes("番薯") ||
      source.includes("甘藷") ||
      source.includes("蕉") ||
      source.includes("香蕉") ||
      source.includes("芋頭") ||
      source.includes("馬鈴薯") ||
      source.includes("洋芋") ||
      source.includes("蔬菜") ||
      source.includes("水果") ||
      source.includes("果品")
    ) {
      return buildFoodPainFallback(title);
    }
    if (source.includes("氣炸") || source.includes("air fryer") || source.includes("炸鍋")) {
      return {
        pain: "下班後懶得開火？",
        benefit: "少油料理更省時",
        proof: "大容量操作更直覺",
        cta: "先點進去看看",
        voice: "下班後不想花太多時間煮飯嗎？這款主打更省時的少油料理，容量實用，操作也更直覺。想快速做出日常餐點，可以先點進去看看。",
        badges: ["少油料理", "大容量", "操作直覺"],
        shortTitle: "下班懶人必備，少油料理神器",
        keywords: "氣炸鍋,少油料理,懶人廚具,快速料理,大容量氣炸鍋,家用炸鍋",
        titleWithKeywords: "下班懶人必備，少油料理神器\n\n氣炸鍋,少油料理,懶人廚具,快速料理,大容量氣炸鍋,家用炸鍋",
        shortDescription: "下班後還要花時間煮飯嗎？這款氣炸鍋讓你快速完成少油料理，大容量設計超實用！",
        fullPost: "下班懶人必備，少油料理神器\n\n下班後還要花時間煮飯嗎？這款氣炸鍋讓你快速完成少油料理，大容量設計超實用！\n\n[affiliateUrl]",
      };
    }
    if (source.includes("收納") || source.includes("storage") || source.includes("整理")) {
      return {
        pain: "東西一多就很亂？",
        benefit: "收納分類更省空間",
        proof: "拿取整理更順手",
        cta: "先看看適不適合",
        voice: "如果空間一亂就很難整理，這類收納用品會更實用。分類更清楚，也比較省空間，平常拿取更順手。想改善雜亂感，可以先點進去看看。",
        badges: ["省空間", "好整理", "更順手"],
        shortTitle: "家裡總是亂？收納神器來救",
        keywords: "收納盒,收納整理,家用收納,衣櫃收納,桌面整理,省空間收納",
        titleWithKeywords: "家裡總是亂？收納神器來救\n\n收納盒,收納整理,家用收納,衣櫃收納,桌面整理,省空間收納",
        shortDescription: "家裡東西一多就亂成一團嗎？這款收納神器讓你分類更清楚，省空間又好整理！",
        fullPost: "家裡總是亂？收納神器來救\n\n家裡東西一多就亂成一團嗎？這款收納神器讓你分類更清楚，省空間又好整理！\n\n[affiliateUrl]",
      };
    }
    if (source.includes("清潔") || source.includes("clean") || source.includes("除污")) {
      return {
        pain: "髒污卡很久很難清？",
        benefit: "清潔更省力省時間",
        proof: "日常使用更方便",
        cta: "點進去看細節",
        voice: "遇到難清的髒污，最怕又花時間又費力。這類商品通常主打日常清潔更方便，使用起來也更省事。想知道適不適合你，可以點進去看看細節。",
        badges: ["省力清潔", "日常實用", "快速查看"],
        shortTitle: "清潔煩惱一掃而空",
        keywords: "清潔用品,除污清潔,家用清潔,省力清潔,快速清潔,日常清潔",
        titleWithKeywords: "清潔煩惱一掃而空\n\n清潔用品,除污清潔,家用清潔,省力清潔,快速清潔,日常清潔",
        shortDescription: "遇到難清的髒污總是很頭痛嗎？這款清潔神器讓你輕鬆除污，省力又省時間！",
        fullPost: "清潔煩惱一掃而空\n\n遇到難清的髒污總是很頭痛嗎？這款清潔神器讓你輕鬆除污，省力又省時間！\n\n[affiliateUrl]",
      };
    }
    return {
      pain: "還在挑好用的款式？",
      benefit: "這款主打實用省麻煩",
      proof: "日常使用更順手",
      cta: "點進去看看內容",
      voice: "如果你正在找實用又不想踩雷的款式，這款主打日常使用更省麻煩。操作和使用情境都偏實用，想了解細節可以直接點進去看看。",
      badges: ["實用推薦", "日常好用", "立即看看"],
      shortTitle: "實用好物推薦，省麻煩又順手",
      keywords: "實用商品,日常好物,省麻煩設計,實用推薦,好用款式",
      titleWithKeywords: "實用好物推薦，省麻煩又順手\n\n實用商品,日常好物,省麻煩設計,實用推薦,好用款式",
      shortDescription: "找了好久的實用款式嗎？這款商品主打省麻煩設計，日常使用超順手，絕對是你的好幫手！",
      fullPost: "實用好物推薦，省麻煩又順手\n\n找了好久的實用款式嗎？這款商品主打省麻煩設計，日常使用超順手，絕對是你的好幫手！\n\n[affiliateUrl]",
    };
  }
  if (lang === "ja") {
    return {
      pain: "使いにくさで困ってない？",
      benefit: "毎日使いやすくなる",
      proof: "手間を減らしやすい",
      cta: "まずはチェック",
      voice: "毎日の使いにくさが気になるなら、こういう実用タイプはチェックしやすいです。使いやすさや手間の減らしやすさを重視したい人は、まずは内容を見てみてください。",
      badges: ["実用的", "使いやすい", "チェック"],
    };
  }
  return {
    pain: "Still dealing with this hassle?",
    benefit: "Makes everyday use easier",
    proof: "Practical for daily routines",
    cta: "Tap to check it now",
    voice: "If you are tired of small daily hassles, this kind of product is worth a look. It focuses on practical everyday use and a smoother experience. Tap to check the details and see if it fits your needs.",
    badges: ["Practical", "Easy use", "Check now"],
  };
}



function rxvV70CategoryCopy(title: string, content: string, affiliateUrl = "[affiliateUrl]") {
  const source = `${title} ${content}`;

  const make = (obj: any) => ({
    ...obj,
    titleWithKeywords: `${obj.shortTitle}\n\n${obj.keywords}`,
    fullPost: `${obj.shortTitle}\n\n${obj.shortDescription}\n\n${affiliateUrl}\n\n${String(obj.keywords || "")
      .split(",")
      .map((x: string) => `#${x.trim()}`)
      .filter(Boolean)
      .join(" ")}`,
  });

  if (/卡滋|爆米花|焦糖|草莓煉乳|巧達起司|特濃巧克力|玫瑰鹽/i.test(source)) {
    return make({
      pain: "追劇零食又吃光？",
      benefit: "大桶放桌上不用搶🔥",
      proof: "多口味全家都能挑",
      cta: "先看口味再買",
      voice: "追劇看到一半零食吃光真的很掃興，朋友來家裡更怕不夠分。卡滋桶裝爆米花多種口味可以選，大桶直接放桌上，不用一直補，追劇聚會都更有感。",
      badges: ["大桶不用搶", "多口味", "追劇聚會"],
      shortTitle: "追劇零食又吃光？大桶放桌上不用搶",
      keywords: "卡滋爆米花,桶裝爆米花,追劇零食,聚會點心,大容量零食,焦糖爆米花,草莓爆米花,辦公室零食",
      shortDescription: "追劇看到一半零食吃光超掃興？卡滋桶裝爆米花大桶放桌上，不用一直補，聚會分享更剛好。",
    });
  }

  if (/華元|卡力卡力|真魷味|三色野菜園|桶裝餅乾|鹹蛋黃|海苔鹽|椒鹽雞汁/i.test(source)) {
    return make({
      pain: "朋友來零食不夠？",
      benefit: "一桶放桌上不用補🔥",
      proof: "經典口味大人小孩愛",
      cta: "先看口味再買",
      voice: "朋友突然來家裡，最尷尬就是零食一下被吃光，還要一直補。華元桶裝餅乾多種經典口味，大桶直接放桌上，追劇、聚會、辦公室下午茶都比較不怕不夠分。",
      badges: ["一桶不用補", "經典口味", "聚會方便"],
      shortTitle: "朋友來零食不夠？一桶放桌上不用補",
      keywords: "華元桶裝餅乾,卡力卡力,真魷味,三色野菜園,大容量零食,追劇零食,聚會零食,辦公室零食",
      shortDescription: "朋友來家裡最怕零食一下吃光？華元桶裝餅乾一桶放桌上，不用一直補，聚會更方便。",
    });
  }

  if (/凡士林|Vaseline|修護凝膠|保濕|滋潤|萬用膏/i.test(source)) {
    return make({
      pain: "嘴唇乾到裂開？",
      benefit: "一抹就不乾很有感🔥",
      proof: "手肘腳跟都能用",
      cta: "先看規格再買",
      voice: "嘴唇乾到裂開、手肘腳跟粗粗的，最煩是要用時家裡剛好沒有。凡士林經典修護凝膠適合日常常備，小罐可外出，大罐放家裡，乾燥時隨手用更方便。",
      badges: ["一抹不乾", "家裡常備", "小罐方便"],
      shortTitle: "嘴唇乾到裂開？凡士林一抹不乾",
      keywords: "凡士林,凡士林修護凝膠,保濕滋潤,乾燥肌,護唇膏,護手霜,萬用膏,經典凡士林",
      shortDescription: "嘴唇乾、手肘粗，臨時要用卻找不到最煩。凡士林經典修護凝膠家裡常備，乾燥時隨手用。",
    });
  }

  return null;
}

function rxvStrongPainCategory(title: string, content: string) {
  const source = `${title} ${content}`;

  if (/氣炸|炸鍋|硅油|烘焙紙|烘培紙|吸油紙|氣炸鍋紙/i.test(source)) {
    return {
      pain: "氣炸鍋洗到懷疑人生？",
      benefit: "這款真的省很多🔥",
      proof: "免刷洗少油垢",
      cta: "先看評價再買",
      shortTitle: "氣炸鍋洗到懷疑人生？這款省很多",
    };
  }

  if (/磁吸|免打孔|免釘|牆貼|琺瑯|收納改造|租屋/i.test(source)) {
    return {
      pain: "牆打洞打到後悔？",
      benefit: "這款真的差很多🔥",
      proof: "不用打洞也能收",
      cta: "先看評價再買",
      shortTitle: "牆打洞打到後悔？這款不用釘",
    };
  }

  if (/衣架|曬衣|晾衣|掛衣|防滑|不鏽鋼衣架/i.test(source)) {
    return {
      pain: "衣服一直掉超煩？",
      benefit: "這款真的掛得住🔥",
      proof: "濕衣重物也穩",
      cta: "先看評價再買",
      shortTitle: "衣服一直掉超煩？這款掛得住",
    };
  }

  if (/地瓜乾|蜜地瓜|水果乾|零食|點心|伴手禮/i.test(source)) {
    return {
      pain: "嘴饞又怕吃太罪惡？",
      benefit: "這款解饞比較安心🔥",
      proof: "追劇下午茶剛好",
      cta: "先看評價再買",
      shortTitle: "嘴饞又怕罪惡？這款解饞剛好",
    };
  }

  if (/冰烤地瓜|冰烤蕃薯|拆封即食|冷凍地瓜/i.test(source)) {
    return {
      pain: "想吃地瓜還要等很煩？",
      benefit: "拆封就能吃超方便🔥",
      proof: "冰冰吃也綿密",
      cta: "先看評價再買",
      shortTitle: "想吃地瓜還要等？這款拆封就吃",
    };
  }

  if (/地瓜|蕃薯|番薯|甘藷|台農57號/i.test(source)) {
    return {
      pain: "買到不甜地瓜很崩潰？",
      benefit: "這款香甜鬆軟有感🔥",
      proof: "現挖直送更安心",
      cta: "先看評價再買",
      shortTitle: "買到不甜地瓜很崩潰？這款有感",
    };
  }

  return null;
}

function rxvApplyStrongPain(result: any, title: string, content: string) {
  const rule = rxvStrongPainCategory(title, content);
  if (!rule) return result;

  const keywords = result?.keywords || "好物推薦,生活用品,實用商品";
  const hashtagKeywords = result?.hashtagKeywords || String(keywords).split(",").map((x: string) => `#${x.trim()}`).join(" ");

  return {
    ...result,
    pain: rule.pain,
    benefit: rule.benefit,
    proof: rule.proof,
    cta: rule.cta,
    shortTitle: rule.shortTitle,
    titleWithKeywords: `${rule.shortTitle}\n\n${keywords}`,
    shortDescription: result?.shortDescription || `${rule.pain.replace("？", "，")}${rule.benefit.replace("🔥", "")}，日常使用更省事。`,
    fullPost: `${rule.shortTitle}\n\n${result?.shortDescription || `${rule.pain.replace("？", "，")}${rule.benefit.replace("🔥", "")}，日常使用更省事。`}\n\n[affiliateUrl]\n\n${hashtagKeywords}`,
  };
}


// RXV V116：痛點爆單強化版，只清洗不合類別的固定字幕，不碰圖片/旁白/音樂/輸出流程
function rxvIsBulkSnackOrRefill(title: string, content: string) {
  const source = `${title} ${content}`;
  return /桶裝|大桶|大容量|家庭號|分享包|補充包|1000ml|2000ml|700g|零食|餅乾|爆米花|卡力卡力|華元|口味任選/i.test(source);
}

function rxvBadUniversalBenefit(value: any) {
  const text = String(value || "");
  return /大桶放桌上|一桶放桌上|放桌上不用|不用一直補|不用補|不用搶|家裡常備真的安心|這款真的差很多/.test(text);
}

function rxvPickSafeBenefit(title: string, content: string) {
  const source = `${title} ${content}`;

  if (/零食|餅乾|點心|爆米花|地瓜乾|湯泡飯|泡麵|沖泡|宵夜|食品|口味/i.test(source)) return "嘴饞解饞更剛好";
  if (/洗髮|沐浴|牙膏|保養|凡士林|護唇|乳液|香水|美妝/i.test(source)) return "日常保養更順手";
  if (/清潔|洗衣|除污|去油|廚房|浴室|垃圾袋|廚餘/i.test(source)) return "清潔收拾更省力";
  if (/收納|整理|磁吸|卡磚|衣架|掛勾|免釘|免打孔|保護殼|卡牌/i.test(source)) return "整理拿取更順手";
  if (/耳機|藍牙|手機|充電|電競|3C|數位|保護貼/i.test(source)) return "規格清楚少踩雷";
  if (/B群|維他命|營養|保健|克補/i.test(source)) return "日常補給更方便";

  return "少踩雷更好選";
}

function rxvSanitizeUniversalCopy(result: any, title: string, content: string) {
  const safe = { ...result };
  const allowBulkLine = rxvIsBulkSnackOrRefill(title, content);

  if (rxvBadUniversalBenefit(safe.benefit) && !allowBulkLine) safe.benefit = rxvPickSafeBenefit(title, content);
  if (rxvBadUniversalBenefit(safe.proof) && !allowBulkLine) safe.proof = "日常使用更有感";

  if (Array.isArray(safe.sceneTitles)) {
    safe.sceneTitles = safe.sceneTitles.map((line: string) => rxvBadUniversalBenefit(line) && !allowBulkLine ? rxvPickSafeBenefit(title, content) : line);
  }

  if (Array.isArray(safe.sceneSubtitles)) {
    safe.sceneSubtitles = safe.sceneSubtitles.map((line: string) => rxvBadUniversalBenefit(line) && !allowBulkLine ? rxvPickSafeBenefit(title, content) : line);
  }

  return safe;
}


// RXV V119：爆單文案安全強化版
// 目標：加強「情緒痛點 + 立即點擊理由」，但保健、牙膏、洗髮、護膚不做誇大功效承諾。
function rxvV119HasAny(source: string, words: RegExp) {
  return words.test(source || "");
}

function rxvV119MakePost(obj: any, fallbackKeywords = "好物推薦,生活用品,實用商品") {
  const keywords = obj.keywords || fallbackKeywords;
  const hashtagKeywords = obj.hashtagKeywords || String(keywords)
    .split(",")
    .map((x: string) => `#${x.trim()}`)
    .filter(Boolean)
    .join(" ");
  const shortTitle = obj.shortTitle || `${obj.pain}${obj.benefit}`;
  const shortDescription = obj.shortDescription || `${obj.pain.replace(/[？?!！]/g, "，")}${obj.proof || obj.benefit}，先看細節再決定。`;
  return {
    ...obj,
    keywords,
    hashtagKeywords,
    titleWithKeywords: `${shortTitle}\n\n${keywords}`,
    fullPost: `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]\n\n${hashtagKeywords}`,
  };
}

function rxvV119BoostCopy(result: any, title: string, content: string) {
  const source = `${title} ${content}`;
  const base = { ...result };
  const keywords = base.keywords || "好物推薦,生活用品,實用商品";
  const keepSource = base.source || "model";

  const apply = (patch: any) => rxvV119MakePost({ ...base, ...patch, source: keepSource }, keywords);

  if (rxvV119HasAny(source, /卡磚|卡牌|寶可夢|PTCG|保護殼|收藏/i)) {
    return apply({
      pain: "卡片放久會心疼？",
      benefit: "收藏保護更安心",
      proof: "抗UV磁吸好收納",
      cta: "先看規格再決定",
      shortTitle: "卡片放久怕褪色？收藏保護先準備",
      shortDescription: "珍藏卡片最怕放久泛黃或刮傷，先看抗UV與磁吸規格，收藏保護更安心。",
    });
  }

  if (rxvV119HasAny(source, /B群|維他命|營養|保健|克補|鐵|鋅/i)) {
    return apply({
      pain: "每天累到只想躺？",
      benefit: "補給選擇更清楚",
      proof: "先看成分與規格",
      cta: "先看成分再決定",
      shortTitle: "每天累到只想躺？日常補給先看成分",
      shortDescription: "上班忙、作息亂時更容易忽略日常補給，先看成分、規格與適合情境再決定。",
    });
  }

  if (rxvV119HasAny(source, /牙膏|好來|Darlie|口腔|護齦|竹炭|小蘇打/i)) {
    return apply({
      pain: "開口怕不夠清新？",
      benefit: "日常清潔更有感",
      proof: "多款口味可選擇",
      cta: "先看口味再決定",
      shortTitle: "開口怕不夠清新？日常清潔從牙膏開始",
      shortDescription: "早上出門、約會或開會前，口氣清新很重要。多款牙膏口味可選，日常清潔更有儀式感。",
    });
  }

  if (rxvV119HasAny(source, /洗髮|香水洗髮|植萃|弱酸|低敏|無添加|頭皮|髮/i)) {
    return apply({
      pain: "洗完還是不夠舒服？",
      benefit: "香氣清爽更加分",
      proof: "多款香味可選擇",
      cta: "先看香味再決定",
      shortTitle: "洗完還是不夠舒服？換個香味更有感",
      shortDescription: "下班回家洗頭，想要更清爽舒服的感覺。多款香味可選，依髮質與喜好挑更適合。",
    });
  }

  if (rxvV119HasAny(source, /沐浴|身體清潔|Biore|乳液|保濕|凡士林|護唇|修護凝膠|護膚/i)) {
    return apply({
      pain: "洗完乾乾很煩？",
      benefit: "清爽香氣更舒服",
      proof: "補充包更好囤",
      cta: "先看香味再決定",
      shortTitle: "洗完乾乾很煩？日常沐浴先看香味",
      shortDescription: "下班回家洗澡，最怕洗完不夠舒服。多款香味與補充包可選，家裡備著更省心。",
    });
  }

  if (rxvV119HasAny(source, /湯泡飯|泡飯|沖泡|泡麵|粥|宵夜|零食|點心|食品|口味/i)) {
    return apply({
      pain: "半夜餓到懶得煮？",
      benefit: "熱水沖泡更省事",
      proof: "多種口味不怕膩",
      cta: "先看口味再下手",
      shortTitle: "半夜餓到懶得煮？熱水沖泡快速解決",
      shortDescription: "追劇到一半、加班回家肚子餓，熱水沖泡就能吃，多種口味囤著更安心。",
    });
  }

  return base;
}



// RXV V120：痛點強化版
// 目標：把「不夠舒服 / 不夠清新 / 還好」這類弱痛點，升級成更容易停留與點擊的生活痛點。
// 注意：保健、牙膏、洗髮、護膚仍維持安全降級，不做治療、保證、醫療或誇大功效承諾。
function rxvV120MakePost(obj: any, fallbackKeywords = "好物推薦,生活用品,實用商品") {
  const keywords = obj.keywords || fallbackKeywords;
  const hashtagKeywords = obj.hashtagKeywords || String(keywords)
    .split(",")
    .map((x: string) => `#${x.trim()}`)
    .filter(Boolean)
    .join(" ");
  const shortTitle = obj.shortTitle || `${obj.pain}${obj.benefit}`;
  const shortDescription = obj.shortDescription || `${String(obj.pain || "").replace(/[？?!！]/g, "，")}${obj.proof || obj.benefit || "先看細節再決定"}。`;
  return {
    ...obj,
    keywords,
    hashtagKeywords,
    titleWithKeywords: `${shortTitle}\n\n${keywords}`,
    fullPost: `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]\n\n${hashtagKeywords}`,
  };
}

function rxvV120PainBoost(result: any, title: string, content: string) {
  const source = `${title} ${content}`;
  const base = { ...result };
  const keywords = base.keywords || "好物推薦,生活用品,實用商品";
  const keepSource = base.source || "model";
  const apply = (patch: any) => rxvV120MakePost({ ...base, ...patch, source: keepSource }, keywords);

  if (/卡磚|卡牌|寶可夢|PTCG|保護殼|收藏/i.test(source)) {
    return apply({
      pain: "卡片刮到會崩潰？",
      benefit: "收藏防護更安心",
      proof: "抗UV磁吸好收納",
      cta: "先看規格再決定",
      shortTitle: "卡片刮到會崩潰？收藏防護先準備",
      shortDescription: "珍藏卡最怕刮傷、泛黃或收納混亂，先看抗UV與磁吸規格，收藏更安心。",
    });
  }

  if (/B群|維他命|營養|保健|克補|鐵|鋅/i.test(source)) {
    return apply({
      pain: "累到像沒睡？",
      benefit: "補給選擇更清楚",
      proof: "先看成分與規格",
      cta: "先看成分再決定",
      shortTitle: "累到像沒睡？日常補給先看成分",
      shortDescription: "上班忙、作息亂時容易忽略日常補給，先看成分與規格，再依需求選擇。",
    });
  }

  if (/牙膏|好來|Darlie|口腔|護齦|竹炭|小蘇打/i.test(source)) {
    return apply({
      pain: "講話怕有味道？",
      benefit: "日常清潔更清爽",
      proof: "多款口味可選擇",
      cta: "先看口味再決定",
      shortTitle: "講話怕有味道？日常清潔從牙膏開始",
      shortDescription: "早上出門、約會或開會前，口氣清新很重要，多款牙膏口味可選。",
    });
  }

  if (/香水洗髮|小蒼蘭|鼠尾草|杏桃花|香氛洗髮/i.test(source)) {
    return apply({
      pain: "洗完香味很快沒？",
      benefit: "香氣選擇更有感",
      proof: "多款香味可選擇",
      cta: "先看香味再決定",
      shortTitle: "洗完香味很快沒？換款香氛洗髮精",
      shortDescription: "下班回家洗頭，想要更有香氣儀式感，多款香味可選，先看喜好再決定。",
    });
  }

  if (/洗髮|植萃|弱酸|低敏|無添加|頭皮|髮/i.test(source)) {
    return apply({
      pain: "洗完很快又悶？",
      benefit: "清爽選擇更安心",
      proof: "多款香味可選擇",
      cta: "先看香味再決定",
      shortTitle: "洗完很快又悶？先看清爽洗髮選擇",
      shortDescription: "下班回家洗頭，想要更清爽舒服的感覺，可依髮質與香味喜好挑選。",
    });
  }

  if (/沐浴|身體清潔|Biore/i.test(source)) {
    return apply({
      pain: "洗完乾到很煩？",
      benefit: "香氣清爽更舒服",
      proof: "補充包更好囤",
      cta: "先看香味再決定",
      shortTitle: "洗完乾到很煩？日常沐浴先看香味",
      shortDescription: "下班回家洗澡，最怕洗完不夠舒服，多款香味與補充包可選。",
    });
  }

  if (/凡士林|護唇|修護凝膠|護膚|保濕|乳液/i.test(source)) {
    return apply({
      pain: "乾到臨時找不到？",
      benefit: "日常保養更順手",
      proof: "家裡外出都好放",
      cta: "先看規格再決定",
      shortTitle: "乾到臨時找不到？日常保養先備著",
      shortDescription: "嘴唇、手肘或腳跟乾的時候，最怕臨時找不到，家裡常備更省心。",
    });
  }

  if (/湯泡飯|泡飯|沖泡|泡麵|粥|宵夜|零食|點心|食品|口味/i.test(source)) {
    return apply({
      pain: "半夜餓到翻？",
      benefit: "熱水沖泡更省事",
      proof: "多種口味不怕膩",
      cta: "先看口味再下手",
      shortTitle: "半夜餓到翻？熱水沖泡快速解決",
      shortDescription: "追劇到一半、加班回家肚子餓，熱水沖泡就能吃，多種口味好囤。",
    });
  }

  return base;
}



// RXV V126：爆單痛點選品文案強化版
// 只處理 AI 文案結果，不碰三張圖、旁白生成、字幕渲染、BGM、FFmpeg、上傳與既有輸出流程。
// 目的：把容易變現的生活消耗品/家用品/食品，改成「情境痛點 + 囤貨/比較/立即點擊理由」。
function rxvV126MakePost(obj: any, fallbackKeywords = "好物推薦,生活用品,實用商品") {
  const keywords = obj.keywords || fallbackKeywords;
  const hashtagKeywords = obj.hashtagKeywords || String(keywords)
    .split(",")
    .map((x: string) => `#${x.trim()}`)
    .filter(Boolean)
    .join(" ");
  const shortTitle = obj.shortTitle || `${obj.pain}${obj.benefit}`;
  const shortDescription = obj.shortDescription ||
    `${String(obj.pain || "").replace(/[？?!！]/g, "，")}${obj.proof || obj.benefit || "先看細節再決定"}。`;

  return {
    ...obj,
    keywords,
    hashtagKeywords,
    titleWithKeywords: `${shortTitle}\n\n${keywords}`,
    fullPost: `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]\n\n${hashtagKeywords}`,
  };
}

function rxvV126Apply(result: any, patch: any, fallbackKeywords = "好物推薦,生活用品,實用商品") {
  const base = { ...result };
  return rxvV126MakePost({
    ...base,
    ...patch,
    source: base.source || "model",
  }, base.keywords || fallbackKeywords);
}

function rxvV126PainCommerceBoost(result: any, title: string, content: string) {
  const source = `${title} ${content}`;
  const base = { ...result };
  const keywords = base.keywords || "好物推薦,生活用品,實用商品";

  if (/衛生紙|面紙|抽取式|擦手紙|廚房紙巾|濕紙巾|柔濕巾|濕巾/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "家裡快沒紙？",
      benefit: "趁優惠先囤更安心",
      proof: "每天都用消耗超快",
      cta: "趁現在看價格",
      shortTitle: "家裡快沒紙？趁優惠先囤一波",
      shortDescription: "家裡人多衛生紙、濕紙巾真的消耗超快，要用時才發現沒了最崩潰，趁有優惠先看價格。",
      keywords: /濕|巾/i.test(source)
        ? "濕紙巾,柔濕巾,家庭濕紙巾,大包濕紙巾,嬰兒濕紙巾,清潔濕巾,居家囤貨"
        : "衛生紙,抽取式衛生紙,家庭號衛生紙,厚韌衛生紙,面紙,生活囤貨,家用衛生紙",
    }, keywords);
  }

  if (/口罩|醫療口罩|平面口罩|立體口罩|不織布口罩|莫蘭迪/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "口罩悶又勒？",
      benefit: "服貼舒適更好戴",
      proof: "通勤上班都會用到",
      cta: "先看規格再買",
      shortTitle: "口罩悶又勒？日常通勤先備著",
      shortDescription: "每天通勤、上班或出門都可能用到口罩，最怕悶、勒或臨時找不到，先看規格與顏色再決定。",
      keywords: "口罩,醫療口罩,平面口罩,立體口罩,不織布口罩,莫蘭迪口罩,通勤口罩,日常口罩",
    }, keywords);
  }

  if (/洗衣精|洗衣膠囊|洗衣粉|抗菌洗衣|補充包|白蘭|Ariel|奈米樂/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "衣服悶臭很煩？",
      benefit: "洗後清爽更省心",
      proof: "補充包家裡好囤",
      cta: "趁現在看價格",
      shortTitle: "衣服悶臭很煩？洗衣精先囤起來",
      shortDescription: "衣服洗完還有悶味真的很煩，家裡洗衣精又消耗很快，補充包趁優惠先囤比較安心。",
      keywords: "洗衣精,抗菌洗衣精,洗衣精補充包,白蘭洗衣精,Ariel洗衣精,洗衣用品,家庭清潔",
    }, keywords);
  }

  if (/保久乳|牛奶|鮮乳|乳飲|克寧|義美.*乳|KLIM|奶粉/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "早餐沒牛奶？",
      benefit: "家裡常備更方便",
      proof: "早餐點心都能用",
      cta: "先看容量價格",
      shortTitle: "早餐沒牛奶？家裡常備更安心",
      shortDescription: "早上趕出門才發現沒牛奶最麻煩，保久乳或奶粉家裡備著，早餐、點心、咖啡都能用。",
      keywords: "保久乳,牛奶,奶粉,早餐牛奶,義美保久乳,克寧奶粉,家庭囤貨,早餐飲品",
    }, keywords);
  }

  if (/收納盒|收納箱|整理箱|掛勾|置物架|衣架|晾衣架|垃圾袋|購物袋|分類盒/i.test(source)) {
    if (/垃圾袋|廚餘袋|垃圾/i.test(source)) {
      return rxvV126Apply(base, {
        pain: "垃圾袋破滴漏？",
        benefit: "加厚耐裝更安心",
        proof: "廚餘打包少崩潰",
        cta: "先看尺寸再買",
        shortTitle: "垃圾袋破滴漏？加厚款先備著",
        shortDescription: "倒垃圾最怕破掉滴漏，廚餘味道又難清。先看尺寸與厚度，家裡常備更省心。",
        keywords: "垃圾袋,廚餘袋,加厚垃圾袋,不漏水垃圾袋,大容量垃圾袋,家用垃圾袋,清潔用品",
      }, keywords);
    }

    return rxvV126Apply(base, {
      pain: "東西亂到崩潰？",
      benefit: "分類收納更順手",
      proof: "租屋小空間也好用",
      cta: "先看尺寸再買",
      shortTitle: "東西亂到崩潰？收納先救空間",
      shortDescription: "房間、廚房或衣櫃一亂就很煩，先看尺寸與收納方式，小空間也能整理得更順手。",
      keywords: "收納盒,收納箱,收納整理,家用收納,租屋收納,衣櫃收納,廚房收納,省空間",
    }, keywords);
  }

  if (/除濕|除湿|清淨機|空氣清淨|濾芯|防霉|除臭|乾燥劑|濕氣/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "房間悶濕很煩？",
      benefit: "空氣乾爽更舒服",
      proof: "潮濕季節更需要",
      cta: "先看規格評價",
      shortTitle: "房間悶濕很煩？除濕清淨先準備",
      shortDescription: "台灣潮濕時房間悶、衣櫃有味道最煩，先看除濕清淨規格與評價，適合再下手。",
      keywords: "除濕機,除濕器,空氣清淨機,除濕清淨,防霉除濕,除臭,居家除濕,潮濕對策",
    }, keywords);
  }

  if (/防曬外套|抗UV|UPF|冰絲|雨衣|機車|通勤|外套|風衣|防曬衣/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "騎車曬到崩潰？",
      benefit: "通勤遮陽更省心",
      proof: "外出防曬好搭配",
      cta: "先看尺寸顏色",
      shortTitle: "騎車曬到崩潰？通勤防曬先準備",
      shortDescription: "夏天通勤最怕曬、悶又狼狽，防曬外套先看尺寸、顏色與材質，外出穿搭更省心。",
      keywords: "防曬外套,抗UV外套,UPF外套,冰絲外套,機車防曬,通勤外套,夏天外套,防曬衣",
    }, keywords);
  }

  if (/貓抓板|貓窩|貓砂|寵物|毛孩|貓咪|狗狗/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "沙發被抓心痛？",
      benefit: "毛孩有地方放電",
      proof: "家裡少一點崩潰",
      cta: "先看尺寸評價",
      shortTitle: "沙發被抓心痛？貓抓板先準備",
      shortDescription: "貓咪抓沙發真的會心痛，先準備能抓、能磨爪的用品，家裡少一點崩潰。",
      keywords: "貓抓板,貓用品,貓咪玩具,寵物用品,磨爪板,貓窩,貓砂,毛孩用品",
    }, keywords);
  }

  if (/泡麵|湯泡飯|泡飯|沖泡|粥|即食|宵夜|拉麵/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "半夜餓到翻？",
      benefit: "熱水沖泡更省事",
      proof: "加班追劇都好囤",
      cta: "先看口味價格",
      shortTitle: "半夜餓到翻？熱水沖泡先囤",
      shortDescription: "追劇到一半或加班回家肚子餓，最怕家裡沒東西吃。沖泡食品先囤，臨時吃很省事。",
      keywords: "泡麵,湯泡飯,沖泡食品,宵夜,追劇零食,即食食品,懶人料理,家庭囤貨",
    }, keywords);
  }

  if (/零食|餅乾|爆米花|威化|夾心酥|洋芋片|點心|下午茶|糖果|巧克力/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "追劇零食吃光？",
      benefit: "先囤幾包不尷尬",
      proof: "朋友來也比較夠",
      cta: "先看口味價格",
      shortTitle: "追劇零食吃光？先囤幾包不尷尬",
      shortDescription: "半夜追劇、辦公室下午茶或朋友突然來，最怕零食不夠分。先看口味與價格，喜歡再囤。",
      keywords: "零食,餅乾,追劇零食,辦公室零食,下午茶點心,大包裝零食,聚會零食,威化餅乾",
    }, keywords);
  }

  if (/氣炸鍋|電鍋|小家電|烤箱|料理鍋|快煮鍋|電熱鍋/i.test(source)) {
    return rxvV126Apply(base, {
      pain: "下班懶得開火？",
      benefit: "快速料理少麻煩",
      proof: "租屋小家庭都能用",
      cta: "先看規格評價",
      shortTitle: "下班懶得開火？小家電省時料理",
      shortDescription: "下班回家不想煮太久，小家電先看容量、清洗方式與評價，適合再下手比較不踩雷。",
      keywords: "氣炸鍋,小家電,懶人料理,快速料理,租屋家電,廚房家電,料理鍋,家用電器",
    }, keywords);
  }

  return base;
}


// RXV V142：多類別商品文案分類路由版
// 只處理 AI 文案分類與防呆，不碰三張圖、旁白、字幕、BGM、FFmpeg、上傳與既有影片流程。
// 目的：先判斷商品類別，再套對應痛點模板，避免手機架/定位器/拖鞋/包包被套成防曬外套或收納文案。
function rxvV142Source(title: string, content: string) {
  return `${title || ""} ${content || ""}`;
}

function rxvV142Has(source: string, words: RegExp) {
  return words.test(source || "");
}

function rxvV142Apply(base: any, patch: any, fallbackKeywords = "好物推薦,生活用品,實用商品") {
  return rxvV126MakePost({
    ...base,
    ...patch,
    source: "category_v142",
  }, patch.keywords || base?.keywords || fallbackKeywords);
}

function rxvV142CategoryRouter(result: any, title: string, content: string) {
  const source = rxvV142Source(title, content);
  const base = { ...result };

  // 1. 機車/車用手機架：必須排在防曬外套之前，避免「機車」被誤判成防曬通勤用品。
  if (rxvV142Has(source, /手機架|手機支架|機車架|車用支架|摩托車支架|導航支架|外送支架|八爪|減震|防震支架/i)) {
    return rxvV142Apply(base, {
      pain: "騎車手機一直晃？",
      benefit: "固定更穩看導航",
      proof: "通勤外送更安心",
      cta: "先看規格評價",
      shortTitle: "騎車手機一直晃？支架先穩住",
      shortDescription: "騎車看導航最怕手機晃、滑落或角度不好看，先看固定方式、減震設計與評價再決定。",
      keywords: "機車手機架,手機支架,摩托車手機架,導航支架,外送手機架,防震手機架,車用手機架,八爪手機架",
    });
  }

  // 2. 防丟/定位器：不可套寵物玩具、防曬外套或收納文案。
  if (rxvV142Has(source, /MiTag|AirTag|定位器|防丟器|追蹤器|尋物器|藍牙定位|行李定位|鑰匙定位|寵物定位/i)) {
    return rxvV142Apply(base, {
      pain: "東西老是找不到？",
      benefit: "防丟追蹤更安心",
      proof: "鑰匙包包都能掛",
      cta: "先看支援規格",
      shortTitle: "東西老是找不到？定位器先掛上",
      shortDescription: "鑰匙、包包、行李或寵物外出最怕遺失，先看支援規格、距離與評價再決定。",
      keywords: "定位器,防丟器,藍牙定位器,鑰匙防丟,行李定位,寵物定位,尋物器,MiTag",
    });
  }

  // 3. 拖鞋/涼鞋：不可套衣架、收納或掛勾文案。
  if (rxvV142Has(source, /拖鞋|涼鞋|室內鞋|浴室拖|踩屎感|EVA拖|厚底拖|防滑拖/i)) {
    return rxvV142Apply(base, {
      pain: "回家腳底好痠？",
      benefit: "厚底柔軟更放鬆",
      proof: "浴室陽台都能穿",
      cta: "先看尺寸顏色",
      shortTitle: "回家腳底好痠？厚底拖鞋先換",
      shortDescription: "下班回家、浴室或陽台走動，最怕鞋底硬又滑，先看尺寸、防滑與材質再決定。",
      keywords: "踩屎感拖鞋,厚底拖鞋,防滑拖鞋,居家拖鞋,浴室拖鞋,EVA拖鞋,室內拖鞋,涼拖鞋",
    });
  }

  // 4. 包包/袋款：不可套手機殼、衣架或一般收納文案。
  if (rxvV142Has(source, /KANGOL|包包|斜背包|肩背包|後背包|手提包|托特包|側背包|腰包|旅行包|通勤包|購物袋|環保袋/i)) {
    return rxvV142Apply(base, {
      pain: "出門東西裝不下？",
      benefit: "容量好搭更俐落",
      proof: "通勤逛街都好背",
      cta: "先看尺寸顏色",
      shortTitle: "出門東西裝不下？包包容量先看",
      shortDescription: "通勤、逛街或出門最怕東西塞不下又不好搭，先看尺寸、背法與顏色再決定。",
      keywords: "包包,斜背包,肩背包,通勤包,後背包,手提包,托特包,KANGOL包包,出門包",
    });
  }

  // 5. 服飾/防曬/外套：只在明確是衣物時才套用。
  if (rxvV142Has(source, /防曬外套|抗UV外套|防曬衣|冰絲外套|UPF外套|風衣|雨衣|夾克|外套|上衣|褲子|短褲|洋裝|裙子|帽子/i)) {
    return rxvV142Apply(base, {
      pain: "出門穿搭很煩？",
      benefit: "遮陽好搭更省心",
      proof: "通勤外出都能穿",
      cta: "先看尺寸顏色",
      shortTitle: "出門穿搭很煩？尺寸顏色先看",
      shortDescription: "通勤或外出最怕悶、曬又不好搭，先看尺寸、材質與顏色，選對比較不踩雷。",
      keywords: "防曬外套,抗UV外套,通勤外套,冰絲外套,風衣,雨衣,外出穿搭,夏天外套",
    });
  }

  // 6. 耳機/音訊 3C。
  if (rxvV142Has(source, /耳機|藍牙耳機|無線耳機|降噪|ANC|電競耳機|入耳式|耳掛式|AirPods/i)) {
    return rxvV142Apply(base, {
      pain: "通勤聽歌一直斷？",
      benefit: "續航音質先看清楚",
      proof: "上班運動都會用",
      cta: "先看規格評價",
      shortTitle: "通勤聽歌一直斷？耳機規格先看",
      shortDescription: "通勤、運動或開會最怕斷線、沒電或戴不住，先看續航、連線與評價再決定。",
      keywords: "藍牙耳機,無線耳機,降噪耳機,入耳式耳機,運動耳機,電競耳機,通勤耳機,耳機推薦",
    });
  }

  // 7. 充電/線材/手機 3C 配件。
  if (rxvV142Has(source, /充電器|快充|行動電源|傳輸線|充電線|Type-C|Lightning|MagSafe|手機殼|保護貼|保護殼/i)) {
    return rxvV142Apply(base, {
      pain: "手機快沒電很慌？",
      benefit: "充電收納更省事",
      proof: "通勤外出都會用",
      cta: "先看規格相容",
      shortTitle: "手機快沒電很慌？配件先備好",
      shortDescription: "出門手機快沒電、線材找不到最煩，先看規格、相容型號與評價再下手。",
      keywords: "手機配件,快充充電器,行動電源,充電線,Type-C充電線,手機殼,保護貼,MagSafe",
    });
  }

  // 8. 枕頭/寢具。
  if (rxvV142Has(source, /枕頭|記憶枕|乳膠枕|棉被|涼被|床墊|床包|枕套|寢具/i)) {
    return rxvV142Apply(base, {
      pain: "睡醒脖子很痠？",
      benefit: "支撐高度先選對",
      proof: "睡覺翻身更舒服",
      cta: "先看高度材質",
      shortTitle: "睡醒脖子很痠？枕頭高度先看",
      shortDescription: "睡醒脖子痠、翻來翻去睡不好，先看高度、支撐與材質，選對比較不踩雷。",
      keywords: "枕頭,記憶枕,乳膠枕,護頸枕,寢具,床墊,枕套,睡眠用品",
    });
  }

  // 9. 美妝/假睫毛/彩妝。
  if (rxvV142Has(source, /假睫毛|睫毛|眼線|眉筆|粉底|口紅|唇膏|腮紅|眼影|彩妝|美妝/i)) {
    return rxvV142Apply(base, {
      pain: "趕出門妝很難搞？",
      benefit: "妝感細節更俐落",
      proof: "新手先看款式",
      cta: "先看款式評價",
      shortTitle: "趕出門妝很難搞？款式先選對",
      shortDescription: "趕出門最怕眼妝、底妝不順手，先看款式、色號與評價，選對比較不踩雷。",
      keywords: "假睫毛,睫毛,眼線筆,眉筆,彩妝,美妝,口紅,粉底,新手彩妝",
    });
  }

  // 10. 水壺/杯子/保溫杯。
  if (rxvV142Has(source, /水壺|保溫杯|吸管杯|咖啡杯|隨行杯|杯子|馬克杯/i)) {
    return rxvV142Apply(base, {
      pain: "出門水杯又漏？",
      benefit: "容量保溫先看清楚",
      proof: "通勤上班都好帶",
      cta: "先看容量規格",
      shortTitle: "出門水杯又漏？容量規格先看",
      shortDescription: "上班、通勤或出門最怕水杯漏、容量不夠，先看容量、保溫與清洗方式再決定。",
      keywords: "水壺,保溫杯,隨行杯,吸管杯,咖啡杯,通勤水杯,大容量水壺,不漏水杯",
    });
  }

  return base;
}

function rxvV142CrossCategoryGuard(result: any, title: string, content: string) {
  const source = rxvV142Source(title, content);
  const text = [
    result?.pain,
    result?.benefit,
    result?.proof,
    result?.shortTitle,
    result?.shortDescription,
    result?.keywords,
  ].join(" ");

  // 手機架、定位器、拖鞋、包包若被前面模板誤套成防曬外套或衣架，強制重走 V142。
  const clearlyNeedsV142 =
    rxvV142Has(source, /手機架|手機支架|定位器|防丟器|MiTag|AirTag|拖鞋|踩屎感|KANGOL|包包|斜背包|肩背包/i);
  const wrongCategoryText =
    /防曬外套|抗UV外套|冰絲外套|衣服一直掉|曬衣|衣架|掛勾|收納盒|收納箱/i.test(text);

  if (clearlyNeedsV142 && wrongCategoryText) {
    return rxvV142CategoryRouter(result, title, content);
  }

  return result;
}



function normalizeResult(parsed: any, title: string, content: string, affiliateUrl = "[affiliateUrl]") {
  const lang = detectLanguage(`${title} ${content}`);
  const fallback = buildBetterFallback(title, content, lang);

  const v70CategoryCopy = rxvV70CategoryCopy(title, content, affiliateUrl);


  let pain = clampText(
    parsed?.pain || fallback.pain,
    lang === "zh-TW" ? 12 : 40,
  );
  let benefit = clampText(
    parsed?.benefit || fallback.benefit,
    lang === "zh-TW" ? 12 : 40,
  );
  let proof = clampText(
    parsed?.proof || fallback.proof,
    lang === "zh-TW" ? 12 : 40,
  );
  let cta = clampText(parsed?.cta || fallback.cta, lang === "zh-TW" ? 12 : 40);
  let voice = cleanText(parsed?.voice || fallback.voice) || fallback.voice;
  let badges = normalizeBadges(parsed?.badges, lang);

  if (lang === "zh-TW") {
    pain = normalizeZhTw(pain);
    benefit = normalizeZhTw(benefit);
    proof = normalizeZhTw(proof);
    cta = normalizeZhTw(cta);
    voice = normalizeZhTw(voice);
    badges = badges.map((b) => normalizeZhTw(b));
    const joined = `${pain} ${benefit} ${proof} ${cta} ${voice}`;
    if (englishHeavy(joined)) {
      return {
        ...buildBetterFallback(title, content, lang),
        lang,
        source: "fallback_english_rejected",
      };
    }
  }

  // 新增欄位處理
  let shortTitle = clampText(
    parsed?.shortTitle || fallback.shortTitle || `${pain}？${benefit}`,
    20,
  );
  let keywords = normalizeKeywordString(
    parsed?.keywords || fallback.keywords || "商品,好物,推薦",
    title,
    content,
    lang,
  );
  let titleWithKeywords =
    parsed?.titleWithKeywords || `${shortTitle}\n\n${keywords}`;
  let shortDescription = cleanText(
    parsed?.shortDescription ||
      fallback.shortDescription ||
      `${shortTitle}，${proof}，立即查看！`,
  );
  let fullPost =
    parsed?.fullPost ||
    `${shortTitle}\n\n${shortDescription}\n\n[affiliateUrl]`;

  if (lang === "zh-TW") {
    shortTitle = normalizeZhTw(shortTitle);
    keywords = normalizeZhTw(keywords);
    titleWithKeywords = normalizeZhTw(titleWithKeywords);
    shortDescription = normalizeZhTw(shortDescription);
    fullPost = normalizeZhTw(fullPost);
  }


  const v70Base = v70CategoryCopy
    ? {
        ...v70CategoryCopy,
        lang,
        source: parsed?.source || "model",
      }
    : null;

  const base = v70Base || rxvApplyStrongPain({
    pain,
    benefit,
    proof,
    cta,
    voice,
    badges,
    lang,
    source: "model",
    shortTitle,
    keywords,
    titleWithKeywords,
    shortDescription,
    fullPost,
  }, title, content);

  const idx = rxvHashIndex(title);
  const ctaSet = rxvPickCTA(idx);
  const safeBase = rxvSanitizeUniversalCopy(base, title, content);
  const boomBase = rxvV119BoostCopy(safeBase, title, content);
  const v120Base = rxvV120PainBoost(boomBase, title, content);
  const v126Base = rxvV126PainCommerceBoost(v120Base, title, content);
  const v142Base = rxvV142CrossCategoryGuard(rxvV142CategoryRouter(v126Base, title, content), title, content);

  return {
    ...v142Base,
    cta: v142Base.cta || ctaSet.line3,
  };
}


const RXV_CTA_POOL = [
  { line3: "先看評價再決定👉" },
  { line3: "先看規格再下手👉" },
  { line3: "趁現在看價格👉" },
];

function rxvHashIndex(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function rxvPickCTA(index: number) {
  return RXV_CTA_POOL[index % RXV_CTA_POOL.length];
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const title = (body?.title || "").toString().trim();
    const content = (body?.content || "").toString().trim();
    const affiliateUrl =
      (body?.affiliateUrl || "[affiliateUrl]").toString().trim() ||
      "[affiliateUrl]";
    const scriptMode = normalizeScriptMode(
      body?.scriptMode || body?.script_mode || Deno.env.get("SCRIPT_MODE") || "template",
    );

    if (!content && !title) {
      return new Response(
        JSON.stringify({ error: "Missing title or content" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const detectedLanguage = detectLanguage(`${title} ${content}`);

    if (scriptMode === "template") {
      const template = buildTemplateCopy(title, content, affiliateUrl, detectedLanguage);
      return new Response(
        JSON.stringify({
          ...template,
          fullPost: String(template.fullPost || "").replace(/\[affiliateUrl\]/g, affiliateUrl),
          lang: detectedLanguage,
          ai_success: false,
          source: "template",
          copy_source: template.source || "template",
          model_used: null,
          status: "template_success",
          scriptMode,
          debug_reason: "template_mode_no_gemini_call",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const activeModels = pickModelsByMode(scriptMode);
    const apiKey = pickGeminiKey();
    if (!apiKey) {
      const template = buildTemplateCopy(title, content, affiliateUrl, detectedLanguage);
      return new Response(JSON.stringify({
        ...template,
        lang: detectedLanguage,
        ai_success: false,
        source: "fallback_template",
        copy_source: template.source || "template",
        model_used: null,
        status: "fallback_template_success",
        scriptMode,
        debug_reason: "gemini_api_key_not_set",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const finalPrompt = buildPromptText(
      detectedLanguage,
      title,
      content,
      affiliateUrl,
    );

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: finalPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 32,
      },
    };

    let lastDebug: Record<string, unknown> = {
      debug_reason: "unknown",
      tried_models: activeModels,
      scriptMode,
    };

    


      for (const model of activeModels) {
      const r = await callGemini(model, apiKey, payload);

      if (r.status === 429) {
        lastDebug = {
          debug_reason: "rate_limited",
          model,
          http_status: r.status,
          response_text: summarizeGeminiErrorText(r.text),
        };
        console.log("Gemini rate limited", lastDebug);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }

      if (!r.res.ok) {
        lastDebug = {
          debug_reason: "model_http_error",
          model,
          http_status: r.status,
          response_text: summarizeGeminiErrorText(r.text),
        };
        console.log("Gemini API failed", lastDebug);
        continue;
      }

      const rawText = r.json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastDebug = {
          debug_reason: "empty_model_response",
          model,
          http_status: r.status,
          response_text: summarizeGeminiErrorText(r.text),
        };
        console.log("Gemini empty response", lastDebug);
        continue;
      }

      let parsed = safeParseJson(rawText);

      if (!parsed) {
        let secondPassText = String(rawText || "");

        secondPassText = secondPassText.split("```json").join("");
        secondPassText = secondPassText.split("```").join("");
        secondPassText = secondPassText.split("\r\n").join(" ");
        secondPassText = secondPassText.split("\n").join(" ");
        secondPassText = secondPassText.split("\r").join(" ");

        while (secondPassText.includes("  ")) {
          secondPassText = secondPassText.split("  ").join(" ");
        }

        secondPassText = secondPassText.trim();
        parsed = safeParseJson(secondPassText);
      }

      if (!parsed) {
        lastDebug = {
          debug_reason: "parse_failed",
          model,
          http_status: r.status,
          raw_preview: summarizeGeminiErrorText(rawText, 1200),
        };
        console.log("video-script parse failed", lastDebug);
        continue;
      }

      const normalized = normalizeResult(parsed, title, content, affiliateUrl);
      const status =
        normalized.source === "model" ? "success" : "fallback_success";

      return new Response(
        JSON.stringify({
          pain: normalized.pain,
          benefit: normalized.benefit,
          proof: normalized.proof,
          cta: normalized.cta,
          voice: normalized.voice,
          badges: normalized.badges,
          lang: normalized.lang,
          ai_success: true,
          source: "gemini",
          copy_source: normalized.source,
          model_used: model,
          status,
          scriptMode,
          shortTitle: normalized.shortTitle,
          keywords: normalized.keywords,
          titleWithKeywords: normalized.titleWithKeywords,
          shortDescription: normalized.shortDescription,
          fullPost: String(normalized.fullPost || "").replace(
            /\[affiliateUrl\]/g,
            affiliateUrl,
          ),
          debug_reason: "model_success",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const fallback = buildTemplateCopy(title, content, affiliateUrl, detectedLanguage);

    return new Response(
      JSON.stringify({
        ...fallback,
        fullPost: String(fallback.fullPost || "").replace(
          /\[affiliateUrl\]/g,
          affiliateUrl,
        ),
        lang: detectedLanguage,
        ai_success: false,
        source: "fallback_template",
        copy_source: fallback.source || "template",
        model_used: null,
        status: "fallback_template_success",
        scriptMode,
        ...lastDebug,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});



// RXV V126 marker: 爆單痛點選品文案強化版；只動文案引擎，不動抓圖/旁白/BGM/FFmpeg/上傳
