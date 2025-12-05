import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios"; // 引入 Axios

// API HOST 常數
const API_HOST = "shopee-e-commerce-data.p.rapidapi.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 提前檢查 API Key，如果沒有設置，則直接返回 500 錯誤
    const API_KEY = process.env.RAPIDAPI_KEY?.trim();
    if (!API_KEY) {
        console.error("❌ RAPIDAPI_KEY 尚未設定（請檢查 Vercel Secrets）");
        return res.status(500).json({ 
            error: "API key not configured", 
            detail: "Missing RAPIDAPI_KEY environment variable." 
        });
    }

    try {
        const url = req.query.url as string;

        if (!url) {
            return res.status(400).json({ error: "缺少 URL" });
        }

        // 解析 Shopee URL
        const cleanUrl = url.split("?")[0];
        const parts = cleanUrl.split("/product/")[1];

        if (!parts) {
            return res.status(400).json({
                error: "無法解析 Shopee URL，請確認格式是否為 /product/{shopid}/{itemid}"
            });
        }

        const [shopid, itemid] = parts.split("/");

        if (!shopid || !itemid) {
            return res.status(400).json({
                error: "無法解析 Shopee URL，請確認格式是否為 /product/{shopid}/{itemid}"
            });
        }

        // 自動偵測 site
        let site = "tw";
        const domain = cleanUrl.match(/shopee\.(\w+)/);
        if (domain && domain[1]) {
            site = domain[1];
        }

        // RapidAPI call - 使用 /shopee/item/get endpoint
        const apiUrl = `https://${API_HOST}/shopee/item/get`;

        console.log(`[Shopee Detail] Fetching Item: ${itemid}, Shop: ${shopid} from site: ${site}`);

        const response = await axios.get(apiUrl, {
            params: {
                site: site,
                itemid: itemid,
                shopid: shopid,
            },
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY,
            }
        });

        // Axios 只有在 2xx 範圍外才會拋出錯誤，因此這裡 response.status 總是 200
        const data = response.data;

        // 檢查 RapidAPI 回傳格式
        const itemBasic = data?.data?.item_basic || data?.data || data;

        if (!itemBasic || (!itemBasic.name && !itemBasic.title)) {
            // 如果 RapidAPI 返回 200 OK，但內容是錯誤提示（例如 "Invalid Key" 訊息在 data 裡）
             if (data?.error_code || data?.message) {
                 console.error('[RapidAPI Content Error]:', data.message || data.error_code);
                 return res.status(401).json({ // 假設內容錯誤多為授權或參數錯誤
                     error: "RapidAPI 返回錯誤內容或 Key 無效",
                     detail: data.message || JSON.stringify(data)
                 });
             }
             
            // 處理正常資料格式錯誤
            return res.status(500).json({
                error: "RapidAPI 回傳資料格式錯誤",
                detail: data
            });
        }

        // 成功回傳格式化後的商品資訊
        return res.status(200).json({
            ok: true,
            item: {
                name: itemBasic.name || itemBasic.title || "",
                price: itemBasic.price_min ? itemBasic.price_min / 100000 : (itemBasic.price ? itemBasic.price / 100000 : 0),
                images: itemBasic.images || (itemBasic.image ? [itemBasic.image] : []),
                sold: itemBasic.historical_sold || itemBasic.sold || 0,
                rating: itemBasic.item_rating?.rating_star || itemBasic.rating_star || itemBasic.rating || 0,
                // 加入 shopid 和 itemid 以便後續使用
                shopid: shopid, 
                itemid: itemid 
            }
        });

    } catch (err: any) {
        // 捕獲 Axios 拋出的非 2xx 狀態碼錯誤
        if (err.response) {
            const status = err.response.status;
            const errorData = err.response.data;
            console.error(`[RapidAPI Proxy] HTTP Error ${status}:`, errorData);
            
            // 將上游錯誤碼直接代理回去，避免所有錯誤都變成 500
            return res.status(status).json({
                error: `RapidAPI 請求失敗 (HTTP ${status})`,
                detail: errorData,
            });
        }

        // 捕獲其他網路或程式碼錯誤
        console.error('Shopee Detail API Fatal Error:', err.message || String(err));
        return res.status(500).json({
            error: "後端獲取商品資訊失敗 (Proxy Fatal)",
            detail: err.message || String(err)
        });
    }
}