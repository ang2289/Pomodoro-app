import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import WishCard from '../components/WishCard';
export default function WishWallPage() {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchWishes() {
            const { data, error } = await supabase
                .from('wishes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error)
                console.error('❌ 讀取願望失敗:', error);
            else
                setWishes(data || []);
            setLoading(false);
        }
        fetchWishes();
    }, []);
    return (_jsxs("div", { className: "responsive-container", children: [_jsx("h1", { className: "text-xl font-bold mb-4", children: "\u2728 \u96C6\u6C23\u7246" }), loading ? (_jsx("p", { children: "\u8F09\u5165\u4E2D..." })) : wishes.length === 0 ? (_jsx("p", { children: "\u76EE\u524D\u9084\u6C92\u6709\u9858\u671B\uFF0C\u5FEB\u4F86\u8A31\u4E00\u500B\u5427\uFF01" })) : (wishes.map((wish) => _jsx(WishCard, { wish: wish, showLightButton: true }, wish.id)))] }));
}
