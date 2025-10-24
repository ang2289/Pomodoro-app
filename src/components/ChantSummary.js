import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
export default function ChantSummary({ wishId, refreshKey }) {
    const [total, setTotal] = useState(0);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                setError(null);
                // 總累計
                const { data: totalData, error: totalError } = await supabase
                    .from('chant_logs')
                    .select('chanted_count')
                    .eq('wish_id', wishId);
                if (totalError) {
                    console.error('讀取總計失敗:', totalError);
                    setError('讀取統計失敗：' + totalError.message);
                    return;
                }
                const totalCount = (totalData || []).reduce((sum, item) => sum + item.chanted_count, 0);
                setTotal(totalCount);
                // 排行榜
                const { data: topData, error: rankingError } = await supabase
                    .from('chant_logs')
                    .select('user_name, chanted_count')
                    .eq('wish_id', wishId);
                if (rankingError) {
                    console.error('讀取排行榜失敗:', rankingError);
                    setError('讀取排行榜失敗：' + rankingError.message);
                    return;
                }
                const byUser = (topData || []).reduce((acc, row) => {
                    acc[row.user_name] = (acc[row.user_name] || 0) + row.chanted_count;
                    return acc;
                }, {});
                const sorted = Object.entries(byUser)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);
                setRanking(sorted);
            }
            catch (err) {
                console.error('讀取統計失敗:', err);
                setError('讀取統計失敗，請重試');
            }
            finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [wishId, refreshKey]); // 添加 refreshKey 作為依賴
    if (loading) {
        return (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83D\uDCC8 \u96C6\u6C23\u7D71\u8A08" }), _jsxs("div", { className: "flex items-center justify-center py-4", children: [_jsxs("svg", { className: "animate-spin h-6 w-6 text-pink-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { className: "ml-3 text-gray-600", children: "\u8F09\u5165\u7D71\u8A08\u4E2D..." })] })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83D\uDCC8 \u96C6\u6C23\u7D71\u8A08" }), _jsxs("div", { className: "text-center py-4", children: [_jsx("div", { className: "text-red-500 text-lg mb-2", children: "\u274C" }), _jsx("p", { className: "text-red-600 text-sm", children: error })] })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83D\uDCC8 \u96C6\u6C23\u7D71\u8A08" }), _jsx("div", { className: "mb-6", children: _jsx("div", { className: "bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-pink-600 mb-2", children: total }), _jsx("div", { className: "text-gray-700 font-medium", children: "\uD83D\uDE4C \u7D2F\u8A08\u5FF5\u8AA6\u6B21\u6578" })] }) }) }), ranking.length > 0 ? (_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-800 mb-3", children: "\uD83C\uDFC6 \u96C6\u6C23\u6392\u884C\u699C" }), _jsx("div", { className: "space-y-2", children: ranking.map((r, idx) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg ${idx === 0
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                                : idx === 1
                                    ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200'
                                    : idx === 2
                                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                                        : 'bg-gray-50 border border-gray-100'}`, children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅' }), _jsx("span", { className: "font-semibold text-gray-800", children: r.name })] }), _jsxs("span", { className: "font-bold text-pink-600", children: [r.count, " \u904D"] })] }, r.name))) })] })) : (_jsxs("div", { className: "text-center py-6", children: [_jsx("div", { className: "text-4xl mb-3", children: "\uD83D\uDCCA" }), _jsx("p", { className: "text-gray-500", children: "\u9084\u6C92\u6709\u5FF5\u8AA6\u8A18\u9304" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "\u958B\u59CB\u5FF5\u8AA6\u5F8C\uFF0C\u6392\u884C\u699C\u6703\u986F\u793A\u5728\u9019\u88E1" })] })), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("p", { children: "\u2022 \u6392\u884C\u699C\u6309\u500B\u4EBA\u7D2F\u8A08\u5FF5\u8AA6\u6B21\u6578\u6392\u5E8F" }), _jsx("p", { children: "\u2022 \u6BCF\u6B21\u5FF5\u8AA6\u8A18\u9304\u90FD\u6703\u81EA\u52D5\u7D2F\u52A0\u5230\u500B\u4EBA\u7E3D\u6578" }), _jsx("p", { children: "\u2022 \u5927\u5BB6\u4E00\u8D77\u70BA\u9858\u671B\u96C6\u6C23\uFF0C\u8B93\u80FD\u91CF\u66F4\u5F37\u5927\uFF01" })] }) })] }));
}
