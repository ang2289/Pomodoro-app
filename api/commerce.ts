// ============================================================
// 🔧 /api/commerce - 統一 Commerce 服務入口（Serverless Function）
// ============================================================
// 支援的 action：
//   - "shopeeSearch": Shopee 商品搜尋（對應原 /api/shopee-search）
//   - "shopeeParse": 解析 Shopee 商品頁面（對應原 /api/shopee-parse）
//   - "shopeeGenerateScript": 生成單一商品腳本（對應原 /api/shopee-generate-script）
//   - "shopeeBatch": 批次生成商品腳本（對應原 /api/shopee-batch-script）
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// 統一回傳格式
interface CommerceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 過濾敏感資訊的輔助函數
function sanitizeDataForLogging(data: any): any {
  try {
    if (!data || typeof data !== 'object') {
      return data
    }
    const sanitized = JSON.parse(JSON.stringify(data))
    function removeSensitiveFields(obj: any): void {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return
      }
      for (const key in obj) {
        const lowerKey = key.toLowerCase()
        if (
          lowerKey.includes('key') ||
          lowerKey.includes('api') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('password') ||
          lowerKey.includes('auth')
        ) {
          delete obj[key]
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitiveFields(obj[key])
        }
      }
    }
    removeSensitiveFields(sanitized)
    return sanitized
  } catch {
    return { error: 'Failed to sanitize data for logging' }
  }
}

