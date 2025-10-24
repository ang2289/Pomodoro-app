import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export default function LightButton({ chantWishId, initialCount = 0 }) {
    const [count, setCount] = useState(initialCount);
    const [isLitted, setIsLitted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const localKey = `lighted_${chantWishId}`;
    useEffect(() => {
        const hasLit = localStorage.getItem(localKey);
        if (hasLit)
            setIsLitted(true);
    }, [chantWishId]);
    const handleLight = async () => {
        if (isLitted)
            return;
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);
        const { error } = await supabase.from('chant_lights').insert({
            chant_wish_id: chantWishId
        });
        if (!error) {
            setCount((prev) => prev + 1);
            setIsLitted(true);
            localStorage.setItem(localKey, '1');
        }
        else {
            alert('點燈失敗，請稍後再試');
            console.error(error);
        }
    };
    return (_jsx("div", { className: "text-center mt-2", children: _jsxs("button", { onClick: handleLight, disabled: isLitted, className: `text-orange-500 text-lg flex items-center gap-1 justify-center transition-transform ${isAnimating ? 'scale-125 animate-ping' : ''} ${isLitted ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`, children: ["\uD83E\uDE94 ", isLitted ? '已點燈' : '我要點燈', "\uFF08", count, "\uFF09"] }) }));
}
