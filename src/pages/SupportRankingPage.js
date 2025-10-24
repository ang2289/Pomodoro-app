import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
export default function SupportRankingPage() {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchUserSupportRanking = async () => {
        try {
            setLoading(true);
            setError(null);
            // 從 chant_wish_supports 表取得所有支持記錄
            const { data, error } = await supabase
                .from('chant_wish_supports')
                .select('*');
            if (error) {
                console.error('讀取支持記錄失敗:', error);
                setError('讀取支持記錄失敗：' + error.message);
                return;
            }
            // 按 user_id 分組統計支持次數
            const userSupportCounts = new Map();
            data?.forEach((record, index) => {
                // 暫時使用索引作為使用者識別（等 anon_id 欄位建立後再改回）
                const userId = `user_${index}`;
                const userName = '匿名使用者';
                if (userSupportCounts.has(userId)) {
                    userSupportCounts.get(userId).count += 1;
                }
                else {
                    userSupportCounts.set(userId, { user_name: userName, count: 1 });
                }
            });
            // 轉換為陣列並排序
            const rankingList = Array.from(userSupportCounts.entries())
                .map(([user_id, data]) => ({
                user_id,
                user_name: data.user_name,
                support_count: data.count
            }))
                .sort((a, b) => b.support_count - a.support_count)
                .slice(0, 100); // 取前100名
            setRankings(rankingList);
        }
        catch (err) {
            console.error('讀取支持排行榜失敗:', err);
            setError('讀取支持排行榜失敗，請稍後再試');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUserSupportRanking();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsx("main", { className: "flex-1 p-4 max-w-4xl mx-auto w-full", children: _jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin h-8 w-8 text-pink-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { className: "ml-3 text-gray-600", children: "\u8F09\u5165\u652F\u6301\u6392\u884C\u699C\u4E2D..." })] }) }) }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsx("main", { className: "flex-1 p-4 max-w-4xl mx-auto w-full", children: _jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-500 text-lg mb-2", children: "\u274C" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors", children: "\u91CD\u65B0\u8F09\u5165" })] }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsxs("main", { className: "flex-1 p-4 max-w-4xl mx-auto w-full", children: [_jsx("div", { className: "mb-4", children: _jsxs("button", { onClick: () => navigate('/chant'), className: "flex items-center text-gray-600 hover:text-gray-800 transition-colors", children: [_jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "\u8FD4\u56DE\u5538\u7D93\u9801"] }) }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-2", children: "\uD83D\uDC96 \u96C6\u6C23\u6D3B\u52D5\u652F\u6301\u6392\u884C\u699C" }), _jsx("p", { className: "text-gray-600", children: "\u6309\u4F7F\u7528\u8005\u652F\u6301\u6B21\u6578\u6392\u5E8F" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-4 mb-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-2", children: "\uD83D\uDCC5 \u7BE9\u9078\u689D\u4EF6" }), _jsx("p", { className: "text-gray-500 text-sm", children: "\u65E5\u671F\u7BE9\u9078\u529F\u80FD\u5C07\u65BC\u5F8C\u7E8C\u7248\u672C\u63D0\u4F9B" })] }), rankings.length === 0 ? (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDC96" }), _jsx("h3", { className: "text-lg font-bold text-gray-800 mb-2", children: "\u76EE\u524D\u5C1A\u7121\u652F\u6301\u7D00\u9304" }), _jsx("p", { className: "text-gray-600", children: "\u958B\u59CB\u652F\u6301\u96C6\u6C23\u6D3B\u52D5\u5F8C\uFF0C\u6392\u884C\u699C\u6703\u986F\u793A\u5728\u9019\u88E1" })] }) })) : (_jsx("div", { className: "bg-white rounded-lg shadow-lg", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-6", children: "\uD83C\uDFC6 \u652F\u6301\u6392\u884C\u699C\uFF08\u524D100\u540D\uFF09" }), _jsx("div", { className: "space-y-3", children: rankings.map((user, index) => (_jsxs("div", { className: `flex justify-between items-center px-4 py-3 rounded-lg border-l-4 ${index % 2 === 0
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-blue-100'}`, children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-2xl mr-3", children: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `🏅` }), _jsxs("div", { children: [_jsxs("span", { className: "font-bold text-gray-800", children: ["\u7B2C ", index + 1, " \u540D"] }), _jsx("div", { className: "text-sm text-gray-600", children: user.user_name || '匿名使用者' })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "text-xl font-bold text-pink-600", children: ["\u2764\uFE0F ", user.support_count, " \u6B21"] }) })] }, user.user_id))) })] }) }))] }) }));
}