// ============================================================
// Action: "shopeeSearch" - Shopee 商品搜尋
// ============================================================
async function handleShopeeSearchAction(body: any): Promise<any> {
  console.log('[commerce] action: shopeeSearch')
  
  const keyword = (body.keyword as string)?.trim() || "";
  if (!keyword) {
    console.warn("[commerce] ❌ 缺少 keyword");
    return { error: "keyword is required", items: [], total: 0 };
  }

  // 環境變數檢查
  const API_KEY = process.env.RAPIDAPI_KEY;
  const API_HOST = "shopee-e-commerce-data.p.rapidapi.com";
  const API_URL = "https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2";
  const MAX_PAGES = 2; // 目標抓取 2 頁
  const PAGE_SIZE = 50;
  
  if (!API_KEY) {
    console.error("❌ RAPIDAPI_KEY 尚未設定");
    return { error: "API key not configured", items: [], total: 0 };
  }

  console.log(`[commerce] Searching keyword = ${keyword}. Attempting to fetch ${MAX_PAGES * PAGE_SIZE} items...`);
  
  let allItems: any[] = [];
  
  try {
    // 自動翻頁邏輯
    for (let page = 1; page <= MAX_PAGES; page++) {
      console.log(`[commerce] Fetching page ${page}...`);
      
      const response = await axios.get(API_URL, {
        params: {
          site: "tw",
          keyword,
          page: page,
          pageSize: PAGE_SIZE,
          by: "relevancy",
          order: "desc",
        },
        headers: {
          "X-RapidAPI-Key": API_KEY.trim(),
          "X-RapidAPI-Host": API_HOST,
        },
      });

      const items = response?.data?.data?.items ?? [];
      
      if (items.length === 0) {
        console.log(`[commerce] Page ${page} returned 0 items. Stopping pagination.`);
        break;
      }

      allItems = allItems.concat(items);
      
      // 避免短時間內發送過多請求，稍微延遲 100ms
      if (page < MAX_PAGES) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[commerce] Total Shopee items collected = ${allItems.length}`);
    
    // 成功回傳結果（保持原格式）
    return { 
      items: allItems, 
      total: allItems.length 
    };
    
  } catch (err: any) {
    // 錯誤處理（保持原格式）
    const errorDetail = err?.response?.data || err?.message || "Unknown error";
    console.error(`[commerce] Shopee/RapidAPI failed: ${errorDetail}`);
    
    // 即使出錯，仍回傳目前收集到的所有商品（保持原格式）
    return { 
      error: "Shopee API proxy failed, check logs for detail.",
      items: allItems, 
      total: allItems.length 
    };
  }
}

// ============================================================
// Action: "shopeeParse" - 解析 Shopee 商品頁面
// ============================================================
async function handleShopeeParseAction(body: any): Promise<any> {
  console.log('[commerce] action: shopeeParse')
  
  const productUrl = body.url as string;
  if (!productUrl) {
    return {
      ok: false,
      title: "",
      image: "",
      error: "缺少商品網址參數 url",
    };
  }

  function pickFirstMatch(html: string, regex: RegExp): string | null {
    const m = html.match(regex);
    return m && m[1] ? m[1].trim() : null;
  }

  try {
    // 1) 先抓 HTML（一定要有 User-Agent）
    let html = "";
    try {
      const resp = await fetch(productUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      html = await resp.text();
    } catch (e: any) {
      return {
        ok: false,
        title: "",
        image: "",
        error: "抓取 Shopee HTML 失敗: " + e.message,
      };
    }

    if (!html || html.length < 1000) {
      return {
        ok: false,
        title: "",
        image: "",
        error: "取得到的 HTML 太短，可能被擋住",
        snippet: html.slice(0, 500),
      };
    }

    let title: string | null = null;
    let image: string | null = null;

    // 2) Strategy A：解析 __NEXT_DATA__ JSON（新版 Shopee）
    try {
      const jsonMatch = html.match(
        /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonRaw = jsonMatch[1];
        const data = JSON.parse(jsonRaw);

        const itemData =
          data?.props?.pageProps?.initialState?.item?.item ||
          data?.props?.pageProps?.initialState?.item?.basicItem ||
          null;

        if (itemData) {
          if (!title) {
            title =
              itemData.name ||
              itemData.item_title ||
              itemData.title ||
              null;
          }

          if (!image) {
            const imageHash =
              itemData.image ||
              (Array.isArray(itemData.images) && itemData.images[0]) ||
              itemData.image_url ||
              null;

            if (imageHash) {
              if (imageHash.startsWith("http")) {
                image = imageHash;
              } else {
                image = `https://cf.shopee.tw/file/${imageHash}`;
              }
            }
          }
        }
      }
    } catch {
      // JSON 解析失敗就略過，改用其他方式
    }

    // 3) Strategy B：meta og / twitter 標籤
    if (!title) {
      title =
        pickFirstMatch(
          html,
          /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
        ) ||
        pickFirstMatch(
          html,
          /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i
        );
    }

    if (!image) {
      image =
        pickFirstMatch(
          html,
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        ) ||
        pickFirstMatch(
          html,
          /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
        );
    }

    // 4) Strategy C：<title> 標籤，作為最後備援
    if (!title) {
      const rawTitle = pickFirstMatch(html, /<title>([^<]+)<\/title>/i);
      if (rawTitle) {
        title = rawTitle.replace(/\|\s*Shopee.*/i, "").trim();
      }
    }

    const ok = !!title && !!image;

    // 保持原回傳格式
    return {
      ok,
      title: title ?? "",
      image: image ?? "",
      debug: ok ? undefined : "PARSE_FAILED",
    };
  } catch (e: any) {
    // 保持原回傳格式
    return {
      ok: false,
      title: "",
      image: "",
      error: "後端解析程式出錯: " + e.message,
    };
  }
}

