import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import ChantWishCard from '../components/ChantWishCard';
import SearchForm from '../components/SearchForm';
import { loadChantList } from '../utils/chantStorage';
export default function ChantWishWallPage() {
    const [wishes, setWishes] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 分頁狀態
    const [page, setPage] = useState(1);
    const pageSize = 10;
    // 進階搜尋狀態
    const todayStr = new Date().toISOString().split('T')[0];
    // 狀態保留用於向下相容（目前未直接使用）
    const [_keyword, setKeyword] = useState('');
    const [_dateFrom, setDateFrom] = useState(todayStr);
    const [_dateTo, setDateTo] = useState(todayStr);
    const [_scripture, setScripture] = useState('');
    const [_sortBy, setSortBy] = useState('start_desc');
    // 舊版 applyFilters 已由 SearchForm 驅動的 onSearch 取代
    const navigate = useNavigate();
    useEffect(() => {
        const fetchWishes = async () => {
            try {
                setLoading(true);
                setError(null);
                // 載入所有資料，不使用分頁限制
                const { data, error, count } = await supabase
                    .from('chant_wishes')
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false });
                if (error) {
                    console.error('讀取失敗:', error);
                    setError('讀取集氣活動失敗：' + error.message);
                    return;
                }
                setWishes(data || []);
                setFiltered(data || []);
                window.__chant_wish_total__ = count || 0;
            }
            catch (err) {
                console.error('讀取失敗:', err);
                setError('讀取集氣活動失敗，請重試');
            }
            finally {
                setLoading(false);
            }
        };
        fetchWishes();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsx("main", { className: "flex-1 p-4 max-w-4xl mx-auto w-full", children: _jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin h-8 w-8 text-pink-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { className: "ml-3 text-gray-600", children: "\u8F09\u5165\u96C6\u6C23\u6D3B\u52D5\u4E2D..." })] }) }) }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsx("main", { className: "flex-1 p-4 max-w-4xl mx-auto w-full", children: _jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-500 text-lg mb-2", children: "\u274C" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors", children: "\u91CD\u65B0\u8F09\u5165" })] }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex flex-col", children: _jsxs("main", { className: "responsive-container flex-1", children: [_jsx("button", { onClick: () => navigate(-1), className: "mb-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded w-full sm:w-auto hover:bg-blue-600", children: "\u2190 \u8FD4\u56DE" }), _jsxs("div", { className: "text-center mb-4 sm:mb-6", children: [_jsx("h1", { className: "text-lg sm:text-xl font-bold text-gray-800 mb-2", children: "\uD83D\uDCE3 \u96C6\u6C23\u6D3B\u52D5\u7246" }), _jsx("p", { className: "text-sm sm:text-base text-gray-600", children: "\u5927\u5BB6\u4E00\u8D77\u70BA\u9858\u671B\u96C6\u6C23\u52A9\u5FF5" }), _jsxs("div", { className: "mt-4 sm:mt-6 space-y-2", children: [_jsx(Link, { to: "/chant-ranking", className: "inline-block w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 !text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base", style: { color: '#ffffff' }, children: "\uD83D\uDCC8 \u524D\u5F80\u6392\u884C\u699C" }), _jsx(Link, { to: "/chant-support-leaderboard", className: "inline-block w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 !text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base", style: { color: '#ffffff' }, children: "\uD83C\uDFC6 \u652F\u6301\u6392\u884C\u699C" })] })] }), _jsx(SearchForm, { scriptureOptions: (Array.from(new Set((loadChantList() || [])))), onSearch: (filters) => {
                        setKeyword(filters.keyword || '');
                        setDateFrom(filters.dateFrom || '');
                        setDateTo(filters.dateTo || '');
                        setScripture(filters.scripture || '');
                        setSortBy(filters.sortBy || 'start_desc');
                        setPage(1); // 搜尋時重置到第1頁
                        const kw = (filters.keyword || '').toLowerCase();
                        let result = [...wishes];
                        if (kw)
                            result = result.filter((w) => [w.title, w.for_person_name, w.created_by].some((f) => f?.toLowerCase().includes(kw)));
                        if (filters.dateFrom)
                            result = result.filter((w) => !w.start_date || new Date(w.start_date) >= new Date(filters.dateFrom));
                        if (filters.dateTo)
                            result = result.filter((w) => !w.end_date || new Date(w.end_date) <= new Date(filters.dateTo));
                        if (filters.scripture)
                            result = result.filter((w) => w.chant_text === filters.scripture);
                        result.sort((a, b) => compareBy(filters.sortBy || 'start_desc', a, b));
                        setFiltered(result);
                    }, onReset: () => {
                        setKeyword('');
                        setDateFrom('');
                        setDateTo('');
                        setScripture('');
                        setSortBy('start_desc');
                        setPage(1); // 重置時也重置到第1頁
                        setFiltered(wishes);
                    } }), wishes.length === 0 ? (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-4 sm:p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDE4F" }), _jsx("h3", { className: "text-lg sm:text-xl font-bold text-gray-800 mb-2", children: "\u96C6\u6C23\u6D3B\u52D5\u7246" }), _jsx("p", { className: "text-sm sm:text-base text-gray-600 mb-4", children: "\u76EE\u524D\u6C92\u6709\u4EFB\u4F55\u96C6\u6C23\u6D3B\u52D5\uFF0C\u5FEB\u4F86\u767C\u8D77\u4E00\u500B\u5427\uFF01" }), _jsx("button", { onClick: () => navigate('/chant-wish-create'), className: "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base", children: "\uD83D\uDD14 \u767C\u8D77\u96C6\u6C23\u6D3B\u52D5" })] }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-4 sm:p-6", children: [_jsx("h3", { className: "text-lg sm:text-xl font-bold text-gray-800 mb-2", children: "\uD83C\uDF1F \u96C6\u6C23\u6D3B\u52D5\u7246" }), _jsxs("p", { className: "text-gray-600 text-sm sm:text-base", children: ["\u5171 ", filtered.length, " \u7B46\u96C6\u6C23\u6D3B\u52D5"] })] }), filtered.slice((page - 1) * pageSize, page * pageSize).map((wish, index) => (_jsxs("div", { className: `rounded-xl shadow-md mb-6 border border-gray-200 p-4 sm:p-5 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`, children: [wish.image_url && (_jsx("div", { className: "mb-3", children: _jsx("div", { className: "rounded-md border border-gray-200 shadow overflow-hidden", children: _jsx("img", { src: wish.image_url, alt: "\u6D3B\u52D5\u5716\u7247", className: "w-full max-h-56 object-cover bg-white" }) }) })), _jsx(ChantWishCard, { wish: wish })] }, wish.id))), _jsxs("div", { className: "flex justify-between items-center mt-4", children: [_jsx("button", { className: "px-3 py-1 bg-gray-300 rounded disabled:opacity-50", disabled: page === 1, onClick: () => setPage((prev) => Math.max(prev - 1, 1)), children: "\u2B05 \u4E0A\u4E00\u9801" }), _jsxs("span", { children: ["\u76EE\u524D\u7B2C ", page, " \u9801\uFF0C\u5171 ", Math.ceil((filtered.length) / pageSize), " \u9801"] }), _jsx("button", { className: "px-3 py-1 bg-gray-300 rounded disabled:opacity-50", disabled: (page * pageSize) >= (filtered.length), onClick: () => setPage((prev) => prev + 1), children: "\u4E0B\u4E00\u9801 \u27A1" })] })] }))] }) }));
}
// 依照目前條件套用篩選與排序
function compareBy(sortBy, a, b) {
    const getTime = (d) => (d ? new Date(d).getTime() : 0);
    switch (sortBy) {
        case 'start_asc':
            return getTime(a.start_date) - getTime(b.start_date);
        case 'created_desc':
            return getTime(b.created_at) - getTime(a.created_at);
        case 'created_asc':
            return getTime(a.created_at) - getTime(b.created_at);
        case 'start_desc':
        default:
            return getTime(b.start_date) - getTime(a.start_date);
    }
}
