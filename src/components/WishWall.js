import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export default function WishWall() {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchWishes = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('wishes')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) {
                console.error('讀取願望失敗:', error);
                setError('讀取願望失敗：' + error.message);
                return;
            }
            setWishes(data || []);
        }
        catch (err) {
            console.error('讀取願望失敗:', err);
            setError('讀取願望失敗，請重試');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchWishes();
    }, []);
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const period = hours >= 12 ? '下午' : '上午';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${year}/${month}/${day} ${period} ${displayHours}:${minutes}:${seconds}`;
    };
    if (loading) {
        return (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin h-8 w-8 text-pink-500", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { className: "ml-3 text-gray-600", children: "\u8F09\u5165\u9858\u671B\u4E2D..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-500 text-lg mb-2", children: "\u274C" }), _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx("button", { onClick: fetchWishes, className: "bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors", children: "\u91CD\u65B0\u8F09\u5165" })] }) }));
    }
    if (wishes.length === 0) {
        return (_jsx("div", { className: "bg-white rounded-lg shadow-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF1F" }), _jsx("h3", { className: "text-xl font-bold text-gray-800 mb-2", children: "\u9858\u671B\u7246" }), _jsx("p", { className: "text-gray-600", children: "\u76EE\u524D\u9084\u6C92\u6709\u9858\u671B\uFF0C\u5FEB\u4F86\u8A31\u4E00\u500B\u5427\uFF01" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83C\uDF1F \u9858\u671B\u7246" }), _jsxs("p", { className: "text-gray-600 text-sm", children: ["\u5171 ", wishes.length, " \u500B\u9858\u671B"] })] }), wishes.map((wish) => (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsx("div", { className: "font-bold text-lg text-gray-800", children: wish.user_name || '匿名' }), _jsx("div", { className: "text-sm text-gray-500", children: formatDateTime(wish.created_at) })] }), _jsx("div", { className: "text-gray-700 leading-relaxed", children: wish.content }), _jsx("div", { className: "mt-4 pt-3 border-t border-gray-100", children: _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx("span", { className: "mr-2", children: "\u2728" }), _jsxs("span", { children: ["\u9858\u671B\u7DE8\u865F: ", wish.id.slice(-8)] })] }) })] }, wish.id)))] }));
}
