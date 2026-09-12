import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
// TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組
// 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
export default function ChantSupportRankingPage() {
    if (import.meta.env.VITE_ENABLE_CHANT !== 'true' && import.meta.env.NEXT_PUBLIC_ENABLE_CHANT !== 'true') {
        return null;
    }
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchSupportRanking = async () => {
            try {
                setLoading(true);
                setError(null);
                // 直接抓取所有支持資料，包含關聯到的願望標題（若有外鍵）
                const { data, error } = await supabase
                    .from('chant_wish_supports')
                    .select('chant_wish_id, chant_wishes(title)');
                if (error) {
                    setError('讀取支持排行榜失敗：' + error.message);
                    return;
                }
                const counter = new Map();
                data?.forEach((row) => {
                    const id = row.chant_wish_id;
                    const title = row.chant_wishes?.title || '未知活動';
                    const prev = counter.get(id);
                    if (prev) {
                        prev.count += 1;
                    }
                    else {
                        counter.set(id, { chant_wish_id: id, title, count: 1 });
                    }
                });
                const arr = Array.from(counter.values()).sort((a, b) => b.count - a.count);
                setRankings(arr);
            }
            catch (err) {
                console.error(err);
                setError('讀取支持排行榜失敗，請稍後再試');
            }
            finally {
                setLoading(false);
            }
        };
        fetchSupportRanking();
    }, []);
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsxs("main", { className: "flex-1 p-4 max-w-3xl mx-auto w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-2", children: "\uD83D\uDC96 \u6700\u591A\u4EBA\u652F\u6301\u7684\u96C6\u6C23\u6D3B\u52D5" }), _jsx("p", { className: "text-gray-600", children: "\u4F9D\u652F\u6301\u4EBA\u6B21\u6392\u5E8F" })] }), loading ? (_jsx("div", { className: "bg-white rounded-lg shadow p-6 text-center", children: "\u8F09\u5165\u4E2D..." })) : error ? (_jsx("div", { className: "bg-white rounded-lg shadow p-6 text-center text-red-600", children: error })) : rankings.length === 0 ? (_jsx("div", { className: "bg-white rounded-lg shadow p-6 text-center", children: "\u76EE\u524D\u6C92\u6709\u652F\u6301\u8CC7\u6599" })) : (_jsx("div", { className: "bg-white rounded-lg shadow divide-y", children: rankings.map((item, index) => (_jsxs("div", { className: "flex justify-between items-center px-4 py-3", children: [_jsxs("span", { className: "font-medium", children: ["\uD83C\uDFC5 ", index + 1, ". ", item.title] }), _jsxs("span", { className: "text-pink-600 font-bold", children: ["\uD83D\uDC96 ", item.count] })] }, item.chant_wish_id))) }))] }) }));
}
