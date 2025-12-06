/**
 * @deprecated 此 API 已棄用，不再被使用
 * 新的 shopee-video 功能已改為本地輸入模式，不再依賴 RapidAPI
 * 請使用 /api/shopee-generate-script 和 /api/generate-video 替代
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";

// RapidAPI 端點配置
const API_URL = "https://shopee-e-commerce-data.p.rapidapi.com/shopee/search/items/v2";
const MAX_PAGES = 2; // 目標抓取 2 頁
const PAGE_SIZE = 50;

// 函式入口點：適應 Vercel Serverless Function
export default async (req: VercelRequest, res: VercelResponse) => {
    // 基礎驗證與配置檢查
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
    const keyword = (req.query.keyword as string)?.trim() || "";
    if (!keyword) {
        console.warn("[Shopee API] ❌ 缺少 keyword");
        return res.status(400).json({ error: "keyword is required", items: [], total: 0 });
    }

    // 環境變數檢查 (Vercel Secrets / .env)
    const API_KEY = process.env.RAPIDAPI_KEY;
    const API_HOST = "shopee-e-commerce-data.p.rapidapi.com";
    
    if (!API_KEY) {
        console.error("❌ RAPIDAPI_KEY 尚未設定");
        return res.status(500).json({ error: "API key not configured", items: [], total: 0 });
    }

    console.log(`[API] Searching keyword = ${keyword}. Attempting to fetch ${MAX_PAGES * PAGE_SIZE} items...`);
    
    let allItems: any[] = [];
    
    try {
        // 2. 自動翻頁邏輯
        for (let page = 1; page <= MAX_PAGES; page++) {
            console.log(`[API] Fetching page ${page}...`);
            
            const response = await axios.get(API_URL, {
                params: {
                    site: "tw",
                    keyword,
                    page: page, // 隨著循環遞增
                    pageSize: PAGE_SIZE,
                    by: "relevancy",
                    order: "desc",
                },
                headers: {
                    // 確保 API_KEY 在此傳輸前是乾淨的純文字
                    "X-RapidAPI-Key": API_KEY.trim(), // 再次確認 trim() 消除看不見的空格/換行
                    "X-RapidAPI-Host": API_HOST,
                },
            });

            const items = response?.data?.data?.items ?? [];
            
            if (items.length === 0) {
                console.log(`[API] Page ${page} returned 0 items. Stopping pagination.`);
                break; // 如果某一頁沒有數據，則停止翻頁
            }

            allItems = allItems.concat(items);
            
            // 避免短時間內發送過多請求，稍微延遲 100ms
            if (page < MAX_PAGES) {
                 await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`[API] Total Shopee items collected = ${allItems.length}`);
        
        // 3. 成功回傳結果
        return res.status(200).json({ 
            items: allItems, 
            total: allItems.length 
        });
        
    } catch (err: any) {
        // 4. 錯誤處理
        const errorDetail = err?.response?.data || err?.message || "Unknown error";
        console.error(`[API Fatal ERROR] Shopee/RapidAPI failed: ${errorDetail}`);
        
        // 即使出錯，仍回傳目前收集到的所有商品
        return res.status(200).json({ 
            error: "Shopee API proxy failed, check logs for detail.",
            items: allItems, 
            total: allItems.length 
        }); 
    }
};