// ============================================================
// Action: "shopeeGenerateScript" - 生成單一商品腳本
// ============================================================
async function handleShopeeGenerateScriptAction(body: any): Promise<any> {
  console.log('[commerce] action: shopeeGenerateScript')
  
  const { title, price, highlights } = body;

  if (!title) {
    return {
      error: "缺少商品名稱",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error: "Gemini API 金鑰未設定",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 處理賣點（highlights）
    const highlightsText = Array.isArray(highlights) && highlights.length > 0
      ? highlights.filter((h: string) => h.trim()).join("、")
      : "未提供";

    const prompt = `
你是一位短影音腳本生成師，請根據以下資料生成 20 秒影片腳本 + 逐字稿（中文字幕）：

商品名稱：${title}
價格：${price || "未提供"}
商品賣點：${highlightsText}

請以「強烈吸睛的 TikTok / Reels 風格」輸出，重點強調商品賣點：

【最終必須回傳 JSON，格式如下，不要多字】
{
  "script": "三段式影片腳本，每段 1–2 句，強調商品賣點",
  "subtitles": ["字幕1", "字幕2", "字幕3", ...]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 嘗試解析 JSON
    let jsonData;
    try {
      jsonData = JSON.parse(text);
    } catch (e) {
      // 如果直接解析失敗，嘗試提取 JSON 部分
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        jsonData = JSON.parse(match[0]);
      } else {
        throw new Error("AI 回傳格式錯誤，無法解析 JSON");
      }
    }

    // 保持原回傳格式
    return {
      success: true,
      ...jsonData,
    };
  } catch (err: any) {
    console.error("[commerce] shopeeGenerateScript error:", err);
    // 保持原回傳格式
    return {
      error: "腳本生成失敗",
      detail: err.message,
    };
  }
}

// ============================================================
// Action: "shopeeBatch" - 批次生成商品腳本
// ============================================================
async function handleShopeeBatchAction(body: any): Promise<any> {
  console.log('[commerce] action: shopeeBatch')
  
  const { items } = body;

  if (!items || !Array.isArray(items)) {
    return {
      error: "需要 items: 商品陣列",
    };
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return {
      error: "OPENAI_API_KEY 未設定",
    };
  }

  try {
    const scripts = [];

    for (const item of items) {
      const prompt = `
請為以下商品產生「短影片腳本」：

商品名稱：${item.name}
價格：${item.price}
已售出：${item.sold}
評價：${item.rating}
商品網址：${item.url}

請以「繁體中文」輸出 JSON：

{
  "id": "商品ID",
  "title": "影片標題（5-10字）",
  "intro": "吸引人開場（3-4秒）",
  "points": ["亮點1","亮點2","亮點3"],
  "script": "20-40秒口語化短影片腳本",
  "cta": "導購CTA（例如：點連結查看優惠）",
  "image": "${item.image}",
  "affiliate_url": "請使用此同一網址：${item.url}",
  "duration": 30
}
請直接輸出 JSON，不要多餘說明。
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "{}";
      const json = JSON.parse(text);

      scripts.push(json);
    }

    // 保持原回傳格式：直接返回 scripts 陣列
    return scripts;
  } catch (err: any) {
    console.error("[commerce] shopeeBatch error:", err);
    // 保持原回傳格式
    return {
      error: "腳本產生發生錯誤",
      detail: String(err),
    };
  }
}

// ============================================================
// 主 Handler
// ============================================================
export default async function handler(req: any, res: any) {
  console.log('[commerce] handler entered')

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const body = req.body || {};
    const action = body.action;

    if (!action) {
      return res.status(200).json({
        success: false,
        error: 'Missing action parameter',
      });
    }

    console.log(`[commerce] action: ${action}`);

    let result: any;

    switch (action) {
      case 'shopeeSearch':
        result = await handleShopeeSearchAction(body);
        break;

      case 'shopeeParse':
        result = await handleShopeeParseAction(body);
        break;

      case 'shopeeGenerateScript':
        result = await handleShopeeGenerateScriptAction(body);
        break;

      case 'shopeeBatch':
        result = await handleShopeeBatchAction(body);
        break;

      default:
        result = {
          success: false,
          error: `Unknown action: ${action}`,
        };
        break;
    }

    // 所有 actions 都使用原格式回傳
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[commerce] handler error:', err);
    return res.status(200).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

