import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
export default function LikeButton({ wishId }) {
    const [count, setCount] = useState(0);
    const [liked, setLiked] = useState(false);
    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wishId]);
    const load = async () => {
        const { count } = await supabase
            .from('chant_likes')
            .select('*', { count: 'exact', head: true })
            .eq('wish_id', wishId);
        setCount(count || 0);
        const key = `liked-${wishId}`;
        setLiked(localStorage.getItem(key) === 'true');
    };
    const like = async () => {
        if (liked)
            return;
        await supabase.from('chant_likes').insert({ wish_id: wishId, user_name: '匿名' });
        const key = `liked-${wishId}`;
        localStorage.setItem(key, 'true');
        setLiked(true);
        setCount((c) => c + 1);
    };
    return (_jsxs("button", { onClick: like, className: `px-3 py-2 rounded text-white font-semibold ${liked ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'} transition-colors`, style: { color: '#ffffff' }, children: ["\u2764\uFE0F \u611B\u5FC3\u652F\u6301\uFF08", count, "\uFF09"] }));
}
