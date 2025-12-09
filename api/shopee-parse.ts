// /api/shopee-parse.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";

function pickFirstMatch(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const productUrl = req.query.url as string;

    if (!productUrl) {
      return res.status(200).json({
        ok: false,
        title: "",
        image: "",
        error: "缺少商品網址參數 url",
      });
    }

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
      return res.status(200).json({
        ok: false,
        title: "",
        image: "",
        error: "抓取 Shopee HTML 失敗: " + e.message,
      });
    }

    if (!html || html.length < 1000) {
      // 順便回一點點 HTML 方便除錯
      return res.status(200).json({
        ok: false,
        title: "",
        image: "",
        error: "取得到的 HTML 太短，可能被擋住",
        snippet: html.slice(0, 500),
      });
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
              // 若已經是完整網址，就直接用；若是 hash，就補上 shopee 圖庫網址
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

    // 3) Strategy B：meta og / twitter 標籤（部份頁面仍有）
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
        // 把「| Shopee」這種尾巴切掉
        title = rawTitle.replace(/\|\s*Shopee.*/i, "").trim();
      }
    }

    const ok = !!title && !!image;

    return res.status(200).json({
      ok,
      title: title ?? "",
      image: image ?? "",
      // 若失敗就順便帶個 debug 訊息，前端可顯示在 console
      debug: ok ? undefined : "PARSE_FAILED",
    });
  } catch (e: any) {
    // 最外層的保險：絕不再回 500
    return res.status(200).json({
      ok: false,
      title: "",
      image: "",
      error: "後端解析程式出錯: " + e.message,
    });
  }
}
